'use client';

import { memo } from 'react';
import {
  MIN_ANSWER_LENGTH,
  MAX_ANSWER_LENGTH,
  MIN_SHORT_ANSWER_LENGTH,
  MAX_SHORT_ANSWER_LENGTH,
} from '@/lib/validation';
import {
  MESSAGES,
  PLACEHOLDERS,
  INPUT_STYLES,
  TEXT_COLORS,
  COMPONENT_DEFAULTS,
  LABELS,
} from '@/lib/config';
import Alert from '@/components/Alert';
import Button from '@/components/Button';
import ProgressStepper from '@/components/ProgressStepper';
import InputWithValidation from '@/components/InputWithValidation';
import LoadingSpinner from '@/components/LoadingSpinner';
import LoadingAnnouncer from '@/components/LoadingAnnouncer';
import CopyButton from '@/components/CopyButton';
import StepCelebration from '@/components/StepCelebration';
import { useClarificationSession } from '@/hooks/useClarificationSession';

interface ClarificationFlowProps {
  idea: string;
  ideaId?: string;
  onComplete: (answers: Record<string, string>) => Promise<void>;
}

function ClarificationFlow({
  idea,
  ideaId,
  onComplete,
}: ClarificationFlowProps) {
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
  } = useClarificationSession(idea, ideaId, onComplete);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto fade-in">
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
      <div className="max-w-2xl mx-auto">
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
      <div className="max-w-2xl mx-auto">
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
    <div className="max-w-2xl mx-auto fade-in">
      <StepCelebration
        stepNumber={currentStep}
        totalSteps={questions.length}
        show={showCelebration}
        onComplete={() => {}}
      />

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

      <details className="group mb-6 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden transition-all duration-200">
        <summary className="px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 flex justify-between items-center list-none select-none">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{COMPONENT_DEFAULTS.CLARIFICATION_FLOW.REFERENCE_LABEL}</span>
          </div>
          <svg
            className="w-4 h-4 text-gray-400 transition-transform duration-200 transform group-open:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
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
          <span className="text-sm font-medium text-gray-900">
            {LABELS.QUESTION(currentStep)} of {questions.length}
          </span>
          <span
            className="text-sm text-gray-900 font-medium"
            aria-label={`Progress: ${Math.round(progress)} percent`}
          >
            {Math.round(progress)}%
          </span>
        </div>
        <ProgressStepper steps={steps} currentStep={currentStep} />
      </div>

      <section
        aria-labelledby="question-heading"
        aria-describedby="question-description"
        className="bg-white rounded-lg shadow-lg p-6 sm:p-8 scale-in"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}
          aria-label={`Question ${currentStep + 1} of ${questions.length}`}
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
                className="min-h-[100px]"
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
                <select
                  id="answer-select"
                  ref={selectRef}
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`${INPUT_STYLES.BASE} ${INPUT_STYLES.NORMAL} min-h-[44px] cursor-pointer`}
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
                  <option value="">
                    {COMPONENT_DEFAULTS.CLARIFICATION_FLOW.SELECT_PLACEHOLDER}
                  </option>
                  {currentQuestion.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
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
              className="hidden sm:flex items-center gap-2 text-xs text-gray-600 mr-4"
              aria-hidden="true"
            >
              <kbd className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 border border-gray-400 rounded text-[10px] font-sans font-medium text-gray-800 min-w-[24px] min-h-[24px] justify-center">
                {isMac ? '⌘' : 'Ctrl'}
              </kbd>
              <kbd className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 border border-gray-400 rounded text-[10px] font-sans font-medium text-gray-800 min-w-[24px] min-h-[24px] justify-center">
                Enter
              </kbd>
              <span>
                to{' '}
                {currentStep === questions.length - 1
                  ? MESSAGES.NAVIGATION.COMPLETE.toLowerCase()
                  : MESSAGES.NAVIGATION.NEXT.replace(' →', '').toLowerCase()}
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={!currentAnswer.trim() || showCelebration}
              loading={isSubmitting}
            >
              {currentStep === questions.length - 1
                ? MESSAGES.NAVIGATION.COMPLETE
                : MESSAGES.NAVIGATION.NEXT}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default memo(ClarificationFlow);
