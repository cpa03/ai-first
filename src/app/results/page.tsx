'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dbService, Idea, IdeaSession } from '@/lib/db';
import { exportManager, exportUtils } from '@/lib/exports';
import { clarifierAgent } from '@/lib/clarifier';
import BlueprintDisplay from '@/components/BlueprintDisplay';
import ExportOptions from '@/components/ExportOptions';

export default function ResultsPage() {
  const router = useRouter();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [session, setSession] = useState<IdeaSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportResult, setExportResult] = useState<{
    success: boolean;
    url?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);

        // Get ideaId from query params
        const urlParams = new URLSearchParams(window.location.search);
        const ideaId = urlParams.get('ideaId');

        if (!ideaId) {
          throw new Error('Idea ID is required');
        }

        // Fetch the idea and session
        const ideaData = await dbService.getIdea(ideaId);
        if (!ideaData) {
          throw new Error('Idea not found');
        }

        const sessionData = await dbService.getIdeaSession(ideaId);

        setIdea(ideaData);
        setSession(sessionData);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const handleExportComplete = (result: {
    success: boolean;
    url?: string;
    error?: string;
  }) => {
    setExportResult(result);

    if (result.success && result.url) {
      // For markdown and JSON, trigger download
      if (result.url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = result.url;
        const format = result.url.includes('markdown') ? 'md' : 'json';
        link.download = `project-blueprint-${idea?.id}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else if (result.error) {
      setError(result.error);
    }
  };

  const getExportData = () => {
    if (!idea) return null;

    const exportData = exportUtils.normalizeData(idea);

    if (session && session.state.answers) {
      exportData.metadata.goals = session.state.answers.main_goal || '';
      exportData.metadata.target_audience =
        session.state.answers.target_audience || '';
    }

    return exportData;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-8 h-8 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Generating your project blueprint...</p>
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

  if (!idea) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-900 mb-4">
            No Idea Found
          </h2>
          <p className="text-yellow-800">
            The idea you're looking for doesn't exist.
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 btn btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Use the BlueprintDisplay component with real data
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Project Blueprint</h1>
        <button onClick={() => router.back()} className="btn btn-secondary">
          ← Back
        </button>
      </div>

      <BlueprintDisplay
        idea={idea.raw_text}
        answers={session?.state.answers || {}}
      />

      {/* Export Options */}
      <ExportOptions
        data={getExportData()}
        onExportComplete={handleExportComplete}
      />

      {/* Export Result Messages */}
      {exportResult && (
        <div
          className={`mt-6 p-4 rounded-lg ${
            exportResult.success
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <p
            className={exportResult.success ? 'text-green-800' : 'text-red-800'}
          >
            {exportResult.success
              ? exportResult.url && !exportResult.url.startsWith('data:')
                ? `Export successful! View your project at: ${exportResult.url}`
                : 'Export successful! The file should download automatically.'
              : exportResult.error}
          </p>
        </div>
      )}
    </div>
  );
}
