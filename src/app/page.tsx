'use client';

import { useState } from 'react';
import IdeaInput from '@/components/IdeaInput';

export default function HomePage() {
  const [idea, setIdea] = useState('');

  const handleIdeaSubmit = (submittedIdea: string) => {
    setIdea(submittedIdea);
    // In a real app, this would navigate to the clarification page
    // For now, we'll just update state
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Turn Your Ideas Into Action Plans
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Transform your raw ideas into production-ready plans with AI-powered
          clarification and task breakdown.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <IdeaInput onSubmit={handleIdeaSubmit} />
      </div>

      {idea && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Your Idea:
          </h3>
          <p className="text-blue-800">{idea}</p>
          <p className="text-sm text-blue-600 mt-4">
            Ready to clarify? This would navigate to the clarification step.
          </p>
        </div>
      )}

      <div className="mt-16 grid md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-600 text-2xl font-bold">1</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Enter Your Idea
          </h3>
          <p className="text-gray-600">Share your raw idea in simple terms</p>
        </div>
        <div className="text-center">
          <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-600 text-2xl font-bold">2</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Get Clarified
          </h3>
          <p className="text-gray-600">
            AI asks the right questions to refine your concept
          </p>
        </div>
        <div className="text-center">
          <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-600 text-2xl font-bold">3</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Receive Blueprint
          </h3>
          <p className="text-gray-600">
            Get a detailed action plan with prioritized tasks
          </p>
        </div>
      </div>
    </div>
  );
}
