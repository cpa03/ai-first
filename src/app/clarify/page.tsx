'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { dbService } from '@/lib/db';

const ClarificationFlow = dynamic(
  () => import('@/components/ClarificationFlow').then((mod) => mod.default),
  {
    loading: () => (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-8 h-8 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading clarification flow...</p>
        </div>
      </div>
    ),
  }
);

export default function ClarifyPage() {
  const router = useRouter();
  const [idea, setIdea] = useState<string>('');
  const [ideaId, setIdeaId] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get idea from query params or session storage
    const urlParams = new URLSearchParams(window.location.search);
    const ideaFromUrl = urlParams.get('idea');
    const ideaIdFromUrl = urlParams.get('ideaId');

    if (ideaFromUrl) {
      setIdea(decodeURIComponent(ideaFromUrl));
    }

    if (ideaIdFromUrl) {
      setIdeaId(ideaIdFromUrl);
    }

    setLoading(false);
  }, []);

  const handleClarificationComplete = async (
    completedAnswers: Record<string, string>
  ) => {
    try {
      // Store answers in database if ideaId is available
      if (ideaId) {
        // Update idea status to 'clarified'
        await dbService.updateIdea(ideaId, { status: 'clarified' });
      }

      setAnswers(completedAnswers);

      // In a real app, this would navigate to the results page
      // For now, we'll just show the completion message
    } catch (err) {
      console.error('Error storing clarification answers:', err);
      setError('Failed to save your answers. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-8 h-8 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading clarification flow...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-4">Error</h2>
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 btn btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

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
          <div className="mt-6">
            <button
              onClick={() => router.push('/results')}
              className="btn btn-primary"
            >
              Generate Blueprint
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-900 mb-4">
            No Idea Provided
          </h2>
          <p className="text-yellow-800">Please provide an idea to clarify.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 btn btn-primary"
          >
            Go to Home
          </button>
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
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Your idea:</p>
            <p className="font-medium text-gray-900">{idea}</p>
          </div>
        </div>
      </div>

      <ClarificationFlow
        idea={idea}
        ideaId={ideaId}
        onComplete={handleClarificationComplete}
      />
    </div>
  );
}
