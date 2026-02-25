'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { exportManager, exportUtils } from '@/lib/export-connectors';
import { createLogger } from '@/lib/logger';
import { fetchWithTimeout } from '@/lib/api-client';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import Alert from '@/components/Alert';
import Tooltip from '@/components/Tooltip';
import ShareButton from '@/components/ShareButton';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics';
import dynamic from 'next/dynamic';

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

const TaskManagement = dynamic(
  () => import('@/components/TaskManagement').then((mod) => mod.default),
  {
    loading: () => (
      <div className="bg-white rounded-lg shadow-lg p-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    ),
  }
);

const logger = createLogger('ResultsPage');

// Inner component that uses useSearchParams
function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [session, setSession] = useState<IdeaSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);
  const [connectorHealth, setConnectorHealth] = useState<
    Record<string, { configured: boolean; name: string }>
  >({});
  const { isAuthenticated, isLoading: authLoading } = useAuthCheck();

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setLoading(false);
      setError('Please sign in to view results');
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);

        const ideaId = searchParams.get('ideaId');

        if (!ideaId) {
          router.push('/dashboard');
          return;
        }

        const [ideaResponse, sessionResponse] = await Promise.all([
          fetchWithTimeout(`/api/ideas/${ideaId}`),
          fetchWithTimeout(`/api/ideas/${ideaId}/session`),
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
        logger.error('Error fetching results:', err);
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [router, searchParams, authLoading, isAuthenticated]);

  // Check connector health on mount
  useEffect(() => {
    const checkConnectorHealth = async () => {
      try {
        const health = await exportManager.getConnectorsHealth();
        setConnectorHealth(health);
      } catch (error) {
        logger.error('Error checking connector health:', error);
      }
    };

    checkConnectorHealth();
  }, []);

  const handleExport = async (
    format:
      | 'markdown'
      | 'json'
      | 'notion'
      | 'trello'
      | 'google-tasks'
      | 'github-projects'
  ) => {
    if (!idea) return;

    setExportLoading(true);
    setExportingFormat(format);

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
      logger.error('Export error:', err);
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExportLoading(false);
      setExportingFormat(null);
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
        <Alert type="error" title="Error">
          {error}
          <div className="mt-4">
            <Button onClick={() => router.back()} variant="primary">
              Go Back
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Alert type="warning" title="No Idea Found">
          The idea you&apos;re looking for doesn&apos;t exist.
          <div className="mt-4">
            <Button onClick={() => router.push('/')} variant="primary">
              Go Home
            </Button>
          </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Markdown Export */}
          <Button
            variant="primary"
            onClick={() => handleExport('markdown')}
            disabled={exportLoading}
            aria-label="Download project blueprint as Markdown file"
          >
            {exportingFormat === 'markdown'
              ? 'Exporting...'
              : 'Download Markdown'}
          </Button>

          {/* JSON Export */}
          <Button
            variant="secondary"
            onClick={() => handleExport('json')}
            disabled={exportLoading}
            aria-label="Export project blueprint as JSON data"
          >
            {exportingFormat === 'json' ? 'Exporting...' : 'Export JSON'}
          </Button>

          {/* Notion Export */}
          {connectorHealth.notion?.configured ? (
            <Button
              variant="outline"
              onClick={() => handleExport('notion')}
              disabled={exportLoading}
              aria-label="Export project to Notion"
            >
              {exportingFormat === 'notion'
                ? 'Exporting...'
                : 'Export to Notion'}
            </Button>
          ) : (
            <Tooltip
              content="Configure NOTION_API_KEY in environment to enable Notion export"
              position="top"
            >
              <Button
                variant="outline"
                disabled={true}
                aria-label="Export to Notion - requires API configuration"
              >
                Export to Notion
                <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  Setup Required
                </span>
              </Button>
            </Tooltip>
          )}

          {/* Trello Export */}
          {connectorHealth.trello?.configured ? (
            <Button
              variant="outline"
              onClick={() => handleExport('trello')}
              disabled={exportLoading}
              aria-label="Export project to Trello"
            >
              {exportingFormat === 'trello'
                ? 'Exporting...'
                : 'Export to Trello'}
            </Button>
          ) : (
            <Tooltip
              content="Configure TRELLO_API_KEY in environment to enable Trello export"
              position="top"
            >
              <Button
                variant="outline"
                disabled={true}
                aria-label="Export to Trello - requires API configuration"
              >
                Export to Trello
                <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  Setup Required
                </span>
              </Button>
            </Tooltip>
          )}

          {/* Google Tasks Export */}
          {connectorHealth['google-tasks']?.configured ? (
            <Button
              variant="outline"
              onClick={() => handleExport('google-tasks')}
              disabled={exportLoading}
              aria-label="Export tasks to Google Tasks"
            >
              {exportingFormat === 'google-tasks'
                ? 'Exporting...'
                : 'Export to Google Tasks'}
            </Button>
          ) : (
            <Tooltip
              content="Configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in environment to enable Google Tasks export"
              position="top"
            >
              <Button
                variant="outline"
                disabled={true}
                aria-label="Export to Google Tasks - requires API configuration"
              >
                Export to Google Tasks
                <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  Setup Required
                </span>
              </Button>
            </Tooltip>
          )}

          {/* GitHub Projects Export */}
          {connectorHealth['github-projects']?.configured ? (
            <Button
              variant="outline"
              onClick={() => handleExport('github-projects')}
              disabled={exportLoading}
              aria-label="Export tasks to GitHub Projects"
            >
              {exportingFormat === 'github-projects'
                ? 'Exporting...'
                : 'Export to GitHub Projects'}
            </Button>
          ) : (
            <Tooltip
              content="Configure GITHUB_TOKEN in environment to enable GitHub Projects export"
              position="top"
            >
              <Button
                variant="outline"
                disabled={true}
                aria-label="Export to GitHub Projects - requires API configuration"
              >
                Export to GitHub Projects
                <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  Setup Required
                </span>
              </Button>
            </Tooltip>
          )}
        </div>

        {exportUrl && (
          <div className="mt-6">
            <Alert type="success" title="Export Successful">
              The file should download automatically.
            </Alert>
          </div>
        )}
      </div>

      {/* Share Options - Growth: Viral sharing for user acquisition */}
      <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Share Your Blueprint
        </h2>
        <p className="text-gray-600 mb-6">
          Love your project blueprint? Share it with your network to inspire
          others!
        </p>
        <div className="flex flex-wrap gap-4">
          <ShareButton
            shareTitle={`Check out my project blueprint on IdeaFlow!`}
            shareText={`I just created a project blueprint using IdeaFlow's AI-powered planning tool. Transform your ideas into action!`}
            label="Share Blueprint"
            successLabel="Shared!"
            ariaLabel="Share your project blueprint"
            onShare={() => {
              // Growth: Track social share event
              trackEvent(ANALYTICS_EVENTS.SOCIAL_SHARE, {
                share_platform: 'web_share',
                idea_id: idea.id,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Main export with Suspense boundary
export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <LoadingSpinner
              size="md"
              className="mb-4"
              ariaLabel="Loading results page"
            />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
