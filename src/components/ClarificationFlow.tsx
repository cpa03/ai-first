'use client';

import { useState } from 'react';

interface Question {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select';
  options?: string[];
}

interface ClarificationFlowProps {
  onComplete: (answers: Record<string, string>) => void;
}

export default function ClarificationFlow({
  onComplete,
}: ClarificationFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');

  // Sample questions - in real app, these would come from AI
  const questions: Question[] = [
    {
      id: 'target_audience',
      question: 'Who is your target audience?',
      type: 'textarea',
    },
    {
      id: 'timeline',
      question: 'What is your desired timeline for this project?',
      type: 'select',
      options: ['1-2 weeks', '1 month', '3 months', '6 months', '1 year'],
    },
    {
      id: 'budget',
      question: 'What is your approximate budget?',
      type: 'select',
      options: ['Under $1,000', '$1,000-$5,000', '$5,000-$20,000', '$20,000+'],
    },
    {
      id: 'technical_skills',
      question: 'What technical skills do you have?',
      type: 'textarea',
    },
    {
      id: 'main_goal',
      question: 'What is the main goal you want to achieve?',
      type: 'textarea',
    },
  ];

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

  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Question {currentStep + 1} of {questions.length}
          </span>
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          {currentQuestion.question}
        </h2>

        <div className="space-y-4">
          {currentQuestion.type === 'textarea' && (
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Enter your answer here..."
              className="textarea min-h-[100px]"
            />
          )}

          {currentQuestion.type === 'text' && (
            <input
              type="text"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Enter your answer here..."
              className="input"
            />
          )}

          {currentQuestion.type === 'select' && currentQuestion.options && (
            <select
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="input"
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
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <button
            onClick={handleNext}
            disabled={!currentAnswer.trim()}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === questions.length - 1 ? 'Complete' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
