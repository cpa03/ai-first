'use client';

import { useState } from 'react';
import { createLogger } from '@/lib/logger';
import Alert from './Alert';
import Button from './Button';
import InputWithValidation from './InputWithValidation';

interface IdeaInputProps {
  onSubmit: (idea: string, ideaId: string) => void;
}

const MIN_IDEA_LENGTH = 10;
const MAX_IDEA_LENGTH = 500;

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

  const handleIdeaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setIdea(newValue);
    setValidationError(validateIdea(newValue));
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
        placeholder="Describe your idea in a few sentences. For example: 'I want to build a mobile app that helps people track their daily habits and stay motivated to achieve their goals.'"
        helpText="Be as specific or as general as you'd like. We'll help you clarify details."
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
          <Alert type="error">
            <p className="text-sm">{error}</p>
          </Alert>
        </div>
      )}

      <div className="flex justify-end">
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
