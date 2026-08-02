'use client';

import { memo, useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  MIN_ANSWER_LENGTH,
  MAX_ANSWER_LENGTH,
  MIN_SHORT_ANSWER_LENGTH,
  MAX_SHORT_ANSWER_LENGTH,
} from '@/lib/validation';
import { triggerHapticFeedback } from '@/lib/utils';
import {
  COMPONENT_CONFIG,
  MESSAGES,
  PLACEHOLDERS,
  INPUT_STYLES,
  TEXT_COLORS,
  TEXT_COLOR_CLASSES,
  BG_COLORS,
  BG_COLOR_CLASSES,
  BORDER_COLOR_CLASSES,
  COMPONENT_DEFAULTS,
  LABELS,
  ANIMATION_DELAYS,
  ANIMATION_CONFIG,
  ANIMATION_VALUES,
  DURATION_TAILWIND,
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  UI_CONFIG,
  INPUT_HEIGHT_CLASSES,
  CONTAINER_WIDTHS,
  CLARIFICATION_FLOW_LABELS,
  CARD_PATTERNS,
  TRANSITION_CLASSES,
  CLARIFICATION_FLOW_QUESTION_HEADING,
  CLARIFICATION_FLOW_INFO_TEXT,
  CLARIFICATION_FLOW_KEYBOARD_HINT,
  CLARIFICATION_FLOW_STEP_INDICATOR,
  CLARIFICATION_FLOW_STEP_TEXT,
  CLARIFICATION_FLOW_STEP_SEPARATOR,
  CLARIFICATION_FLOW_INPUT_LABEL,
  CLARIFICATION_FLOW_STEP_BUTTON_BASE,
  CLARIFICATION_FLOW_STEP_BUTTON_CURRENT,
  GRAY_CLASSES,
  ICON_SIZES,
  ICON_PATTERNS,
  CLARIFICATION_TIMER_CONFIG,
  PY_CLASSES,
  SPACE_Y_PATTERNS,
  FLEX_PATTERNS,
  SPACING_PATTERNS,
} from '@/lib/config';
import {
  CLARIFICATION_ELEMENT_IDS,
  ARIA_HEADING_IDS,
} from '@/lib/config/element-ids';
import { isFocusedOnInput } from '@/lib/dom-utils';
import Alert from '@/components/Alert';
import Button from '@/components/Button';
import ProgressStepper from '@/components/ProgressStepper';
import InputWithValidation from '@/components/InputWithValidation';
import LoadingSpinner from '@/components/LoadingSpinner';
import LoadingAnnouncer from '@/components/LoadingAnnouncer';
import StatusAnnouncer from '@/components/StatusAnnouncer';
import CopyButton from '@/components/CopyButton';
import StepCelebration from '@/components/StepCelebration';
import Skeleton from '@/components/Skeleton';
import Tooltip from '@/components/Tooltip';
import { CapsLockWarning } from '@/components/CapsLockWarning';
import { useCapsLock } from '@/hooks/useCapsLock';
import { useClarificationSession } from '@/hooks/useClarificationSession';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface ClarificationFlowProps {
  idea: string;
  ideaId?: string;
  onComplete: (answers: Record<string, string>) => Promise<void>;
  onBackToEdit?: () => void;
}

