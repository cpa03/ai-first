'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { createLogger } from '@/lib/logger';
import { fetchWithTimeout } from '@/lib/api-client';
import { MIN_IDEA_LENGTH, MAX_IDEA_LENGTH } from '@/lib/validation';
import { MESSAGES, PLACEHOLDERS } from '@/lib/config';
import Alert from './Alert';
import Button from './Button';
import InputWithValidation from './InputWithValidation';
import AutoSaveIndicator from './AutoSaveIndicator';
import SuccessCelebration from './SuccessCelebration';

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

// PERFORMANCE: Memoize IdeaInput to prevent re-renders when parent components update
// This component only needs to re-render when its own state changes or onSubmit prop changes
function IdeaInputComponent({ onSubmit }: IdeaInputProps) {
  const logger = createLogger('IdeaInput');
  const [idea, setIdea] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMac, setIsMac] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [submittedIdeaData, setSubmittedIdeaData] = useState<{
    idea: string;
    ideaId: string;
  } | null>(null);

  // Detect platform for keyboard shortcut display
  useEffect(() => {
    setIsMac(navigator.platform.includes('Mac'));
  }, []);

  const handleIdeaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setIdea(newValue);
      setValidationError(validateIdea(newValue));
    },
    []
  );

  // PERFORMANCE: Define handleSubmit first so it can be referenced in handleKeyDown
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validationError = validateIdea(idea);
      if (validationError) {
        setValidationError(validationError);
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const response = await fetchWithTimeout('/api/ideas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idea }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || MESSAGES.ERRORS.FAILED_SAVE_IDEA);
        }

        const data = await response.json();
        const ideaId = data.data.id;

        setSubmittedIdeaData({ idea: idea.trim(), ideaId });
        setShowCelebration(true);
      } catch (err) {
        logger.errorWithContext('Failed to save idea', {
          component: 'IdeaInput',
          action: 'handleSubmit',
          metadata: {
            ideaLength: idea.length,
            error: err instanceof Error ? err.message : 'Unknown error',
          },
        });
        setError(MESSAGES.ERRORS.FAILED_SAVE_IDEA);
      } finally {
        setIsSubmitting(false);
      }
    },
    [idea, logger]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
    },
    [isSubmitting, idea, validationError, handleSubmit]
  );

  const handleCelebrationComplete = useCallback(() => {
    if (submittedIdeaData) {
      onSubmit(submittedIdeaData.idea, submittedIdeaData.ideaId);
    }
  }, [submittedIdeaData, onSubmit]);

  return (
    <>
      <SuccessCelebration
        show={showCelebration}
        onComplete={handleCelebrationComplete}
        duration={1500}
      />
      <form onSubmit={handleSubmit} className="space-y-6 fade-in" noValidate>
        <InputWithValidation
          id="idea-input"
          name="idea"
          label="What's your idea?"
          value={idea}
          onChange={handleIdeaChange}
          onKeyDown={handleKeyDown}
          placeholder={PLACEHOLDERS.IDEA_INPUT}
          helpText={`Be as specific or as general as you'd like. We'll help you clarify details. ${MESSAGES.IDEA_INPUT.KEYBOARD_SHORTCUT_LABEL(isMac)}`}
          multiline={true}
          minLength={MIN_IDEA_LENGTH}
          maxLength={MAX_IDEA_LENGTH}
          showCharCount={true}
          clearable={true}
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
              aria-label={MESSAGES.IDEA_INPUT.KEYBOARD_SHORTCUT_LABEL(isMac)}
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
            attention={!!idea.trim() && !validationError && !isSubmitting}
          >
            {isSubmitting
              ? MESSAGES.IDEA_INPUT.PROCESSING_BUTTON
              : MESSAGES.IDEA_INPUT.SUBMIT_BUTTON}
          </Button>
        </div>
      </form>
    </>
  );
}

IdeaInputComponent.displayName = 'IdeaInput';

export default memo(IdeaInputComponent);
