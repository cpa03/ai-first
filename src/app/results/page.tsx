'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dbService, Idea, IdeaSession } from '@/lib/db';
import BlueprintDisplay from '@/components/BlueprintDisplay';

export default function ResultsPage() {
  const router = useRouter();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [session, setSession] = useState<IdeaSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);

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

  const handleExport = async (format: 'markdown' | 'json') => {
    if (!idea) return;

    setExportLoading(true);

    try {
      const lazyExporters = await import('@/lib/export-connectors/lazy');

      // Prepare data for export
      const exportData = {
        idea: {
          id: idea.id,
          title: idea.title,
          raw_text: idea.raw_text,
          status: idea.status,
          created_at: idea.created_at,
        },
        deliverables: [],
        tasks: [],
        metadata: {
          exported_at: new Date().toISOString(),
          version: '1.0.0',
          goals: '',
          target_audience: '',
        },
      };

      if (
        session &&
        session.state.answers &&
        typeof session.state.answers === 'object'
      ) {
        const answers = session.state.answers as Record<string, unknown>;
        exportData.metadata.goals = (answers.main_goal as string) || '';
        exportData.metadata.target_audience =
          (answers.target_audience as string) || '';
      }

      // Export data using lazy loading
      let result: {
        success: boolean;
        url?: string;
        error?: string;
        content?: string;
      };

      if (format === 'markdown') {
        result = await lazyExporters.lazyExportToMarkdown(exportData);
      } else {
        result = await lazyExporters.lazyExportToJSON(exportData);
      }

      if (result.success && result.url) {
        setExportUrl(result.url);

        // For markdown, we'll create a download link
        if (format === 'markdown') {
          const link = document.createElement('a');
          link.href = result.url;
          link.download = `project-blueprint-${idea.id}.md`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (err) {
      console.error('Export error:', err);
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExportLoading(false);
    }
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
        answers={
          session?.state.answers && typeof session.state.answers === 'object'
            ? Object.fromEntries(
                Object.entries(session.state.answers).map(([key, value]) => [
                  key,
                  String(value),
                ])
              )
            : {}
        }
      />

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Export Your Blueprint
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleExport('markdown')}
            disabled={exportLoading}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportLoading ? 'Exporting...' : 'Download Markdown'}
          </button>

          <button
            onClick={() => handleExport('json')}
            disabled={exportLoading}
            className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportLoading ? 'Exporting...' : 'Export JSON'}
          </button>

          <button className="btn btn-outline" disabled>
            Export to Notion
          </button>
        </div>

        {exportUrl && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <p className="text-green-800">
              Export successful! The file should download automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
