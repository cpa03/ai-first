'use client';

import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { createLogger } from '@/lib/logger';
import { fetchWithTimeout } from '@/lib/api-client';
import { triggerHapticFeedback } from '@/lib/utils';
import { MIN_IDEA_LENGTH, MAX_IDEA_LENGTH } from '@/lib/validation';
import {
  MESSAGES,
  PLACEHOLDERS,
  COMPONENT_CONFIG,
  HTTP_HEADERS,
  API_ENDPOINTS,
} from '@/lib/config';
import Alert from './Alert';
import Button from './Button';
import InputWithValidation from './InputWithValidation';
import AutoSaveIndicator from './AutoSaveIndicator';
import SuccessCelebration from './SuccessCelebration';
import StatusAnnouncer from './StatusAnnouncer';
import IdeaReadyIndicator from './IdeaReadyIndicator';

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
  const [successMessage, setSuccessMessage] = useState('');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const encouragementMessages = MESSAGES.IDEA_INPUT.ENCOURAGEMENT;

  // Micro-UX improvement: Show exact characters needed when close to minimum
  const getCharactersNeededMessage = useCallback(() => {
    const length = idea.trim().length;
    const charsNeeded = MIN_IDEA_LENGTH - length;

    if (
      length >=
        MIN_IDEA_LENGTH *
          COMPONENT_CONFIG.IDEA_INPUT.PROGRESS_SHOW_CHARS_THRESHOLD &&
      length < MIN_IDEA_LENGTH
    ) {
      return {
        charsNeeded,
        isNearMinimum:
          length >=
          MIN_IDEA_LENGTH * COMPONENT_CONFIG.IDEA_INPUT.NEAR_MINIMUM_THRESHOLD,
      };
    }
    return null;
  }, [idea]);

  const charactersNeededData = getCharactersNeededMessage();

  const getEncouragementMessage = useCallback(() => {
    const length = idea.trim().length;
    const { LOW, MEDIUM, HIGH } =
      COMPONENT_CONFIG.IDEA_INPUT.ENCOURAGEMENT_THRESHOLDS;
    if (length === 0) return null;
    if (length < MIN_IDEA_LENGTH * LOW) return encouragementMessages[0];
    if (length < MIN_IDEA_LENGTH) return encouragementMessages[1];
    if (length < MAX_IDEA_LENGTH * MEDIUM) return encouragementMessages[2];
    if (length < MAX_IDEA_LENGTH * LOW) return encouragementMessages[3];
    if (length < MAX_IDEA_LENGTH * HIGH) return encouragementMessages[6];
    return null;
  }, [idea, encouragementMessages]);

  const writingProgress = Math.min(
    (idea.trim().length / MAX_IDEA_LENGTH) * 100,
    100
  );

  const focusInput = useCallback(() => {
    const input = inputRef.current;
    if (input) {
      requestAnimationFrame(() => {
        input.focus();
      });
    }
  }, []);

  // Detect platform for keyboard shortcut display
  useEffect(() => {
    setIsMac(navigator.platform.includes('Mac'));
  }, []);

  const handleIdeaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setIdea(e.target.value);
      setValidationError(validateIdea(e.target.value));
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
        const response = await fetchWithTimeout(API_ENDPOINTS.IDEAS, {
          method: 'POST',
          headers: HTTP_HEADERS.JSON_CONTENT_TYPE,
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
        setSuccessMessage('Idea submitted successfully! Redirecting...');
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

  // Micro-UX improvement: Add Escape key to clear input field
  // This provides a quick way for keyboard users to reset the input
  const handleClearWithKeyboard = useCallback(() => {
    if (idea.trim()) {
      triggerHapticFeedback();
      setIdea('');
      setValidationError(null);
      inputRef.current?.focus();
    }
  }, [idea]);

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
      // Clear input on Escape - common pattern in modern forms
      // Only if input has content and not currently submitting
      if (e.key === 'Escape' && idea.trim() && !isSubmitting) {
        e.preventDefault();
        handleClearWithKeyboard();
      }
    },
    [isSubmitting, idea, validationError, handleSubmit, handleClearWithKeyboard]
  );

  const handleCelebrationComplete = useCallback(() => {
    if (submittedIdeaData) {
      onSubmit(submittedIdeaData.idea, submittedIdeaData.ideaId);
    }
  }, [submittedIdeaData, onSubmit]);

  const handleErrorClose = useCallback(() => {
    setError(null);
    focusInput();
  }, [focusInput]);

  return (
    <>
      <SuccessCelebration
        show={showCelebration}
        onComplete={handleCelebrationComplete}
        duration={COMPONENT_CONFIG.BLUEPRINT.GENERATION_DELAY_MS}
      />
      <StatusAnnouncer
        message={successMessage}
        politeness="polite"
        triggered={!!successMessage}
      />
      <form onSubmit={handleSubmit} className="space-y-6 fade-in" noValidate>
        <InputWithValidation
          ref={inputRef}
          id="idea-input"
          name="idea"
          label="What's your idea?"
          value={idea}
          onChange={handleIdeaChange}
          onKeyDown={handleKeyDown}
          placeholder={PLACEHOLDERS.IDEA_INPUT}
          helpText={`Be as specific or as general as you'd like. We'll help you clarify details. ${MESSAGES.IDEA_INPUT.KEYBOARD_SHORTCUT_LABEL(isMac)}. ${MESSAGES.IDEA_INPUT.NEW_LINE_SHORTCUT_LABEL(isMac)}. Press Escape to clear.`}
          multiline={true}
          minLength={MIN_IDEA_LENGTH}
          maxLength={MAX_IDEA_LENGTH}
          showCharCount={true}
          clearable={true}
          error={validationError || undefined}
          required={true}
          disabled={isSubmitting}
          autoFocus
          className="min-h-[120px]"
        />

        {charactersNeededData ? (
          <p
            className={`text-sm animate-fade-in flex items-center gap-2 ${
              charactersNeededData.isNearMinimum
                ? 'text-amber-600 font-medium'
                : 'text-primary-600'
            }`}
            role="status"
            aria-live="polite"
          >
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
              {charactersNeededData.charsNeeded}
            </span>
            {charactersNeededData.isNearMinimum
              ? `Almost there! Just ${charactersNeededData.charsNeeded} more to go`
              : `${charactersNeededData.charsNeeded} more character${charactersNeededData.charsNeeded !== 1 ? 's' : ''} needed`}
          </p>
        ) : (
          getEncouragementMessage() && (
            <p
              className="text-sm text-primary-600 animate-fade-in"
              role="status"
              aria-live="polite"
            >
              {getEncouragementMessage()}
            </p>
          )
        )}

        {writingProgress > 5 && (
          <div className="space-y-2">
            <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full transition-all duration-300 ease-out rounded-full ${
                  idea.trim().length >= MIN_IDEA_LENGTH
                    ? 'bg-gradient-to-r from-green-400 to-green-600'
                    : 'bg-gradient-to-r from-primary-400 to-primary-600'
                }`}
                style={{ width: `${writingProgress}%` }}
                role="progressbar"
                aria-valuenow={Math.round(writingProgress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Writing progress"
              />
            </div>
            <IdeaReadyIndicator
              isReady={
                idea.trim().length >= MIN_IDEA_LENGTH && !validationError
              }
            />
          </div>
        )}

        {error && (
          <div className="slide-up">
            <Alert type="error" onClose={handleErrorClose}>
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
            enableTransition
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
