'use client';

import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { createLogger } from '@/lib/logger';
import {
  MIN_ANSWER_LENGTH,
  MAX_ANSWER_LENGTH,
  MIN_SHORT_ANSWER_LENGTH,
  MAX_SHORT_ANSWER_LENGTH,
} from '@/lib/validation';
import Alert from '@/components/Alert';
import Button from '@/components/Button';
import ProgressStepper from '@/components/ProgressStepper';
import InputWithValidation from '@/components/InputWithValidation';
import LoadingSpinner from '@/components/LoadingSpinner';
import LoadingAnnouncer from '@/components/LoadingAnnouncer';

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

const FALLBACK_QUESTIONS: Question[] = [
  {
    id: 'target_audience',
    question: 'Who is your target audience?',
    type: 'textarea',
  },
  {
    id: 'main_goal',
    question: 'What is the main goal you want to achieve?',
    type: 'textarea',
  },
  {
    id: 'timeline',
    question: 'What is your desired timeline for this project?',
    type: 'select',
    options: ['1-2 weeks', '1 month', '3 months', '6 months', '1 year'],
  },
];

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
        label: `Question ${index + 1}`,
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

  useEffect(() => {
    if (!currentQuestion || questions.length === 0) return;

    const focusInput = () => {
      setTimeout(() => {
        if (currentQuestion.type === 'textarea') {
          textareaRef.current?.focus();
        } else if (currentQuestion.type === 'select') {
          selectRef.current?.focus();
        } else {
          textInputRef.current?.focus();
        }
      }, 50);
    };

    focusInput();
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
        const questionsData = Array.isArray(data?.data?.questions) ? data.data.questions : Array.isArray(data?.questions) ? data.questions : [];

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
  }, [idea, ideaId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto fade-in">
        <LoadingAnnouncer message="Generating questions..." />
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" ariaLabel="Generating questions" />
          <p className="mt-4 text-gray-600 text-sm">Generating questions...</p>
        </div>
        {error && (
          <div className="mb-6 slide-up">
            <Alert type="error" title="Error">
              <p>{error}</p>
              <p className="text-sm mt-4">
                We're using fallback questions to continue.
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
        <Alert type="warning" title="No Questions Generated">
          <p>We couldn't generate specific questions for your idea.</p>
          <p className="text-sm mt-4">
            Please go back and try with a more detailed idea.
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
          <p className="mt-4 text-gray-600 text-sm">Loading question...</p>
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
              We're using fallback questions to continue.
            </p>
          </Alert>
        </div>
      )}

      <div aria-live="polite" aria-atomic="true">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Question {currentStep + 1} of {questions.length}
          </span>
          <span
            className="text-sm text-gray-700 font-medium"
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
                placeholder="Enter your answer here..."
                multiline={true}
                minLength={MIN_ANSWER_LENGTH}
                maxLength={MAX_ANSWER_LENGTH}
                showCharCount={true}
                helpText="Provide a detailed answer to help us understand your needs better."
                required={true}
                autoFocus={true}
                className="min-h-[100px]"
                ref={textareaRef}
              />
            )}

            {currentQuestion.type === 'text' && (
              <InputWithValidation
                id="answer-text"
                label="Your answer"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Enter your answer here..."
                minLength={MIN_SHORT_ANSWER_LENGTH}
                maxLength={MAX_SHORT_ANSWER_LENGTH}
                showCharCount={true}
                required={true}
                autoFocus={true}
                ref={textInputRef}
              />
            )}

            {currentQuestion.type === 'select' && currentQuestion.options && (
              <div className="space-y-2">
                <label
                  htmlFor="answer-select"
                  className="block text-sm font-medium text-gray-700"
                  id="answer-select-label"
                >
                  Your answer{' '}
                  <span className="text-red-500 ml-1" aria-hidden="true">
                    *
                  </span>
                </label>
                <select
                  id="answer-select"
                  ref={selectRef}
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:ring-primary-500 focus-visible:border-primary-500 focus-visible:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-all duration-200 bg-white min-h-[44px]"
                  aria-labelledby="answer-select-label"
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

          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="secondary"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              aria-label="Go to previous question"
            >
              ← Previous
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!currentAnswer.trim()}
              aria-label={
                currentStep === questions.length - 1
                  ? 'Complete clarification'
                  : 'Go to next question'
              }
            >
              {currentStep === questions.length - 1 ? 'Complete' : 'Next →'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default memo(ClarificationFlow);
