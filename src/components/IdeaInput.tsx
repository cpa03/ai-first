'use client';

import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { createLogger } from '@/lib/logger';
import { fetchWithTimeout } from '@/lib/api-client';
import { triggerHapticFeedback } from '@/lib/utils';
import { useClipboard } from '@/hooks/useClipboard';
import {
  MIN_IDEA_LENGTH,
  MAX_IDEA_LENGTH,
  validateIdeaToMessage,
} from '@/lib/validation';
import { MESSAGES, PLACEHOLDERS } from '@/lib/config/ui';
import {
  ANIMATION_CONFIG,
  COMPONENT_CONFIG,
  HTTP_HEADERS,
  TRANSITION_CLASSES,
  TEXT_COLOR_CLASSES,
  PROGRESS_BAR_A11Y,
  GRAY_CLASSES,
  GRAY_TEXT_COMBOS,
} from '@/lib/config';
import { API_ENDPOINTS } from '@/lib/config/api-endpoints';
import {
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  GRADIENT_PATTERNS,
  TYPOGRAPHY_CLASSES,
  KBD_CLASSES,
  TEXT_COLORS,
  BG_COLORS,
} from '@/lib/config/theme';
import { IDEA_INPUT_LABELS } from '@/lib/config/component-labels';
import { API_ERROR_MESSAGES } from '@/lib/config/error-messages';
import { PLATFORM } from '@/lib/dom-utils';
import Alert from './Alert';
import Button from './Button';
import InputWithValidation from './InputWithValidation';
import AutoSaveIndicator from './AutoSaveIndicator';
import SuccessCelebration from './SuccessCelebration';
import StatusAnnouncer from './StatusAnnouncer';
import IdeaReadyIndicator from './IdeaReadyIndicator';
import Tooltip from './Tooltip';
import TypingIndicator from './TypingIndicator';
import { useConfetti } from '@/hooks/useConfetti';

interface IdeaInputProps {
  onSubmit: (idea: string, ideaId: string) => void;
}

