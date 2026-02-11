'use client';

import { useState, useEffect } from 'react';
import { createLogger } from '@/lib/logger';
import { MIN_IDEA_LENGTH, MAX_IDEA_LENGTH } from '@/lib/validation';
import Alert from './Alert';
import Button from './Button';
import InputWithValidation from './InputWithValidation';
import AutoSaveIndicator from './AutoSaveIndicator';

interface IdeaInputProps {
  onSubmit: (idea: string, ideaId: string) => void;
}

const validateIdea = (idea: string): string | null => {
  if (idea.trim().length < MIN_IDEA_LENGTH) {
    return `Idea must be at least ${MIN_IDEA_LENGTH} characters.`;
  }
  if (idea.length > MAX_IDEA_LENGTH) {
    return `Idea must be at most ${MAX_IDEA_LENGTH} characters.`;
  }
  return null;
};

export default function IdeaInput({ onSubmit }: IdeaInputProps) {
  const logger = createLogger('IdeaInput');
  const [idea, setIdea] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMac, setIsMac] = useState(false);

  // Detect platform for keyboard shortcut display
  useEffect(() => {
    setIsMac(navigator.platform.includes('Mac'));
  }, []);

  const handleIdeaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setIdea(newValue);
    setValidationError(validateIdea(newValue));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Cmd/Ctrl + Enter
    if (
      (e.metaKey || e.ctrlKey) &&
      e.key === 'Enter' &&
      !isSubmitting &&
      idea.trim() &&
      !validationError
    ) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateIdea(idea);
    if (validationError) {
      setValidationError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save idea');
      }

      const data = await response.json();
      const ideaId = data.data.id;

      onSubmit(idea.trim(), ideaId);
    } catch (err) {
      logger.errorWithContext('Failed to save idea', {
        component: 'IdeaInput',
        action: 'handleSubmit',
        metadata: {
          ideaLength: idea.length,
          error: err instanceof Error ? err.message : 'Unknown error',
        },
      });
      setError('Failed to save your idea. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 fade-in" noValidate>
      <InputWithValidation
        id="idea-input"
        name="idea"
        label="What's your idea?"
        value={idea}
        onChange={handleIdeaChange}
        onKeyDown={handleKeyDown}
        placeholder="Describe your idea in a few sentences. For example: 'I want to build a mobile app that helps people track their daily habits and stay motivated to achieve their goals.'"
        helpText={`Be as specific or as general as you'd like. We'll help you clarify details. Press ${isMac ? '⌘' : 'Ctrl'} + Enter to submit.`}
        multiline={true}
        minLength={MIN_IDEA_LENGTH}
        maxLength={MAX_IDEA_LENGTH}
        showCharCount={true}
        error={validationError || undefined}
        required={true}
        disabled={isSubmitting}
        className="min-h-[120px]"
      />

      {error && (
        <div className="slide-up">
          <Alert type="error" onClose={() => setError(null)}>
            <p className="text-sm">{error}</p>
          </Alert>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-2 text-sm text-gray-600"
            aria-label="Keyboard shortcut: Command Enter to submit"
          >
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-gray-100 border border-gray-400 rounded text-xs font-sans font-medium text-gray-800">
              {isMac ? '⌘' : 'Ctrl'}
            </kbd>
            <kbd className="hidden sm:inline-flex items-center px-2 py-1 bg-gray-100 border border-gray-400 rounded text-xs font-sans font-medium text-gray-800">
              Enter
            </kbd>
            <span className="hidden sm:inline text-gray-600">to submit</span>
          </div>
          <AutoSaveIndicator value={idea} />
        </div>
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={!idea.trim() || !!validationError}
        >
          {isSubmitting ? 'Processing...' : 'Start Clarifying →'}
        </Button>
      </div>
    </form>
  );
}
