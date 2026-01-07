'use client';

import { useState, useEffect } from 'react';

interface Question {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select';
  options?: string[];
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

export default function ClarificationFlow({
  idea,
  ideaId,
  onComplete,
}: ClarificationFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const MIN_ANSWER_LENGTH = 3;
  const MAX_ANSWER_LENGTH = 500;

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

        // Convert the AI-generated questions to the expected format
        const formattedQuestions: Question[] = data.questions.map(
          (q: string, index: number) => ({
            id: `question_${index}`,
            question: q,
            type: 'textarea', // Default to textarea for clarifying questions
          })
        );

        // If no questions were generated, use fallback questions
        if (formattedQuestions.length === 0) {
          formattedQuestions.push(...FALLBACK_QUESTIONS);
        }

        setQuestions(formattedQuestions);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        );

        // Use fallback questions if API fails
        setQuestions(FALLBACK_QUESTIONS);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [idea, ideaId]);

  const currentQuestion = questions[currentStep];

  const validationError =
    touched && !currentAnswer.trim() && currentQuestion.type !== 'select'
      ? 'Please provide an answer.'
      : touched &&
          currentAnswer.trim().length < MIN_ANSWER_LENGTH &&
          currentQuestion.type !== 'select'
        ? `Your answer must be at least ${MIN_ANSWER_LENGTH} characters.`
        : touched && currentAnswer.length > MAX_ANSWER_LENGTH
          ? `Your answer cannot exceed ${MAX_ANSWER_LENGTH} characters.`
          : null;

  const isValid = !validationError;

  const handleNext = () => {
    if (!isValid) return;

    const newAnswers = {
      ...answers,
      [currentQuestion.id]: currentAnswer.trim(),
    };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
      setCurrentAnswer('');
      setTouched(false);
    } else {
      onComplete(newAnswers);
    }
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      const previousQuestionId = questions[currentStep - 1].id;
      setCurrentAnswer(answers[previousQuestionId] || '');
      setTouched(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div
          className="bg-white rounded-lg shadow-lg p-6 sm:p-8"
          role="status"
          aria-live="polite"
          aria-label="Generating clarifying questions"
        >
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div
                className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"
                aria-hidden="true"
              ></div>
              <p className="text-gray-600 font-medium">
                Generating clarifying questions...
              </p>
            </div>
            <div className="space-y-4 pt-4">
              <div className="skeleton-text-lg h-6 w-3/4"></div>
              <div className="skeleton-text h-4 w-full"></div>
              <div className="skeleton-text h-4 w-5/6"></div>
              <div className="skeleton-button w-32 mt-6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            No Questions Generated
          </h3>
          <p className="text-yellow-800">
            We couldn't generate specific questions for your idea.
          </p>
          <p className="text-sm text-yellow-600 mt-4">
            Please go back and try with a more detailed idea.
          </p>
        </div>
      </div>
    );
  }

  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      {/* Error Alert */}
      {error && (
        <div className="mb-4 sm:mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-red-900 mb-2">
              Error
            </h3>
            <p className="text-sm sm:text-base text-red-800">{error}</p>
            <p className="text-xs sm:text-sm text-red-600 mt-4">
              We're using fallback questions to continue.
            </p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Question {currentStep + 1} of {questions.length}
          </span>
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        </div>
        <div
          className="w-full bg-gray-200 rounded-full h-2"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progress: Question ${currentStep + 1} of ${questions.length}`}
        >
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8" role="group">
        <h2
          id="question-label"
          className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6"
        >
          {currentQuestion.question}
        </h2>

        <div className="space-y-4">
          {currentQuestion.type === 'textarea' && (
            <div>
              <textarea
                id="answer-input"
                name="answer"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onBlur={handleBlur}
                placeholder="Enter your answer here..."
                className={`textarea min-h-[100px] ${touched && validationError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                autoFocus
                aria-labelledby="question-label"
                aria-describedby="answer-hint answer-error answer-char-count"
                aria-invalid={touched && validationError ? 'true' : 'false'}
                aria-required="true"
                maxLength={MAX_ANSWER_LENGTH}
              />
              <div className="flex justify-between items-center mt-1">
                <p
                  id="answer-hint"
                  className="text-xs sm:text-sm text-gray-500"
                >
                  Provide your answer to continue to the next step.
                </p>
                <span
                  id="answer-char-count"
                  className={`text-xs ${currentAnswer.length > MAX_ANSWER_LENGTH * 0.9 ? 'text-orange-600 font-medium' : 'text-gray-500'}`}
                  aria-live="polite"
                >
                  {currentAnswer.length} / {MAX_ANSWER_LENGTH}
                </span>
              </div>
            </div>
          )}

          {currentQuestion.type === 'text' && (
            <div>
              <input
                id="answer-input"
                type="text"
                name="answer"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onBlur={handleBlur}
                placeholder="Enter your answer here..."
                className={`input ${touched && validationError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                autoFocus
                aria-labelledby="question-label"
                aria-describedby="answer-hint answer-error answer-char-count"
                aria-invalid={touched && validationError ? 'true' : 'false'}
                aria-required="true"
                maxLength={MAX_ANSWER_LENGTH}
              />
              <div className="flex justify-between items-center mt-1">
                <p
                  id="answer-hint"
                  className="text-xs sm:text-sm text-gray-500"
                >
                  Provide your answer to continue to the next step.
                </p>
                <span
                  id="answer-char-count"
                  className={`text-xs ${currentAnswer.length > MAX_ANSWER_LENGTH * 0.9 ? 'text-orange-600 font-medium' : 'text-gray-500'}`}
                  aria-live="polite"
                >
                  {currentAnswer.length} / {MAX_ANSWER_LENGTH}
                </span>
              </div>
            </div>
          )}

          {currentQuestion.type === 'select' && currentQuestion.options && (
            <div>
              <select
                id="answer-input"
                name="answer"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onBlur={handleBlur}
                className={`input ${touched && !currentAnswer ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                autoFocus
                aria-labelledby="question-label"
                aria-describedby="answer-hint answer-error"
                aria-invalid={touched && !currentAnswer ? 'true' : 'false'}
                aria-required="true"
              >
                <option value="">Select an option...</option>
                {currentQuestion.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <p
                id="answer-hint"
                className="text-xs sm:text-sm text-gray-500 mt-1"
              >
                Provide your answer to continue to the next step.
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav
          className="flex justify-between mt-8"
          aria-label="Question navigation"
        >
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Go to previous question"
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!isValid}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={
              currentStep === questions.length - 1
                ? 'Complete and submit answers'
                : 'Go to next question'
            }
          >
            {currentStep === questions.length - 1 ? 'Complete' : 'Next →'}
          </button>
        </nav>
      </div>
    </div>
  );
}