// PERFORMANCE: Memoize IdeaInput to prevent re-renders when parent components update
// This component only needs to re-render when its own state changes or onSubmit prop changes
function IdeaInputComponent({ onSubmit }: IdeaInputProps) {
  const logger = createLogger('IdeaInput');
  const [idea, setIdea] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMac, setIsMac] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [submittedIdeaData, setSubmittedIdeaData] = useState<{
    idea: string;
    ideaId: string;
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [milestoneReached, setMilestoneReached] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { particles: milestoneParticles, fire: fireMilestoneConfetti } =
    useConfetti();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const prevMeetsMinimumRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleOnPaste = useCallback((text: string) => {
    setIdea(text);
    setValidationError(validateIdeaToMessage(text));
    inputRef.current?.focus();
  }, []);

  const { paste, hasPasted: pasteSuccess } = useClipboard({
    onPaste: handleOnPaste,
    duration: COMPONENT_CONFIG.IDEA_INPUT.PASTE_SUCCESS_DURATION_MS,
  });

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
    setIsMac(PLATFORM.isMac());
  }, []);

  // Cleanup paste success timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Micro-UX: Milestone celebration when user first reaches minimum length
  // Provides delightful positive feedback at the exact moment the idea becomes submittable
  useEffect(() => {
    const meetsMinimum = idea.trim().length >= MIN_IDEA_LENGTH;
    const justReachedMinimum = meetsMinimum && !prevMeetsMinimumRef.current;

    if (justReachedMinimum && !milestoneReached) {
      setMilestoneReached(true);
      triggerHapticFeedback();
      fireMilestoneConfetti();

      // Auto-clear the milestone celebration after a brief moment
      const timer = setTimeout(() => {
        setMilestoneReached(false);
      }, COMPONENT_CONFIG.IDEA_INPUT.MILESTONE_CELEBRATION_DURATION_MS);
      return () => clearTimeout(timer);
    }

    // Reset milestone if user edits below minimum
    if (!meetsMinimum) {
      setMilestoneReached(false);
    }

    prevMeetsMinimumRef.current = meetsMinimum;
  }, [idea, milestoneReached, fireMilestoneConfetti]);

  const handleIdeaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setIdea(e.target.value);
      setValidationError(validateIdeaToMessage(e.target.value));

      setIsTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, ANIMATION_CONFIG.TYPING_INDICATOR.STATE_DURATION);
    },
    []
  );

  // PERFORMANCE: Define handleSubmit first so it can be referenced in handleKeyDown
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validationError = validateIdeaToMessage(idea);
      if (validationError) {
        setValidationError(validationError);
        // Micro-UX: Trigger shake animation on validation error
        setIsShaking(true);
        setTimeout(
          () => setIsShaking(false),
          COMPONENT_CONFIG.IDEA_INPUT.SHAKE_DURATION_MS
        );
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
        setSuccessMessage(IDEA_INPUT_LABELS.SUCCESS_MESSAGE);
      } catch (err) {
        logger.errorWithContext('Failed to save idea', {
          component: 'IdeaInput',
          action: 'handleSubmit',
          metadata: {
            ideaLength: idea.length,
            error:
              err instanceof Error
                ? err.message
                : API_ERROR_MESSAGES.FALLBACK.UNKNOWN_ERROR,
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
  const handleClear = useCallback(() => {
    if (idea.trim()) {
      triggerHapticFeedback();
      setIdea('');
      setValidationError(null);
      inputRef.current?.focus();
    }
  }, [idea]);

  // Micro-UX improvement: Quick paste from clipboard when input is empty
  // Reduces friction for users who have their idea already copied
  // Shows brief success feedback to confirm the paste action
  const handlePasteFromClipboard = useCallback(async () => {
    await paste();
  }, [paste]);

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
        handleClear();
      }
      // Micro-UX: Paste from clipboard on Ctrl/Cmd + Shift + V when input is empty
      // Provides quick keyboard access to paste functionality
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        e.key === 'V' &&
        !idea.trim() &&
        !isSubmitting
      ) {
        e.preventDefault();
        handlePasteFromClipboard();
      }
    },
    [
      isSubmitting,
      idea,
      validationError,
      handleSubmit,
      handleClear,
      handlePasteFromClipboard,
    ]
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
          label={IDEA_INPUT_LABELS.INPUT_LABEL}
          value={idea}
          onChange={handleIdeaChange}
          onKeyDown={handleKeyDown}
          placeholder={PLACEHOLDERS.IDEA_INPUT}
          helpText={`${IDEA_INPUT_LABELS.HELP_TEXT_PREFIX} ${MESSAGES.IDEA_INPUT.KEYBOARD_SHORTCUT_LABEL(isMac)}. ${MESSAGES.IDEA_INPUT.NEW_LINE_SHORTCUT_LABEL(isMac)}. ${IDEA_INPUT_LABELS.HELP_TEXT_ESCAPE_HINT}. ${IDEA_INPUT_LABELS.HELP_TEXT_PASTE_HINT}.`}
          multiline={true}
          minLength={MIN_IDEA_LENGTH}
          maxLength={MAX_IDEA_LENGTH}
          showCharCount={true}
          clearable={true}
          error={validationError || undefined}
          required={true}
          disabled={isSubmitting}
          autoFocus
          className={`${COMPONENT_CONFIG.IDEA_INPUT.MIN_HEIGHT_CLASS} ${isShaking ? 'animate-shake' : ''}`}
        />

        {milestoneReached && (
          <div className="relative">
            <div
              className={`flex items-center gap-2 text-sm ${TEXT_COLORS.SUCCESS_DARK} font-medium animate-fade-in`}
              role="status"
              aria-live="polite"
            >
              <span
                className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${BG_COLORS.SUCCESS_LIGHT} animate-success-pop`}
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox={SVG_VIEWBOX.STANDARD}
                  stroke="currentColor"
                  strokeWidth={SVG_STROKE_WIDTHS.THICK}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              {IDEA_INPUT_LABELS.MILESTONE_MESSAGE}
            </div>
            {/* Micro-UX: Confetti burst at milestone moment for delightful positive feedback */}
            {milestoneParticles.map((particle) => (
              <span
                key={particle.id}
                className="absolute rounded-full pointer-events-none animate-copy-confetti"
                style={
                  {
                    left: '50%',
                    top: '50%',
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    backgroundColor: particle.color,
                    '--confetti-x': `${particle.x}px`,
                    '--confetti-y': `${particle.y}px`,
                    animationDelay: `${particle.delay}ms`,
                  } as React.CSSProperties
                }
                aria-hidden="true"
              />
            ))}
          </div>
        )}

        {!milestoneReached && charactersNeededData ? (
          <p
            className={`text-sm animate-fade-in flex items-center gap-2 ${
              charactersNeededData.isNearMinimum
                ? `${TEXT_COLOR_CLASSES.WARNING_LIGHT} font-medium`
                : TEXT_COLOR_CLASSES.BRAND
            }`}
            role="status"
            aria-live="polite"
          >
            <span
              className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs ${TYPOGRAPHY_CLASSES.BOLD}`}
            >
              {charactersNeededData.charsNeeded}
            </span>
            {charactersNeededData.isNearMinimum
              ? IDEA_INPUT_LABELS.NEAR_MINIMUM_MESSAGE(
                  charactersNeededData.charsNeeded
                )
              : IDEA_INPUT_LABELS.CHARS_NEEDED_MESSAGE(
                  charactersNeededData.charsNeeded
                )}
          </p>
        ) : (
          !milestoneReached &&
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

        <TypingIndicator
          isTyping={isTyping}
          hideDelay={ANIMATION_CONFIG.TYPING_INDICATOR.HIDE_DELAY}
          className="ml-2"
        />

        {writingProgress > 5 && (
          <div className="space-y-2">
            <div
              className={`relative h-1.5 ${GRAY_CLASSES.BG_200} rounded-full overflow-hidden`}
            >
              <div
                className={`absolute left-0 top-0 h-full ${TRANSITION_CLASSES.SLOW_EASE_OUT} rounded-full ${
                  idea.trim().length >= MIN_IDEA_LENGTH
                    ? GRADIENT_PATTERNS.SUCCESS_BUTTON
                    : GRADIENT_PATTERNS.PRIMARY_BUTTON
                }`}
                style={{ width: `${writingProgress}%` }}
                role="progressbar"
                aria-valuenow={Math.round(writingProgress)}
                aria-valuemin={PROGRESS_BAR_A11Y.VALUE_MIN}
                aria-valuemax={PROGRESS_BAR_A11Y.VALUE_MAX}
                aria-label={IDEA_INPUT_LABELS.WRITING_PROGRESS_ARIA_LABEL}
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
              className={`flex items-center gap-2 text-sm ${TEXT_COLOR_CLASSES.BODY}`}
              aria-label={MESSAGES.IDEA_INPUT.KEYBOARD_SHORTCUT_LABEL(isMac)}
            >
              <kbd className={KBD_CLASSES}>{isMac ? '⌘' : 'Ctrl'}</kbd>
              <kbd className={KBD_CLASSES}>Enter</kbd>
              <span className={`hidden sm:inline ${TEXT_COLOR_CLASSES.BODY}`}>
                {IDEA_INPUT_LABELS.KEYBOARD_SHORTCUT_HINT}
              </span>
            </div>
            <AutoSaveIndicator value={idea} />
          </div>
          <div className="flex items-center gap-3">
            {!idea.trim() && !isSubmitting && (
              <Tooltip
                content={IDEA_INPUT_LABELS.PASTE_ARIA_LABEL}
                shortcut={isMac ? ['⌘', '⇧', 'V'] : ['Ctrl', 'Shift', 'V']}
                position="top"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handlePasteFromClipboard}
                  aria-label={IDEA_INPUT_LABELS.PASTE_ARIA_LABEL}
                  className={`${TRANSITION_CLASSES.DEFAULT} ${
                    pasteSuccess
                      ? `${TEXT_COLORS.SUCCESS_MEDIUM} ${BG_COLORS.SUCCESS_VERY_LIGHT} hover:${BG_COLORS.SUCCESS_LIGHT}`
                      : `${TEXT_COLOR_CLASSES.MUTED} ${GRAY_TEXT_COMBOS.SUBTLE}`
                  }`}
                >
                  {pasteSuccess ? (
                    <svg
                      className={`w-4 h-4 mr-1 ${TEXT_COLORS.SUCCESS_MEDIUM}`}
                      fill="none"
                      viewBox={SVG_VIEWBOX.STANDARD}
                      stroke="currentColor"
                      strokeWidth={SVG_STROKE_WIDTHS.THICK}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      viewBox={SVG_VIEWBOX.STANDARD}
                      stroke="currentColor"
                      strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  )}
                  {pasteSuccess ? 'Pasted!' : IDEA_INPUT_LABELS.PASTE_BUTTON}
                </Button>
              </Tooltip>
            )}
            {idea.trim() && !isSubmitting && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                aria-label={IDEA_INPUT_LABELS.CLEAR_ARIA_LABEL}
                className={`${TEXT_COLOR_CLASSES.MUTED} ${GRAY_TEXT_COMBOS.SUBTLE}`}
              >
                {IDEA_INPUT_LABELS.CLEAR_BUTTON}
              </Button>
            )}
            <Tooltip
              content={IDEA_INPUT_LABELS.SUBMIT_TOOLTIP}
              shortcut={
                isSubmitting
                  ? undefined
                  : [...IDEA_INPUT_LABELS.SUBMIT_SHORTCUT]
              }
              position="top"
            >
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                loadingText={MESSAGES.IDEA_INPUT.PROCESSING_BUTTON}
                disabled={!idea.trim() || !!validationError}
                attention={!!idea.trim() && !validationError && !isSubmitting}
                enableTransition
              >
                {MESSAGES.IDEA_INPUT.SUBMIT_BUTTON}
              </Button>
            </Tooltip>
          </div>
        </div>
      </form>
    </>
  );
}

IdeaInputComponent.displayName = 'IdeaInput';

export default memo(IdeaInputComponent);
