'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dbService, Idea, IdeaSession } from '@/lib/db';
import BlueprintDisplay from '@/components/BlueprintDisplay';
import Button from '@/components/Button';
import Alert from '@/components/Alert';

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
    );
  }

  if (!idea) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Alert type="warning" title="No Idea Found">
          <p className="mb-4">The idea you're looking for doesn't exist.</p>
          <Button
            onClick={() => router.push('/')}
            variant="primary"
            aria-label="Navigate to home page"
          >
            Go Home
          </Button>
        </Alert>
      </div>
    );
  }

  // Use the BlueprintDisplay component with real data
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Project Blueprint</h1>
        <Button
          onClick={() => router.back()}
          variant="secondary"
          aria-label="Go back to previous page"
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

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Export Your Blueprint
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => handleExport('markdown')}
            disabled={exportLoading}
            loading={exportLoading}
            variant="primary"
            aria-label="Download project blueprint as Markdown file"
          >
            {exportLoading ? 'Exporting...' : 'Download Markdown'}
          </Button>

          <Button
            onClick={() => handleExport('json')}
            disabled={exportLoading}
            loading={exportLoading}
            variant="secondary"
            aria-label="Export project blueprint as JSON file"
          >
            {exportLoading ? 'Exporting...' : 'Export JSON'}
          </Button>

          <Button
            variant="outline"
            disabled
            aria-label="Export to Notion (coming soon)"
          >
            Export to Notion
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
