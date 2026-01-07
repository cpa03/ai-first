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

  const handleNext = () => {
    if (!currentAnswer.trim()) return;

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
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Restore previous answer
      const previousQuestionId = questions[currentStep - 1].id;
      setCurrentAnswer(answers[previousQuestionId] || '');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto" role="status" aria-live="polite">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-4" aria-hidden="true">
            <div className="w-8 h-8 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Generating clarifying questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto" role="alert" aria-live="assertive">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
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
      </div>
    );
  }

  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Error Alert */}
      {error && (
        <div className="mb-6" role="alert" aria-live="assertive">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
              <p className="text-red-800">{error}</p>
              <p className="text-sm text-red-600 mt-4">
                We're using fallback questions to continue.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-8" aria-live="polite" aria-atomic="true">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Question {currentStep + 1} of {questions.length}
          </span>
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        </div>
        <div
          className="w-full bg-gray-200 rounded-full h-2 overflow-hidden"
          role="progressbar"
          aria-valuenow={currentStep + 1}
          aria-valuemin={1}
          aria-valuemax={questions.length}
          aria-label={`Question ${currentStep + 1} of ${questions.length}`}
        >
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <section
        aria-labelledby="question-heading"
        className="bg-white rounded-lg shadow-lg p-8"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}
        >
          <h2
            id="question-heading"
            className="text-2xl font-semibold text-gray-900 mb-6"
          >
            {currentQuestion.question}
          </h2>

          <div className="space-y-4">
            {currentQuestion.type === 'textarea' && (
              <label htmlFor="answer-textarea" className="sr-only">
                Your answer
              </label>
            )}
            {currentQuestion.type === 'textarea' && (
              <textarea
                id="answer-textarea"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Enter your answer here..."
                className="textarea min-h-[100px]"
                autoFocus
                aria-required="true"
              />
            )}

            {currentQuestion.type === 'text' && (
              <label htmlFor="answer-text" className="sr-only">
                Your answer
              </label>
            )}
            {currentQuestion.type === 'text' && (
              <input
                id="answer-text"
                type="text"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Enter your answer here..."
                className="input"
                autoFocus
                aria-required="true"
              />
            )}

            {currentQuestion.type === 'select' && currentQuestion.options && (
              <label htmlFor="answer-select" className="sr-only">
                Select an option
              </label>
            )}
            {currentQuestion.type === 'select' && currentQuestion.options && (
              <select
                id="answer-select"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                className="input"
                autoFocus
                aria-required="true"
              >
                <option value="">Select an option...</option>
                {currentQuestion.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
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
              type="submit"
              disabled={!currentAnswer.trim()}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={
                currentStep === questions.length - 1
                  ? 'Complete clarification'
                  : 'Go to next question'
              }
            >
              {currentStep === questions.length - 1 ? 'Complete' : 'Next →'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