function ClarificationFlow({
  idea,
  ideaId,
  onComplete,
  onBackToEdit,
}: ClarificationFlowProps) {
  const router = useRouter();
  const {
    loading,
    error,
    questions,
    currentStep,
    currentQuestion,
    progress,
    steps,
    currentAnswer,
    showCelebration,
    isSubmitting,
    isMac,
    textInputRef,
    textareaRef,
    selectRef,
    setCurrentAnswer,
    handleNext,
    handlePrevious,
    handleKeyDown,
    goToStep,
    elapsedSeconds,
    estimatedRemainingSeconds,
  } = useClarificationSession(idea, ideaId, onComplete);

  const detailsRef = useRef<HTMLDetailsElement>(null);
  const questionSectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  }, []);
  const {
    isCapsLockOn,
    handleKeyDown: capsLockKeyDown,
    handleKeyUp: capsLockKeyUp,
    handleBlur: capsLockBlur,
  } = useCapsLock();
  const [referenceAnnouncement, setReferenceAnnouncement] = useState('');
  const [referenceTriggered, setReferenceTriggered] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>(
    'forward'
  );
  const [estimatePulse, setEstimatePulse] = useState(false);
  const prevEstimateRef = useRef<number | null>(null);
  const prevStepRef = useRef(currentStep);
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const pasteSuccessTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Micro-UX: Clean up paste success timeout on unmount
  useEffect(() => {
    return () => {
      if (pasteSuccessTimeoutRef.current) {
        clearTimeout(pasteSuccessTimeoutRef.current);
      }
    };
  }, []);

  // Micro-UX: Smooth scroll to question section when step changes
  // Ensures the new question is visible on screen after navigation,
  // especially important on mobile where the keyboard may be open
  useEffect(() => {
    if (
      questionSectionRef.current &&
      typeof questionSectionRef.current.scrollIntoView === 'function'
    ) {
      questionSectionRef.current.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
      });
    }
  }, [currentStep, prefersReducedMotion]);

  // Micro-UX: Track navigation direction for directional slide animation
  // Gives users visual context about whether they're moving forward or backward
  useEffect(() => {
    if (currentStep > prevStepRef.current) {
      setSlideDirection('forward');
    } else if (currentStep < prevStepRef.current) {
      setSlideDirection('backward');
    }
    prevStepRef.current = currentStep;
  }, [currentStep]);

  // Micro-UX: Apply directional slide animation after DOM updates
  // Uses double requestAnimationFrame to ensure browser has painted new content
  // before applying the animation class, preventing animation skip
  useEffect(() => {
    if (prefersReducedMotion) return;

    const animationFrame = requestAnimationFrame(() => {
      const frame = requestAnimationFrame(() => {
        const el = questionSectionRef.current;
        if (!el) return;

        const animClass =
          slideDirection === 'forward'
            ? 'animate-slide-from-right'
            : 'animate-slide-from-left';

        el.classList.add(animClass);

        const handleAnimationEnd = () => {
          el.classList.remove(animClass);
          el.removeEventListener('animationend', handleAnimationEnd);
        };
        el.addEventListener('animationend', handleAnimationEnd);
      });
      return () => cancelAnimationFrame(frame);
    });
    return () => cancelAnimationFrame(animationFrame);
  }, [currentStep, slideDirection, prefersReducedMotion]);

  // Micro-UX: Auto-focus input when step changes for seamless keyboard navigation
  // Users can immediately type their answer without clicking/tapping the input field.
  // On mobile this is especially important — it keeps the keyboard open between questions
  // instead of forcing users to tap the input again to reopen it.
  useEffect(() => {
    if (
      loading ||
      questions.length === 0 ||
      !currentQuestion ||
      showCelebration ||
      isSubmitting
    )
      return;

    // Brief delay ensures DOM is ready after key-triggered remount
    const timer = setTimeout(() => {
      if (currentQuestion.type === 'textarea' && textareaRef.current) {
        textareaRef.current.focus();
      } else if (currentQuestion.type === 'text' && textInputRef.current) {
        textInputRef.current.focus();
      } else if (currentQuestion.type === 'select' && selectRef.current) {
        selectRef.current.focus();
      }
    }, ANIMATION_CONFIG.INPUT_FOCUS_DELAY);

    return () => clearTimeout(timer);
  }, [
    currentStep,
    loading,
    questions.length,
    currentQuestion,
    showCelebration,
    isSubmitting,
    textareaRef,
    textInputRef,
    selectRef,
  ]);

  // Micro-UX: Pulse animation when estimated time remaining changes
  // Gives users a subtle visual cue that the estimate has been recalculated
  useEffect(() => {
    if (estimatedRemainingSeconds === null || prefersReducedMotion) return;
    if (
      prevEstimateRef.current !== null &&
      prevEstimateRef.current !== estimatedRemainingSeconds
    ) {
      setEstimatePulse(true);
      const timer = setTimeout(
        () => setEstimatePulse(false),
        CLARIFICATION_TIMER_CONFIG.PULSE_DURATION_MS
      );
      return () => clearTimeout(timer);
    }
    prevEstimateRef.current = estimatedRemainingSeconds;
  }, [estimatedRemainingSeconds, prefersReducedMotion]);

  const handleToggleReference = useCallback(() => {
    const details = detailsRef.current;
    if (!details) return;
    triggerHapticFeedback();
    setReferenceAnnouncement(
      details.open
        ? CLARIFICATION_FLOW_LABELS.REFERENCE_EXPANDED
        : CLARIFICATION_FLOW_LABELS.REFERENCE_COLLAPSED
    );
    setReferenceTriggered(true);
  }, []);

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        triggerHapticFeedback();
        setCurrentAnswer(text);
        setPasteSuccess(true);
        if (pasteSuccessTimeoutRef.current) {
          clearTimeout(pasteSuccessTimeoutRef.current);
        }
        pasteSuccessTimeoutRef.current = setTimeout(() => {
          setPasteSuccess(false);
        }, ANIMATION_CONFIG.TASK_MANAGEMENT.PROGRESS_DURATION);
        const ref =
          currentQuestion?.type === 'textarea' ? textareaRef : textInputRef;
        ref?.current?.focus();
      }
    } catch {
      // Clipboard API may be denied - fail silently
    }
  }, [currentQuestion, setCurrentAnswer, textareaRef, textInputRef]);

  // Micro-UX: Clear answer handler - matches IdeaInput pattern for consistency
  // Allows users to quickly reset their answer with clear button or Escape key
  const handleClear = useCallback(() => {
    if (currentAnswer.trim()) {
      triggerHapticFeedback();
      setCurrentAnswer('');
      const ref =
        currentQuestion?.type === 'textarea' ? textareaRef : textInputRef;
      ref?.current?.focus();
    }
  }, [
    currentAnswer,
    setCurrentAnswer,
    currentQuestion,
    textareaRef,
    textInputRef,
  ]);

  // Micro-UX: Keyboard shortcuts for reference toggle and back-to-edit navigation
  useEffect(() => {
    if (loading || questions.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFocusedOnInput(e.target) || e.metaKey || e.ctrlKey) return;

      // Alt+R: Toggle reference idea section
      if (e.key === 'r' && e.altKey) {
        e.preventDefault();
        const details = detailsRef.current;
        if (details) {
          details.open = !details.open;
          handleToggleReference();
        }
      }

      // Alt+B: Navigate back to edit (consistent with Alt+R pattern)
      if (e.key === 'b' && e.altKey) {
        e.preventDefault();
        triggerHapticFeedback();
        if (onBackToEdit) {
          onBackToEdit();
        } else {
          router.push('/');
        }
      }

      if (e.key === 'Escape' && currentAnswer.trim() && !isSubmitting) {
        e.preventDefault();
        handleClear();
      }

      const stepNumber = parseInt(e.key, 10);
      if (stepNumber >= 1 && stepNumber <= questions.length) {
        e.preventDefault();
        goToStep(stepNumber - 1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    loading,
    questions.length,
    handleToggleReference,
    goToStep,
    handleClear,
    currentAnswer,
    isSubmitting,
    onBackToEdit,
    router,
  ]);

  if (loading) {
    return (
      <div className={`${CONTAINER_WIDTHS.SM} mx-auto fade-in`}>
        <LoadingAnnouncer
          message={MESSAGES.CLARIFICATION.GENERATING_QUESTIONS}
        />
        <div
          className={`flex flex-col items-center justify-center ${PY_CLASSES.XXXXL}`}
        >
          <LoadingSpinner
            size="lg"
            ariaLabel={COMPONENT_DEFAULTS.ARIA_LABELS.LOADING_QUESTIONS}
          />
          <p className={`mt-4 ${TEXT_COLOR_CLASSES.BODY} text-sm`}>
            {MESSAGES.CLARIFICATION.GENERATING_QUESTIONS}
          </p>
        </div>

        <div
          className={`${CARD_PATTERNS.RESPONSIVE} mt-6 space-y-6 animate-fade-in`}
        >
          <div className={SPACE_Y_PATTERNS.MD}>
            <Skeleton className="h-6 w-3/4" variant="text" />
            <Skeleton className="h-4 w-full" variant="text" />
            <Skeleton className="h-4 w-5/6" variant="text" />
          </div>

          <div className={SPACE_Y_PATTERNS.LG}>
            <Skeleton className="h-10 w-full" variant="rect" />
            <Skeleton className="h-24 w-full" variant="rect" />
          </div>

          <div className={`${FLEX_PATTERNS.BETWEEN_CENTER} pt-4`}>
            <Skeleton className="h-10 w-24" variant="rect" />
            <Skeleton className="h-10 w-28" variant="rect" />
          </div>
        </div>

        <div className={`${FLEX_PATTERNS.CENTER_GAP_MD}`}>
          <div className={FLEX_PATTERNS.GAP_SM}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${ICON_SIZES.XS} rounded-full bg-primary-200 animate-pulse`}
                style={{
                  animationDelay: `${i * ANIMATION_DELAYS.LONG}ms`,
                  animationDuration: `${ANIMATION_CONFIG.SLOW}ms`,
                }}
              />
            ))}
          </div>
          <span className={`text-xs ${TEXT_COLOR_CLASSES.MUTED}`}>
            {CLARIFICATION_FLOW_LABELS.PREPARING_QUESTIONS}
          </span>
        </div>

        {error && (
          <div className={`${SPACING_PATTERNS.MB6} slide-up`}>
            <Alert type="error" title={MESSAGES.ERRORS.DEFAULT}>
              <p>{error}</p>
              <p className={CLARIFICATION_FLOW_INFO_TEXT}>
                {MESSAGES.CLARIFICATION.FALLBACK_ERROR}
              </p>
            </Alert>
          </div>
        )}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className={`${CONTAINER_WIDTHS.SM} mx-auto`}>
        <Alert type="warning" title={MESSAGES.CLARIFICATION.NO_QUESTIONS_TITLE}>
          <p>{MESSAGES.CLARIFICATION.NO_QUESTIONS_DESCRIPTION}</p>
          <p className={CLARIFICATION_FLOW_INFO_TEXT}>
            {MESSAGES.CLARIFICATION.NO_QUESTIONS_SUGGESTION}
          </p>
        </Alert>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className={`${CONTAINER_WIDTHS.SM} mx-auto`}>
        <div
          className={`flex flex-col items-center justify-center ${PY_CLASSES.XXXXL}`}
        >
          <LoadingSpinner size="lg" />
          <p className={`mt-4 ${TEXT_COLOR_CLASSES.BODY} text-sm`}>
            {MESSAGES.CLARIFICATION.LOADING_QUESTION}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${CONTAINER_WIDTHS.SM} mx-auto fade-in`}>
      <StepCelebration
        stepNumber={currentStep}
        totalSteps={questions.length}
        show={showCelebration}
      />

      <div className={`${SPACING_PATTERNS.MB6} ${FLEX_PATTERNS.BETWEEN}`}>
        <Tooltip
          content={CLARIFICATION_FLOW_LABELS.BACK_TO_EDIT_TOOLTIP}
          shortcut={['Alt', 'B']}
          position="top"
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              triggerHapticFeedback();
              if (onBackToEdit) {
                onBackToEdit();
              } else {
                router.push('/');
              }
            }}
            className={`${TEXT_COLOR_CLASSES.BODY} ${TEXT_COLOR_CLASSES.BRAND_HOVER}`}
          >
            <svg
              className={ICON_PATTERNS.ICON_WITH_MARGIN_SM}
              fill="none"
              viewBox={SVG_VIEWBOX.STANDARD}
              stroke="currentColor"
              strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {CLARIFICATION_FLOW_LABELS.BACK_TO_EDIT_BUTTON}
          </Button>
        </Tooltip>
      </div>

      {error && (
        <div className="mb-6 slide-up">
          <Alert type="error" title={MESSAGES.ERRORS.DEFAULT}>
            <p>{error}</p>
            <p className={CLARIFICATION_FLOW_INFO_TEXT}>
              {MESSAGES.CLARIFICATION.FALLBACK_ERROR}
            </p>
          </Alert>
        </div>
      )}

      <StatusAnnouncer
        message={referenceAnnouncement}
        triggered={referenceTriggered}
        politeness="polite"
      />
      <details
        ref={detailsRef}
        onToggle={handleToggleReference}
        className={`group mb-6 ${BG_COLOR_CLASSES.PAGE} rounded-lg border ${BORDER_COLOR_CLASSES.LIGHT} overflow-hidden ${TRANSITION_CLASSES.DEFAULT}`}
      >
        <summary
          className={`px-4 py-3 text-sm font-medium ${TEXT_COLOR_CLASSES.BODY} cursor-pointer ${BG_COLOR_CLASSES.HOVER_SUBTLE} focus:outline-none focus:ring-2 focus:ring-primary-500 flex justify-between items-center list-none select-none`}
        >
          <div className={FLEX_PATTERNS.GAP_MD}>
            <svg
              className={`${ICON_SIZES.MD} ${TEXT_COLOR_CLASSES.MUTED}`}
              fill="none"
              viewBox={SVG_VIEWBOX.STANDARD}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{COMPONENT_DEFAULTS.CLARIFICATION_FLOW.REFERENCE_LABEL}</span>
            <kbd
              className={`hidden sm:inline-flex items-center px-1.5 py-0.5 ${BG_COLOR_CLASSES.LIGHT} ${TEXT_COLOR_CLASSES.MUTED} rounded text-xs font-mono`}
              aria-hidden="true"
            >
              Alt+R
            </kbd>
          </div>
          <svg
            className={`${ICON_SIZES.MD} ${TEXT_COLOR_CLASSES.PLACEHOLDER} ${TRANSITION_CLASSES.TRANSFORM} transform group-open:rotate-180`}
            fill="none"
            viewBox={SVG_VIEWBOX.STANDARD}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </summary>
        <div
          className={`px-4 pb-4 pt-2 text-sm ${TEXT_COLOR_CLASSES.BODY} border-t ${BORDER_COLOR_CLASSES.EXTRA_LIGHT} ${BG_COLOR_CLASSES.CARD}`}
        >
          <div
            className={`${FLEX_PATTERNS.BETWEEN_START} ${SPACING_PATTERNS.GAP4}`}
          >
            <p className="italic leading-relaxed">&quot;{idea}&quot;</p>
            <CopyButton
              textToCopy={idea}
              variant="icon-only"
              className="mt-1"
              ariaLabel={COMPONENT_DEFAULTS.ARIA_LABELS.COPY_IDEA}
            />
          </div>
        </div>
      </details>

      <div aria-live="polite" aria-atomic="true">
        <div
          className={`${FLEX_PATTERNS.BETWEEN_CENTER} ${SPACING_PATTERNS.MB2}`}
        >
          <div className={FLEX_PATTERNS.GAP_MD}>
            <span
              className={`text-sm font-medium ${TEXT_COLOR_CLASSES.HEADING}`}
            >
              {LABELS.QUESTION(currentStep)} of {questions.length}
            </span>
            {currentStep === questions.length - 1 && (
              <span
                className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${BG_COLORS.SUCCESS_LIGHT} ${TEXT_COLORS.SUCCESS_DARK} animate-in fade-in zoom-in ${TRANSITION_CLASSES.SLOW}`}
                role="status"
                aria-label={CLARIFICATION_FLOW_LABELS.FINAL_STEP}
              >
                {CLARIFICATION_FLOW_LABELS.FINAL_STEP}
              </span>
            )}
          </div>
          <span
            key={currentStep}
            className={`text-sm font-medium animate-scale-in tabular-nums ${
              currentStep === questions.length - 1
                ? TEXT_COLORS.SUCCESS_MEDIUM
                : TEXT_COLORS.PRIMARY
            }`}
            aria-label={CLARIFICATION_FLOW_LABELS.PROGRESS_ARIA_LABEL(
              Math.round(progress)
            )}
          >
            {Math.round(progress)}%
          </span>
        </div>
        <ProgressStepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={goToStep}
        />

        {elapsedSeconds > 0 && (
          <div
            className={`mt-2 flex items-center justify-end gap-3 text-xs ${TEXT_COLOR_CLASSES.MUTED}`}
            role="status"
            aria-live="polite"
            aria-label={CLARIFICATION_FLOW_LABELS.TIMER_ARIA_LABEL(
              formatTime(elapsedSeconds),
              estimatedRemainingSeconds !== null
                ? formatTime(estimatedRemainingSeconds)
                : ''
            )}
          >
            <span className={FLEX_PATTERNS.GAP_SM}>
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox={SVG_VIEWBOX.STANDARD}
                stroke="currentColor"
                strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{formatTime(elapsedSeconds)}</span>
            </span>
            {estimatedRemainingSeconds !== null &&
              estimatedRemainingSeconds > 0 && (
                <span className={FLEX_PATTERNS.GAP_SM}>
                  <span className={GRAY_CLASSES.TEXT_400}>·</span>
                  <span
                    className={`transition-all ${DURATION_TAILWIND[300]} ${
                      estimatePulse
                        ? `text-primary-600 font-medium ${ANIMATION_VALUES.SCALE_CLASSES.LARGE}`
                        : ''
                    }`}
                  >
                    ~{formatTime(estimatedRemainingSeconds)} left
                  </span>
                </span>
              )}
          </div>
        )}
      </div>

      <div
        ref={questionSectionRef}
        key={currentStep}
        aria-labelledby={ARIA_HEADING_IDS.QUESTION}
        aria-describedby={CLARIFICATION_ELEMENT_IDS.QUESTION_DESCRIPTION}
        className={CARD_PATTERNS.RESPONSIVE}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}
          aria-label={CLARIFICATION_FLOW_LABELS.QUESTION_ARIA_LABEL(
            currentStep + 1,
            questions.length
          )}
        >
          <h2
            id={CLARIFICATION_ELEMENT_IDS.QUESTION_HEADING}
            className={CLARIFICATION_FLOW_QUESTION_HEADING}
          >
            {currentQuestion.question}
          </h2>
          <p
            id={CLARIFICATION_ELEMENT_IDS.QUESTION_DESCRIPTION}
            className="sr-only"
          >
            {COMPONENT_DEFAULTS.CLARIFICATION_FLOW.STEP_DESCRIPTION(
              currentStep + 1,
              questions.length
            )}
          </p>

          <div className={SPACE_Y_PATTERNS.LG}>
            {currentQuestion.type === 'textarea' && (
              <div>
                <InputWithValidation
                  id={CLARIFICATION_ELEMENT_IDS.ANSWER_TEXTAREA}
                  name="answer"
                  label={currentQuestion.question}
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    capsLockKeyDown(e);
                    handleKeyDown(e);
                  }}
                  onKeyUp={capsLockKeyUp}
                  onBlur={capsLockBlur}
                  placeholder={PLACEHOLDERS.CLARIFICATION_ANSWER}
                  multiline={true}
                  minLength={MIN_ANSWER_LENGTH}
                  maxLength={MAX_ANSWER_LENGTH}
                  showCharCount={true}
                  helpText={`${MESSAGES.CLARIFICATION.ANSWER_HELP_TEXT} ${COMPONENT_DEFAULTS.CLARIFICATION_FLOW.KEYBOARD_SHORTCUT_TEXT(isMac, currentStep === questions.length - 1)}`}
                  required={true}
                  className={INPUT_HEIGHT_CLASSES.TEXTAREA}
                  ref={textareaRef}
                  disabled={showCelebration || isSubmitting}
                />
                <CapsLockWarning isOn={isCapsLockOn} className="mt-1.5" />
              </div>
            )}

            {currentQuestion.type === 'text' && (
              <div>
                <InputWithValidation
                  id={CLARIFICATION_ELEMENT_IDS.ANSWER_TEXT}
                  label={currentQuestion.question}
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    capsLockKeyDown(e);
                    handleKeyDown(e);
                  }}
                  onKeyUp={capsLockKeyUp}
                  onBlur={capsLockBlur}
                  placeholder={PLACEHOLDERS.CLARIFICATION_ANSWER}
                  minLength={MIN_SHORT_ANSWER_LENGTH}
                  maxLength={MAX_SHORT_ANSWER_LENGTH}
                  showCharCount={true}
                  helpText={COMPONENT_DEFAULTS.CLARIFICATION_FLOW.KEYBOARD_SHORTCUT_TEXT(
                    isMac,
                    currentStep === questions.length - 1
                  )}
                  required={true}
                  ref={textInputRef}
                  disabled={showCelebration || isSubmitting}
                />
                <CapsLockWarning isOn={isCapsLockOn} className="mt-1.5" />
              </div>
            )}

            {(currentQuestion.type === 'textarea' ||
              currentQuestion.type === 'text') &&
              !currentAnswer.trim() &&
              !showCelebration &&
              !isSubmitting && (
                <div className={FLEX_PATTERNS.END}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handlePasteFromClipboard}
                    aria-label={CLARIFICATION_FLOW_LABELS.PASTE_ARIA_LABEL}
                    className={`${TRANSITION_CLASSES.DEFAULT} ${
                      pasteSuccess
                        ? `${TEXT_COLORS.SUCCESS_MEDIUM} ${BG_COLORS.SUCCESS_VERY_LIGHT} hover:${BG_COLORS.SUCCESS_LIGHT}`
                        : `${TEXT_COLOR_CLASSES.MUTED} ${TEXT_COLOR_CLASSES.HOVER_MUTED} ${BG_COLOR_CLASSES.HOVER_SUBTLE}`
                    }`}
                  >
                    {pasteSuccess ? (
                      <svg
                        className={`${ICON_PATTERNS.ICON_WITH_MARGIN_SM} ${TEXT_COLORS.SUCCESS_MEDIUM}`}
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
                        className={ICON_PATTERNS.ICON_WITH_MARGIN_SM}
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
                    {pasteSuccess
                      ? CLARIFICATION_FLOW_LABELS.PASTE_SUCCESS
                      : CLARIFICATION_FLOW_LABELS.PASTE_BUTTON}
                  </Button>
                </div>
              )}

            {(currentQuestion.type === 'textarea' ||
              currentQuestion.type === 'text') &&
              currentAnswer.trim() &&
              !showCelebration &&
              !isSubmitting && (
                <div className={FLEX_PATTERNS.END}>
                  <Tooltip
                    content={CLARIFICATION_FLOW_LABELS.CLEAR_TOOLTIP}
                    shortcut={['Esc']}
                    position="top"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClear}
                      aria-label={CLARIFICATION_FLOW_LABELS.CLEAR_ARIA_LABEL}
                      className={`${TRANSITION_CLASSES.DEFAULT} ${TEXT_COLOR_CLASSES.MUTED} ${TEXT_COLOR_CLASSES.HOVER_MUTED} ${BG_COLOR_CLASSES.HOVER_SUBTLE}`}
                    >
                      <svg
                        className={ICON_PATTERNS.ICON_WITH_MARGIN_SM}
                        fill="none"
                        viewBox={SVG_VIEWBOX.STANDARD}
                        stroke="currentColor"
                        strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      {CLARIFICATION_FLOW_LABELS.CLEAR_BUTTON}
                    </Button>
                  </Tooltip>
                </div>
              )}

            {currentQuestion.type === 'select' && currentQuestion.options && (
              <div className={SPACE_Y_PATTERNS.SM}>
                <label
                  htmlFor="answer-select"
                  className={CLARIFICATION_FLOW_INPUT_LABEL}
                >
                  {currentQuestion.question}
                  <span
                    className={`${TEXT_COLORS.ERROR} ml-1`}
                    aria-hidden="true"
                  >
                    *
                  </span>
                </label>
                <div className="relative">
                  <select
                    id={CLARIFICATION_ELEMENT_IDS.ANSWER_SELECT}
                    ref={selectRef}
                    value={currentAnswer}
                    onChange={(e) => {
                      triggerHapticFeedback();
                      setCurrentAnswer(e.target.value);
                    }}
                    onKeyDown={handleKeyDown}
                    className={`${INPUT_STYLES.BASE} ${INPUT_STYLES.NORMAL} ${INPUT_HEIGHT_CLASSES.SELECT} cursor-pointer appearance-none bg-white pr-10 ${TRANSITION_CLASSES.DEFAULT} ${BORDER_COLOR_CLASSES.HOVER_DEFAULT} ${
                      currentAnswer
                        ? `${TEXT_COLOR_CLASSES.HEADING} font-medium`
                        : `${TEXT_COLOR_CLASSES.MUTED}`
                    }`}
                    aria-required="true"
                    aria-invalid={
                      !!(
                        currentAnswer.trim() === '' &&
                        currentStep === questions.length - 1
                      )
                    }
                    disabled={showCelebration || isSubmitting}
                    required
                  >
                    <option value="" disabled>
                      {COMPONENT_DEFAULTS.CLARIFICATION_FLOW.SELECT_PLACEHOLDER}
                    </option>
                    {currentQuestion.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className={`${ICON_SIZES.LG} ${TEXT_COLOR_CLASSES.MUTED} ${TRANSITION_CLASSES.TRANSFORM}`}
                      fill="none"
                      viewBox={SVG_VIEWBOX.STANDARD}
                      stroke="currentColor"
                      strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                {currentAnswer && (
                  <p
                    className={`text-sm ${TEXT_COLORS.SUCCESS_DARK} flex items-center gap-1.5 animate-fade-in`}
                    role="status"
                    aria-live="polite"
                  >
                    <svg
                      className={ICON_SIZES.MD}
                      fill="none"
                      viewBox={SVG_VIEWBOX.STANDARD}
                      stroke="currentColor"
                      strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Selected: {currentAnswer}
                  </p>
                )}
              </div>
            )}
          </div>

          <div
            className={`${FLEX_PATTERNS.BETWEEN_CENTER} ${SPACING_PATTERNS.MT8}`}
          >
            <Button
              type="button"
              variant="secondary"
              onClick={handlePrevious}
              disabled={currentStep === 0 || showCelebration || isSubmitting}
            >
              {MESSAGES.NAVIGATION.PREVIOUS}
            </Button>

            <div
              className={CLARIFICATION_FLOW_KEYBOARD_HINT}
              aria-hidden="true"
            >
              {currentStep > 0 && (
                <span className={FLEX_PATTERNS.GAP_SM}>
                  <kbd
                    className={
                      UI_CONFIG.ACCESSIBILITY.KEYBOARD
                        .KBD_STYLE_COMPACT_WITH_GAP
                    }
                  >
                    {isMac ? '⌘' : 'Ctrl'}
                  </kbd>
                  <kbd
                    className={
                      UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT
                    }
                  >
                    ←
                  </kbd>
                  <span>prev</span>
                </span>
              )}
              <span className={FLEX_PATTERNS.GAP_SM}>
                <kbd
                  className={
                    UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT_WITH_GAP
                  }
                >
                  {isMac ? '⌘' : 'Ctrl'}
                </kbd>
                <kbd
                  className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}
                >
                  Enter
                </kbd>
                <span>
                  {currentStep === questions.length - 1 ? 'submit' : 'next'}
                </span>
              </span>
              {questions.length > 1 && (
                <span className={FLEX_PATTERNS.GAP_SM}>
                  <kbd
                    className={
                      UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT
                    }
                  >
                    1
                  </kbd>
                  <span>–</span>
                  <kbd
                    className={
                      UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT
                    }
                  >
                    {questions.length}
                  </kbd>
                  <span>jump</span>
                </span>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={!currentAnswer.trim() || showCelebration}
              loading={isSubmitting}
              loadingText={MESSAGES.NAVIGATION.SUBMITTING}
              enableTransition
              attention={
                !!currentAnswer.trim() && !showCelebration && !isSubmitting
              }
            >
              {currentStep === questions.length - 1
                ? MESSAGES.NAVIGATION.COMPLETE
                : MESSAGES.NAVIGATION.NEXT}
            </Button>
          </div>
        </form>

        {/* Micro-UX: Clickable keyboard shortcut badges for mouse/touch step navigation */}
        {questions.length > 1 && (
          <div className={CLARIFICATION_FLOW_STEP_INDICATOR}>
            <span className="inline-flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
              <span className={CLARIFICATION_FLOW_STEP_TEXT}>Jump to:</span>
              {questions
                .slice(
                  0,
                  COMPONENT_CONFIG.CLARIFICATION_FLOW.MAX_KEYBOARD_SHORTCUTS
                )
                .map((question, index) => {
                  const isCurrentStep = index === currentStep;
                  return (
                    <span key={index} className="inline-flex items-center">
                      <button
                        type="button"
                        onClick={() => {
                          triggerHapticFeedback();
                          goToStep(index);
                        }}
                        className={`
                          ${CLARIFICATION_FLOW_STEP_BUTTON_BASE}
                          ${
                            isCurrentStep
                              ? CLARIFICATION_FLOW_STEP_BUTTON_CURRENT
                              : ''
                          }
                        `}
                        aria-label={CLARIFICATION_FLOW_LABELS.STEP_JUMP_ARIA_LABEL(
                          index,
                          question.question,
                          isCurrentStep
                        )}
                        aria-current={isCurrentStep ? 'step' : undefined}
                      >
                        {index + 1}
                      </button>
                      {index <
                        Math.min(
                          questions.length,
                          COMPONENT_CONFIG.CLARIFICATION_FLOW
                            .MAX_KEYBOARD_SHORTCUTS
                        ) -
                          1 && (
                        <span className={CLARIFICATION_FLOW_STEP_SEPARATOR}>
                          /
                        </span>
                      )}
                    </span>
                  );
                })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ClarificationFlow);
