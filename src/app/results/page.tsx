'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { exportManager, exportUtils } from '@/lib/export-connectors';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import dynamic from 'next/dynamic';
import TaskManagement from '@/components/TaskManagement';
import { createLogger } from '@/lib/logger';

const logger = createLogger('ResultsPage');

interface Idea {
  id: string;
  user_id: string;
  title: string;
  raw_text: string;
  status: 'draft' | 'clarified' | 'breakdown' | 'completed';
  deleted_at: string | null;
  created_at: string;
}

interface IdeaSession {
  idea_id: string;
  state: Record<string, unknown>;
  last_agent: string;
  metadata: Record<string, unknown>;
  updated_at: string;
}

const BlueprintDisplay = dynamic(
  () => import('@/components/BlueprintDisplay').then((mod) => mod.default),
  {
    loading: () => (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <LoadingSpinner
          size="md"
          className="mb-4"
          ariaLabel="Loading blueprint"
        />
        <p className="text-gray-600">Loading blueprint...</p>
      </div>
    ),
  }
);

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

        const urlParams = new URLSearchParams(window.location.search);
        const ideaId = urlParams.get('ideaId');

        if (!ideaId) {
          throw new Error('Idea ID is required');
        }

        const [ideaResponse, sessionResponse] = await Promise.all([
          fetch(`/api/ideas/${ideaId}`),
          fetch(`/api/ideas/${ideaId}/session`),
        ]);

        if (!ideaResponse.ok) {
          const errorData = await ideaResponse.json();
          throw new Error(errorData.error || 'Failed to fetch idea');
        }

        const ideaData = await ideaResponse.json();

        if (!ideaData.success || !ideaData.data) {
          throw new Error('Idea not found');
        }

        const sessionData = sessionResponse.ok
          ? await sessionResponse.json()
          : null;

        setIdea(ideaData.data);
        setSession(sessionData?.data || null);
      } catch (err) {
        logger.error('Error fetching results', err);
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
      // Prepare data for export
      const exportData = exportUtils.normalizeData({
        ...idea,
        deleted_at: idea.deleted_at ?? null,
      });

      if (
        session &&
        session.state.answers &&
        typeof session.state.answers === 'object'
      ) {
        const answers = session.state.answers as Record<string, unknown>;
        exportData.goals = [(answers.main_goal as string) || ''];
        exportData.target_audience = (answers.target_audience as string) || '';
      }

      // Export the data
      const result = await exportManager.export({
        type: format,
        data: exportData,
      });

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
      logger.error('Export error', err);
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <LoadingSpinner
            size="md"
            className="mb-4"
            ariaLabel="Generating your project blueprint"
          />
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
          <div className="mt-4">
            <Button onClick={() => router.back()} variant="primary">
              Go Back
            </Button>
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
            No Idea Found
          </h2>
          <p className="text-yellow-800">
            The idea you're looking for doesn't exist.
          </p>
          <div className="mt-4">
            <Button onClick={() => router.push('/')} variant="primary">
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Use the BlueprintDisplay component with real data
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Project Blueprint</h1>
        <Button
          variant="secondary"
          onClick={() => router.back()}
          aria-label="Return to previous page"
        >
          ← Back
        </Button>
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

      {/* Task Management */}
      <div className="mt-8">
        <TaskManagement ideaId={idea.id} />
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Export Your Blueprint
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="primary"
            onClick={() => handleExport('markdown')}
            disabled={exportLoading}
            aria-label="Download project blueprint as Markdown file"
          >
            {exportLoading ? 'Exporting...' : 'Download Markdown'}
          </Button>

          <Button
            variant="secondary"
            onClick={() => handleExport('json')}
            disabled={exportLoading}
            aria-label="Export project blueprint as JSON data"
          >
            {exportLoading ? 'Exporting...' : 'Export JSON'}
          </Button>

          <Button
            variant="outline"
            disabled={true}
            title="Export to Notion - Coming soon"
            aria-label="Export to Notion - Coming soon, this feature is not yet available"
          >
            Export to Notion
            <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
              Coming Soon
            </span>
          </Button>
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
