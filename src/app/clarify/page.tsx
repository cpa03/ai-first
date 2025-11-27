'use client';

import { useState } from 'react';
import ClarificationFlow from '@/components/ClarificationFlow';

export default function ClarifyPage() {
  const [idea] = useState('Sample idea for demonstration'); // This would come from previous step
  const [answers, setAnswers] = useState<Record<string, string> | null>(null);

  const handleClarificationComplete = (
    completedAnswers: Record<string, string>
  ) => {
    setAnswers(completedAnswers);
    // In a real app, this would navigate to the results page
  };

  if (answers) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-900 mb-4">
            Clarification Complete!
          </h2>
          <p className="text-green-800 mb-4">
            Your answers have been collected. Ready to generate your blueprint?
          </p>
          <div className="space-y-2">
            {Object.entries(answers).map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="font-medium text-green-700">{key}:</span>{' '}
                <span className="text-green-600">{value}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-green-600 mt-4">
            This would navigate to the results page to show your blueprint.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Let's Clarify Your Idea
          </h1>
          <p className="text-lg text-gray-600">
            Answer a few questions to help us create the perfect action plan for
            your project.
          </p>
        </div>
      </div>

      <ClarificationFlow onComplete={handleClarificationComplete} />
    </div>
  );
}
