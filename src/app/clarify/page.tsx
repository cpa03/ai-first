'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { dbService } from '@/lib/db';
import { createLogger } from '@/lib/logger';
import LoadingSpinner from '@/components/LoadingSpinner';

const Button = dynamic(() => import('@/components/Button'), {
  loading: () => (
    <div className="px-4 py-2 bg-gray-200 rounded-md text-gray-600">
      Loading...
    </div>
  ),
});

const Alert = dynamic(() => import('@/components/Alert'), {
  loading: () => <div className="bg-gray-100 p-4">Loading...</div>,
});

const DynamicClarificationFlow = dynamic(
  () => import('@/components/ClarificationFlow').then((mod) => mod.default),
  {
    loading: () => (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <LoadingSpinner
            size="md"
            className="mb-4"
            ariaLabel="Loading clarification flow"
          />
          <p className="text-gray-600">Loading clarification flow...</p>
        </div>
      </div>
    ),
  }
);

// Inner component that uses useSearchParams
function ClarifyPageContent() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const logger = createLogger('ClarifyPage');

  // Use useMemo to read URL parameters on initial render without causing cascading renders
  const { idea, ideaId, hasLoaded } = useMemo(() => {
    if (typeof window === 'undefined') {
      return { idea: '', ideaId: '', hasLoaded: false };
    }

    const urlParams = new URLSearchParams(window.location.search);
    const ideaFromUrl = urlParams.get('idea');
    const ideaIdFromUrl = urlParams.get('ideaId');

    return {
      idea: ideaFromUrl ? decodeURIComponent(ideaFromUrl) : '',
      ideaId: ideaIdFromUrl || '',
      hasLoaded: true,
    };
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

      // In a real app, this would navigate to results page
      // For now, we'll just show the completion message
    } catch (err) {
      logger.errorWithContext('Failed to save clarification answers', {
        component: 'ClarifyPage',
        action: 'handleClarificationComplete',
        metadata: {
          ideaId,
          error: err instanceof Error ? err.message : 'Unknown error',
        },
      });
      setError('Failed to save your answers. Please try again.');
    }
  };

  if (!hasLoaded) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center fade-in">
          <LoadingSpinner
            size="md"
            className="mb-4"
            ariaLabel="Loading clarification flow"
          />
          <p className="text-gray-600">Loading clarification flow...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="slide-up">
          <Alert type="error" title="Error">
            <p className="mb-4">{error}</p>
            <Button
              onClick={() => router.back()}
              variant="primary"
              aria-label="Go back to previous page"
            >
              Go Back
            </Button>
          </Alert>
        </div>
      </div>
    );
  }

  if (answers) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="slide-up">
          <Alert type="success" title="Clarification Complete!">
            <p className="mb-4">
              Your answers have been collected. Ready to generate your
              blueprint?
            </p>
            <div className="bg-white border border-gray-200 rounded-md p-4 mb-4 space-y-2">
              {Object.entries(answers).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="font-medium text-gray-700">
                    {key.replace(/_/g, ' ')}:
                  </span>{' '}
                  <span className="text-gray-600">{value}</span>
                </div>
              ))}
            </div>
            <Button
              onClick={() => router.push('/results')}
              variant="primary"
              aria-label="Generate blueprint from clarified answers"
            >
              Generate Blueprint
            </Button>
          </Alert>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="slide-up">
          <Alert type="warning" title="No Idea Provided">
            <p className="mb-4">Please provide an idea to clarify.</p>
            <Button
              onClick={() => router.push('/')}
              variant="primary"
              aria-label="Navigate to home page to provide an idea"
            >
              Go to Home
            </Button>
          </Alert>
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

      <DynamicClarificationFlow
        idea={idea}
        ideaId={ideaId}
        onComplete={handleClarificationComplete}
      />
    </div>
  );
}

// Main page component
export default function ClarifyPage() {
  return <ClarifyPageContent />;
}
