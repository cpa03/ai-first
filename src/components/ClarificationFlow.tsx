'use client';

import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { createLogger } from '@/lib/logger';
import {
  MIN_ANSWER_LENGTH,
  MAX_ANSWER_LENGTH,
  MIN_SHORT_ANSWER_LENGTH,
  MAX_SHORT_ANSWER_LENGTH,
} from '@/lib/validation';
import {
  UI_CONFIG,
  LABELS,
  CLARIFIER_CONFIG,
  MESSAGES,
  PLACEHOLDERS,
  INPUT_STYLES,
} from '@/lib/config';
import Alert from '@/components/Alert';
import Button from '@/components/Button';
import ProgressStepper from '@/components/ProgressStepper';
import InputWithValidation from '@/components/InputWithValidation';
import LoadingSpinner from '@/components/LoadingSpinner';
import LoadingAnnouncer from '@/components/LoadingAnnouncer';
import CopyButton from '@/components/CopyButton';

interface Question {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select';
  options?: string[];
}

interface APIQuestion {
  id: string;
  question: string;
  type: 'open' | 'multiple_choice' | 'yes_no';
  options?: string[];
  required: boolean;
}

interface ClarificationFlowProps {
  idea: string;
  ideaId?: string;
  onComplete: (answers: Record<string, string>) => void;
}

const FALLBACK_QUESTIONS: Question[] = CLARIFIER_CONFIG.FALLBACK_QUESTIONS.map(
  (q): Question => ({
    id: q.id,
    question: q.question,
    type:
      q.type === 'multiple_choice'
        ? 'select'
        : q.type === 'open'
          ? 'textarea'
          : 'text',
    ...('options' in q && q.options && { options: [...q.options] }),
  })
);

function ClarificationFlow({
  idea,
  ideaId,
  onComplete,
}: ClarificationFlowProps) {
  const logger = useMemo(() => createLogger('ClarificationFlow'), []);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMac, setIsMac] = useState(false);

  const textInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  const currentQuestion = useMemo(
    () => questions[currentStep],
    [questions, currentStep]
  );
  const progress = useMemo(
    () => ((currentStep + 1) / questions.length) * 100,
    [currentStep, questions.length]
  );
  const steps = useMemo(
    () =>
      questions.map((q, index) => ({
        id: q.id,
        label: LABELS.QUESTION(index),
        completed: index < currentStep,
        current: index === currentStep,
      })),
    [questions, currentStep]
  );

  const handleNext = useCallback(() => {
    if (!currentAnswer.trim()) return;
    if (!currentQuestion?.id) return;

    const newAnswers = {
      ...answers,
      [currentQuestion.id]: currentAnswer.trim(),
    };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
      setCurrentAnswer('');
    } else {
      onComplete(newAnswers);
    }
  }, [
    currentAnswer,
    answers,
    currentQuestion?.id,
    currentStep,
    questions,
    onComplete,
  ]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      const previousQuestion = questions[currentStep - 1];
      setCurrentAnswer(answers[previousQuestion.id] || '');
    }
  }, [currentStep, questions, answers]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === 'Enter' &&
        currentAnswer.trim()
      ) {
        e.preventDefault();
        handleNext();
      }
    },
    [currentAnswer, handleNext]
  );

  useEffect(() => {
    setIsMac(
      typeof window !== 'undefined' && navigator.platform.includes('Mac')
    );
  }, []);

  useEffect(() => {
    if (!currentQuestion || questions.length === 0) return;

    const focusInput = () => {
      return setTimeout(() => {
        if (currentQuestion.type === 'textarea') {
          textareaRef.current?.focus();
        } else if (currentQuestion.type === 'select') {
          selectRef.current?.focus();
        } else {
          textInputRef.current?.focus();
        }
      }, UI_CONFIG.FOCUS.DELAY_MS);
    };

    const timeoutId = focusInput();

    return () => clearTimeout(timeoutId);
  }, [currentStep, questions, currentQuestion]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/clarify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idea, ideaId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || 'Failed to fetch clarifying questions'
          );
        }

        const data = await response.json();
        // Validate and extract questions with runtime type checking
        const rawQuestions = data?.data?.questions ?? data?.questions;
        const questionsData = Array.isArray(rawQuestions) ? rawQuestions : [];

        const formattedQuestions: Question[] = questionsData.map(
          (q: APIQuestion, index: number) => ({
            id: q.id || `question_${index}`,
            question: q.question,
            type:
              q.type === 'open'
                ? 'textarea'
                : q.type === 'multiple_choice'
                  ? 'select'
                  : 'text',
            options: q.options,
          })
        );

        if (formattedQuestions.length === 0) {
          formattedQuestions.push(...FALLBACK_QUESTIONS);
        }

        setQuestions(formattedQuestions);
      } catch (err) {
        logger.errorWithContext('Failed to fetch clarifying questions', {
          component: 'ClarificationFlow',
          action: 'fetchQuestions',
          metadata: {
            ideaId,
            ideaLength: idea.length,
            error: err instanceof Error ? err.message : 'Unknown error',
          },
        });
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        );

        setQuestions(FALLBACK_QUESTIONS);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [idea, ideaId, logger]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto fade-in">
        <LoadingAnnouncer message="Generating questions..." />
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" ariaLabel="Generating questions" />
          <p className="mt-4 text-gray-600 text-sm">
            {MESSAGES.CLARIFICATION.GENERATING_QUESTIONS}
          </p>
        </div>
        {error && (
          <div className="mb-6 slide-up">
            <Alert type="error" title="Error">
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
      {error && (
        <div className="mb-6 slide-up">
          <Alert type="error" title="Error">
            <p>{error}</p>
            <p className="text-sm mt-4">
              We&apos;re using fallback questions to continue.
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
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Reference: Your Original Idea</span>
          </div>
          <svg
            className="w-4 h-4 text-gray-400 transition-transform duration-200 transform group-open:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
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
              ariaLabel="Copy original idea"
            />
          </div>
        </div>
      </details>

      <div aria-live="polite" aria-atomic="true">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-900">
            Question {currentStep + 1} of {questions.length}
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
            Answer the following question and then click Next to continue or
            Previous to go back. Question {currentStep + 1} of{' '}
            {questions.length}.
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
                helpText={`${MESSAGES.CLARIFICATION.ANSWER_HELP_TEXT} Press ${isMac ? '⌘' : 'Ctrl'} + Enter to submit.`}
                required={true}
                autoFocus={true}
                className="min-h-[100px]"
                ref={textareaRef}
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
                helpText={`Press ${isMac ? '⌘' : 'Ctrl'} + Enter to submit.`}
                required={true}
                autoFocus={true}
                ref={textInputRef}
              />
            )}

            {currentQuestion.type === 'select' && currentQuestion.options && (
              <div className="space-y-2">
                <label
                  htmlFor="answer-select"
                  className="block text-sm font-medium text-gray-900"
                >
                  {currentQuestion.question}
                </label>
                <select
                  id="answer-select"
                  ref={selectRef}
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`${INPUT_STYLES.BASE} ${INPUT_STYLES.NORMAL} min-h-[44px]`}
                  aria-required="true"
                  aria-invalid={
                    !!(
                      currentAnswer.trim() === '' &&
                      currentStep === questions.length - 1
                    )
                  }
                  required
                  autoFocus
                >
                  <option value="">Select an option...</option>
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
              disabled={currentStep === 0}
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
                to {currentStep === questions.length - 1 ? 'complete' : 'next'}
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={!currentAnswer.trim()}
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
