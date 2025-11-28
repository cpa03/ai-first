'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import IdeaInput from '@/components/IdeaInput';

export default function HomePage() {
  const router = useRouter();
  const [idea, setIdea] = useState('');
  const [ideaId, setIdeaId] = useState('');

  const handleIdeaSubmit = (submittedIdea: string, submittedIdeaId: string) => {
    setIdea(submittedIdea);
    setIdeaId(submittedIdeaId);

    // Navigate to the clarification page with the idea and ideaId
    router.push(
      `/clarify?idea=${encodeURIComponent(submittedIdea)}&ideaId=${submittedIdeaId}`
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI-Powered Project Planning & Task Management
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Transform raw ideas into actionable project plans with AI. Get
          automated task breakdown, realistic timelines, and comprehensive
          roadmaps in minutes.
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
            Saved with ID: {ideaId}. Redirecting to clarification...
          </p>
        </div>
      )}

      <div className="mt-16 grid md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-600 text-2xl font-bold">1</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Input Your Idea
          </h3>
          <p className="text-gray-600">
            Share your concept in natural language - no technical knowledge
            required
          </p>
        </div>
        <div className="text-center">
          <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-600 text-2xl font-bold">2</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            AI Analysis
          </h3>
          <p className="text-gray-600">
            Our AI clarifies requirements and breaks down complex projects into
            manageable tasks
          </p>
        </div>
        <div className="text-center">
          <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-600 text-2xl font-bold">3</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Action Plan
          </h3>
          <p className="text-gray-600">
            Receive detailed blueprints, timelines, and prioritized task lists
            ready for execution
          </p>
        </div>
      </div>

      <div className="mt-16 bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Why Choose IdeaFlow for Project Planning?
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                AI-Powered Intelligence
              </h3>
              <p className="text-gray-600 text-sm">
                Advanced AI algorithms analyze your ideas and generate
                comprehensive project plans
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Time-Saving Automation
              </h3>
              <p className="text-gray-600 text-sm">
                Reduce planning time by 80% with automated task breakdown and
                timeline generation
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Developer-Friendly
              </h3>
              <p className="text-gray-600 text-sm">
                Export plans to GitHub, Notion, and other tools your team
                already uses
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Collaborative Planning
              </h3>
              <p className="text-gray-600 text-sm">
                Share blueprints with your team and iterate on plans in
                real-time
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
