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
  MESSAGES,
  PLACEHOLDERS,
  INPUT_STYLES,
  TEXT_COLORS,
  COMPONENT_DEFAULTS,
  LABELS,
  ANIMATION_DELAYS,
  ANIMATION_CONFIG,
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  UI_CONFIG,
  INPUT_HEIGHT_CLASSES,
  CONTAINER_WIDTHS,
  CLARIFICATION_FLOW_LABELS,
  CARD_PATTERNS,
} from '@/lib/config';
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
  } = useClarificationSession(idea, ideaId, onComplete);

  const detailsRef = useRef<HTMLDetailsElement>(null);
  const questionSectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [referenceAnnouncement, setReferenceAnnouncement] = useState('');
  const [referenceTriggered, setReferenceTriggered] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>(
    'forward'
  );
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

  // Micro-UX: Keyboard shortcut Alt+R to toggle reference idea section
  useEffect(() => {
    if (loading || questions.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFocusedOnInput(e.target) || e.metaKey || e.ctrlKey) return;

      if (e.key === 'r' && e.altKey) {
        e.preventDefault();
        const details = detailsRef.current;
        if (details) {
          details.open = !details.open;
          handleToggleReference();
        }
      }

      const stepNumber = parseInt(e.key, 10);
      if (stepNumber >= 1 && stepNumber <= questions.length) {
        e.preventDefault();
        goToStep(stepNumber - 1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [loading, questions.length, handleToggleReference, goToStep]);

  if (loading) {
    return (
      <div className={`${CONTAINER_WIDTHS.SM} mx-auto fade-in`}>
        <LoadingAnnouncer
          message={MESSAGES.CLARIFICATION.GENERATING_QUESTIONS}
        />
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner
            size="lg"
            ariaLabel={COMPONENT_DEFAULTS.ARIA_LABELS.LOADING_QUESTIONS}
          />
          <p className="mt-4 text-gray-600 text-sm">
            {MESSAGES.CLARIFICATION.GENERATING_QUESTIONS}
          </p>
        </div>

        <div
          className={`${CARD_PATTERNS.RESPONSIVE} mt-6 space-y-6 animate-fade-in`}
        >
          <div className="space-y-3">
            <Skeleton className="h-6 w-3/4" variant="text" />
            <Skeleton className="h-4 w-full" variant="text" />
            <Skeleton className="h-4 w-5/6" variant="text" />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-10 w-full" variant="rect" />
            <Skeleton className="h-24 w-full" variant="rect" />
          </div>

          <div className="flex justify-between items-center pt-4">
            <Skeleton className="h-10 w-24" variant="rect" />
            <Skeleton className="h-10 w-28" variant="rect" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary-200 animate-pulse"
                style={{
                  animationDelay: `${i * ANIMATION_DELAYS.LONG}ms`,
                  animationDuration: `${ANIMATION_CONFIG.SLOW}ms`,
                }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">
            {CLARIFICATION_FLOW_LABELS.PREPARING_QUESTIONS}
          </span>
        </div>

        {error && (
          <div className="mb-6 slide-up">
            <Alert type="error" title={MESSAGES.ERRORS.DEFAULT}>
              <p>{error}</p>
              <p className="text-sm mt-4">
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
          <p className="text-sm mt-4">
            {MESSAGES.CLARIFICATION.NO_QUESTIONS_SUGGESTION}
          </p>
        </Alert>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className={`${CONTAINER_WIDTHS.SM} mx-auto`}>
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 text-sm">
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

      <div className="mb-6 flex items-center justify-between">
        <Tooltip
          content={CLARIFICATION_FLOW_LABELS.BACK_TO_EDIT_TOOLTIP}
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
            className="text-gray-600 hover:text-gray-900"
          >
            <svg
              className="w-4 h-4 mr-1.5"
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
            <p className="text-sm mt-4">
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
        className="group mb-6 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden transition-all duration-200"
      >
        <summary className="px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 flex justify-between items-center list-none select-none">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-gray-500"
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
              className="hidden sm:inline-flex items-center px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded text-xs font-mono"
              aria-hidden="true"
            >
              Alt+R
            </kbd>
          </div>
          <svg
            className="w-4 h-4 text-gray-400 transition-transform duration-200 transform group-open:rotate-180"
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
        <div className="px-4 pb-4 pt-2 text-sm text-gray-600 border-t border-gray-100 bg-white">
          <div className="flex justify-between items-start gap-4">
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
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {LABELS.QUESTION(currentStep)} of {questions.length}
            </span>
            {currentStep === questions.length - 1 && (
              <span
                className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700 animate-in fade-in zoom-in duration-300"
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
                ? 'text-green-600'
                : 'text-gray-900'
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
      </div>

      <div
        ref={questionSectionRef}
        key={currentStep}
        aria-labelledby="question-heading"
        aria-describedby="question-description"
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
            id="question-heading"
            className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6"
          >
            {currentQuestion.question}
          </h2>
          <p id="question-description" className="sr-only">
            {COMPONENT_DEFAULTS.CLARIFICATION_FLOW.STEP_DESCRIPTION(
              currentStep + 1,
              questions.length
            )}
          </p>

          <div className="space-y-4">
            {currentQuestion.type === 'textarea' && (
              <InputWithValidation
                id="answer-textarea"
                name="answer"
                label={currentQuestion.question}
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
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
            )}

            {currentQuestion.type === 'text' && (
              <InputWithValidation
                id="answer-text"
                label={currentQuestion.question}
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
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
            )}

            {(currentQuestion.type === 'textarea' ||
              currentQuestion.type === 'text') &&
              !currentAnswer.trim() &&
              !showCelebration &&
              !isSubmitting && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handlePasteFromClipboard}
                    aria-label={CLARIFICATION_FLOW_LABELS.PASTE_ARIA_LABEL}
                    className={`transition-all duration-200 ${
                      pasteSuccess
                        ? 'text-green-600 bg-green-50 hover:bg-green-100'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pasteSuccess ? (
                      <svg
                        className="w-4 h-4 mr-1 text-green-600"
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
                    {pasteSuccess
                      ? CLARIFICATION_FLOW_LABELS.PASTE_SUCCESS
                      : CLARIFICATION_FLOW_LABELS.PASTE_BUTTON}
                  </Button>
                </div>
              )}

            {currentQuestion.type === 'select' && currentQuestion.options && (
              <div className="space-y-2">
                <label
                  htmlFor="answer-select"
                  className="block text-sm font-medium text-gray-900 cursor-pointer"
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
                    id="answer-select"
                    ref={selectRef}
                    value={currentAnswer}
                    onChange={(e) => {
                      triggerHapticFeedback();
                      setCurrentAnswer(e.target.value);
                    }}
                    onKeyDown={handleKeyDown}
                    className={`${INPUT_STYLES.BASE} ${INPUT_STYLES.NORMAL} ${INPUT_HEIGHT_CLASSES.SELECT} cursor-pointer appearance-none bg-white pr-10 transition-all duration-200 hover:border-gray-400 ${
                      currentAnswer
                        ? 'text-gray-900 font-medium'
                        : 'text-gray-500'
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
                      className="w-5 h-5 text-gray-400 transition-transform duration-200"
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
                    className="text-sm text-green-700 flex items-center gap-1.5 animate-fade-in"
                    role="status"
                    aria-live="polite"
                  >
                    <svg
                      className="w-4 h-4"
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

          <div className="flex justify-between items-center mt-8">
            <Button
              type="button"
              variant="secondary"
              onClick={handlePrevious}
              disabled={currentStep === 0 || showCelebration || isSubmitting}
            >
              {MESSAGES.NAVIGATION.PREVIOUS}
            </Button>

            <div
              className="hidden sm:flex items-center gap-3 text-xs text-gray-600 mr-4"
              aria-hidden="true"
            >
              {currentStep > 0 && (
                <span className="flex items-center gap-1.5">
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
              <span className="flex items-center gap-1.5">
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
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={!currentAnswer.trim() || showCelebration}
              loading={isSubmitting}
              loadingText={MESSAGES.NAVIGATION.SUBMITTING}
              enableTransition
            >
              {currentStep === questions.length - 1
                ? MESSAGES.NAVIGATION.COMPLETE
                : MESSAGES.NAVIGATION.NEXT}
            </Button>
          </div>
        </form>

        {/* Micro-UX: Keyboard shortcut hints for question navigation */}
        {/* Now visible on all screen sizes for improved discoverability */}
        {/* Number key shortcuts (1-9) allow quick jumping between questions */}
        {questions.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2 sm:gap-4 text-xs text-gray-400 animate-fade-in">
            <span className="inline-flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
              <span className="text-gray-500 font-medium">Jump to:</span>
              {questions.slice(0, 9).map((_, index) => (
                <span key={index} className="inline-flex items-center">
                  <kbd
                    className={
                      UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT
                    }
                  >
                    {index + 1}
                  </kbd>
                  {index < Math.min(questions.length, 9) - 1 && (
                    <span className="text-gray-300 mx-0.5">/</span>
                  )}
                </span>
              ))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ClarificationFlow);
