'use client';

import {
  useState,
  useEffect,
  Suspense,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { exportManager, exportUtils } from '@/lib/export-connectors';
import { createLogger } from '@/lib/logger';
import { fetchWithTimeout } from '@/lib/api-client';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useConfetti } from '@/hooks/useConfetti';
import { trackEvent, ANALYTICS_EVENTS, trackFunnelStep } from '@/lib/analytics';
import { isFocusedOnInput, PLATFORM } from '@/lib/dom-utils';
import { triggerHapticFeedback } from '@/lib/utils';
import { useKeyboardShortcuts } from '@/components/KeyboardShortcutsProvider';
import {
  SPINNER_PATTERNS,
  CARD_PATTERNS,
  LOADING_PATTERNS,
  EXPORT_LABELS,
  API_ERROR_MESSAGES,
  ROUTES,
  API_ROUTES,
  RESULTS_PAGE_CONTENT,
  PAGE_LAYOUT_CLASSES,
  ANIMATION_DELAYS,
  COMPONENT_CONFIG,
  ELEMENT_PATTERNS,
  UI_CONFIG,
  BREATHE,
  GRAY_CLASSES,
  BADGE_STYLES,
  DASHBOARD_PATTERNS,
  SVG_SIZES,
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  KEYBOARD_SHORTCUTS_HELP_LABELS,
  KBD_HINT_STYLE,
  CONFETTI_DOT,
  ICON_SIZES,
  GAP_CLASSES,
  MT_CLASSES,
  MB_CLASSES,
  PY_CLASSES,
  SPACE_Y_PATTERNS,
  RESPONSIVE_SPACING,
} from '@/lib/config';
import {
  RESULTS_SUCCESS_CONTAINER,
  RESULTS_SHARE_BUTTON_CONTAINER,
  FLEX_CENTER,
  MARGIN_BOTTOM_4,
} from '@/lib/config/remaining-hardcoded-patterns';

const ScrollProgress = dynamic(() => import('@/components/ScrollProgress'), {
  ssr: false,
});

// Micro-UX: Lazy load SectionIndicator for section navigation
const SectionIndicator = dynamic(
  () => import('@/components/SectionIndicator'),
  {
    ssr: false,
  }
);

// Lazy load Button and LoadingSpinner for code splitting
const Button = dynamic(() => import('@/components/Button'), {
  ssr: false,
  loading: () => (
    <button className={SPINNER_PATTERNS.placeholder.container} disabled>
      {RESULTS_PAGE_CONTENT.LOADING_SHORT}
    </button>
  ),
});

const LoadingSpinner = dynamic(() => import('@/components/LoadingSpinner'), {
  ssr: false,
  loading: () => (
    <div className={FLEX_CENTER}>
      <div
        className={`animate-spin rounded-full ${SPINNER_PATTERNS.default.size.md} ${SPINNER_PATTERNS.default.border} ${SPINNER_PATTERNS.default.borderColor}`}
      ></div>
    </div>
  ),
});

const Alert = dynamic(() => import('@/components/Alert'), {
  ssr: false,
  loading: () => (
    <div className={LOADING_PATTERNS.ROUNDED}>
      {RESULTS_PAGE_CONTENT.LOADING_SHORT}
    </div>
  ),
});

const Tooltip = dynamic(() => import('@/components/Tooltip'), {
  ssr: false,
});

const ShareButton = dynamic(() => import('@/components/ShareButton'), {
  ssr: false,
  loading: () => (
    <button className={SPINNER_PATTERNS.placeholder.container}>
      {RESULTS_PAGE_CONTENT.LOADING_SHORT}
    </button>
  ),
});

const EmailButton = dynamic(() => import('@/components/EmailButton'), {
  ssr: false,
  loading: () => (
    <button className={SPINNER_PATTERNS.placeholder.container}>
      {RESULTS_PAGE_CONTENT.LOADING_SHORT}
    </button>
  ),
});

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
    ssr: false,
    loading: () => (
      <div className={CARD_PATTERNS.CENTERED}>
        <LoadingSpinner
          size="md"
          className={MARGIN_BOTTOM_4}
          ariaLabel={RESULTS_PAGE_CONTENT.LOADING}
          label={RESULTS_PAGE_CONTENT.LOADING}
        />
      </div>
    ),
  }
);

const TaskManagement = dynamic(
  () => import('@/components/TaskManagement').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className={CARD_PATTERNS.SKELETON}>
        <div
          className={`h-6 ${GRAY_CLASSES.BG_200} rounded w-1/3 ${MB_CLASSES.XL}`}
        ></div>
        <div className={SPACE_Y_PATTERNS.MD}>
          <div className={`h-4 ${GRAY_CLASSES.BG_200} rounded`}></div>
          <div className={`h-4 ${GRAY_CLASSES.BG_200} rounded w-5/6`}></div>
          <div className={`h-4 ${GRAY_CLASSES.BG_200} rounded w-4/6`}></div>
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
  const prefersReducedMotion = usePrefersReducedMotion();
  // Micro-UX: Detect platform for keyboard shortcut display (Mac vs Windows/Linux)
  const [isMac, setIsMac] = useState(false);
  // Micro-UX: Confetti celebration on successful export for delightful feedback
  const { particles, fire } = useConfetti();
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const { openHelp } = useKeyboardShortcuts();
  // Micro-UX: Ref for auto-scrolling to export success alert
  // Ensures users see their export confirmation even if they've scrolled down to the export buttons
  const exportSuccessRef = useRef<HTMLDivElement>(null);

  // Detect platform for keyboard shortcut display
  useEffect(() => {
    setIsMac(PLATFORM.isMac());
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setLoading(false);
      setError(RESULTS_PAGE_CONTENT.AUTH_REQUIRED_MESSAGE);
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);

        const ideaId = searchParams.get('ideaId');

        if (!ideaId) {
          router.push(ROUTES.DASHBOARD);
          return;
        }

        const [ideaResponse, sessionResponse] = await Promise.all([
          fetchWithTimeout(`${API_ROUTES.IDEAS}/${ideaId}`),
          fetchWithTimeout(`${API_ROUTES.IDEAS}/${ideaId}/session`),
        ]);

        if (!ideaResponse.ok) {
          const errorData = await ideaResponse.json();
          throw new Error(
            errorData.error || API_ERROR_MESSAGES.INTERNAL.FETCH_IDEA_FAILED
          );
        }

        const ideaData = await ideaResponse.json();

        if (!ideaData.success || !ideaData.data) {
          throw new Error(API_ERROR_MESSAGES.NOT_FOUND.IDEA);
        }

        const sessionData = sessionResponse.ok
          ? await sessionResponse.json()
          : null;

        setIdea(ideaData.data);
        setSession(sessionData?.data || null);

        // Growth: Track funnel completion - user reached results (step 4 of 4)
        trackFunnelStep('idea_submission', 4, 4);
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

  const handleExport = useCallback(
    async (
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
          exportData.target_audience =
            (answers.target_audience as string) || '';
        }

        const result = await exportManager.export({
          type: format,
          data: exportData,
        });

        if (result.success && result.url) {
          setExportUrl(result.url);
          fire();
          setShowExportSuccess(true);
          setTimeout(
            () => setShowExportSuccess(false),
            COMPONENT_CONFIG.COPY_FEEDBACK.DURATION_MS
          );

          if (format === 'markdown') {
            const link = document.createElement('a');
            link.href = result.url;
            link.download = `project-blueprint-${idea.id}.md`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        } else {
          throw new Error(
            result.error || API_ERROR_MESSAGES.SERVICE.EXPORT_FAILED
          );
        }
      } catch (err) {
        logger.error('Export error:', err);
        setError(
          err instanceof Error
            ? err.message
            : API_ERROR_MESSAGES.SERVICE.EXPORT_FAILED
        );
      } finally {
        setExportLoading(false);
        setExportingFormat(null);
      }
    },
    [idea, session, fire]
  );

  // Micro-UX: Keyboard shortcuts for all export formats
  // Provides power users with quick access to all export options via keyboard
  // Matches the existing Cmd+E pattern for markdown export
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey) {
        if (!exportLoading && idea) {
          switch (e.key.toLowerCase()) {
            case 'e':
              e.preventDefault();
              handleExport('markdown');
              break;
            case 'j':
              e.preventDefault();
              handleExport('json');
              break;
            case 'n':
              e.preventDefault();
              handleExport('notion');
              break;
            case 't':
              e.preventDefault();
              handleExport('trello');
              break;
            case 'g':
              e.preventDefault();
              handleExport('google-tasks');
              break;
            case 'h':
              e.preventDefault();
              handleExport('github-projects');
              break;
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [exportLoading, idea, handleExport]);

  // Micro-UX: Enter key navigation for error and warning states
  // Matches the keyboard shortcut patterns in clarify, not-found, and dashboard pages
  // Provides discoverable keyboard navigation consistent with the rest of the app
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFocusedOnInput(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'Enter') {
        if (error) {
          e.preventDefault();
          router.back();
        } else if (!idea && !loading) {
          e.preventDefault();
          router.push(ROUTES.HOME);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [error, idea, loading, router]);

  // Micro-UX: ? key opens keyboard shortcuts help panel
  // Provides discoverability for users who want to see all available shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFocusedOnInput(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === '?' && idea && !loading) {
        e.preventDefault();
        openHelp();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [idea, loading, openHelp]);

  // Micro-UX: 'n' key navigates to home page for new idea
  // Matches the dashboard's 'n' shortcut for consistency across the app
  // Helps users quickly loop back to create new ideas after reviewing results
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFocusedOnInput(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'n' && idea && !loading) {
        e.preventDefault();
        triggerHapticFeedback();
        router.push(ROUTES.HOME);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [idea, loading, router]);

  // Micro-UX: Section jump shortcuts for quick navigation on long results pages
  // b = Blueprint, t = Tasks, e = Exports
  // Matches the j/k navigation pattern from dashboard for consistency
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFocusedOnInput(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (!idea || loading) return;

      const scrollToSection = (id: string) => {
        e.preventDefault();
        triggerHapticFeedback();
        document.getElementById(id)?.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      };

      switch (e.key) {
        case 'b':
          scrollToSection('blueprint-section');
          break;
        case 't':
          scrollToSection('tasks-section');
          break;
        case 'e':
          scrollToSection('exports-section');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [idea, loading, prefersReducedMotion]);

  // Micro-UX: Auto-scroll to export success alert when export completes
  // Users may have scrolled down to click export buttons; this ensures they see the confirmation
  useEffect(() => {
    if (showExportSuccess && exportSuccessRef.current) {
      const timer = setTimeout(() => {
        exportSuccessRef.current?.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'center',
        });
      }, COMPONENT_CONFIG.DELIVERABLE_CARD.EXPAND_SCROLL_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [showExportSuccess, prefersReducedMotion]);

  // PERFORMANCE: Memoize formatted answers to prevent unnecessary re-renders of memoized
  // child components (BlueprintDisplay, EmailButton) when ResultsContent re-renders.
  // NOTE: This must be called before any early returns to comply with Rules of Hooks.
  const formattedAnswers = useMemo(() => {
    const answers = session?.state.answers;
    return answers && typeof answers === 'object'
      ? Object.fromEntries(
          Object.entries(answers).map(([key, value]) => [key, String(value)])
        )
      : {};
  }, [session]);

  if (loading) {
    return (
      <div className={PAGE_LAYOUT_CLASSES.CONTAINER_MD}>
        <div className={CARD_PATTERNS.CENTERED}>
          <LoadingSpinner
            size="md"
            className={MB_CLASSES.XL}
            ariaLabel={RESULTS_PAGE_CONTENT.LOADING}
            label={RESULTS_PAGE_CONTENT.LOADING}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={PAGE_LAYOUT_CLASSES.CONTAINER_MD}>
        <Alert type="error" title={RESULTS_PAGE_CONTENT.ERROR_TITLE}>
          {error}
          <div
            className={`${RESPONSIVE_SPACING.RESPONSIVE_ROW} ${MT_CLASSES.XL}`}
          >
            <Button onClick={() => router.back()} variant="primary">
              {RESULTS_PAGE_CONTENT.BUTTONS.GO_BACK}
            </Button>
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 text-xs ${GRAY_CLASSES.TEXT_500} ${prefersReducedMotion ? '' : BREATHE}`}
              aria-hidden="true"
            >
              <kbd
                className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}
              >
                {isMac ? '↵' : 'Enter'}
              </kbd>
              <span>to go back</span>
            </span>
          </div>
        </Alert>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className={PAGE_LAYOUT_CLASSES.CONTAINER_MD}>
        <Alert type="warning" title={RESULTS_PAGE_CONTENT.WARNING_TITLE}>
          {RESULTS_PAGE_CONTENT.WARNING_MESSAGE}
          <div
            className={`${RESPONSIVE_SPACING.RESPONSIVE_ROW} ${MT_CLASSES.XL}`}
          >
            <Button onClick={() => router.push(ROUTES.HOME)} variant="primary">
              {RESULTS_PAGE_CONTENT.BUTTONS.GO_HOME}
            </Button>
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 text-xs ${GRAY_CLASSES.TEXT_500} ${prefersReducedMotion ? '' : BREATHE}`}
              aria-hidden="true"
            >
              <kbd
                className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}
              >
                {isMac ? '↵' : 'Enter'}
              </kbd>
              <span>to go home</span>
            </span>
          </div>
        </Alert>
      </div>
    );
  }

  // Use the BlueprintDisplay component with real data
  const sections = [
    { id: 'blueprint-section', label: 'Blueprint', shortcut: 'b' },
    { id: 'tasks-section', label: 'Tasks', shortcut: 't' },
    { id: 'exports-section', label: 'Exports', shortcut: 'e' },
  ];

  return (
    <>
      <ScrollProgress />
      <SectionIndicator sections={sections} />
      <div className={PAGE_LAYOUT_CLASSES.CONTAINER_MD}>
        <div className={`flex justify-between items-center ${MB_CLASSES.XXXL}`}>
          <h1 className={`text-3xl font-bold ${GRAY_CLASSES.TEXT_900}`}>
            {RESULTS_PAGE_CONTENT.HEADING}
          </h1>
          <Button
            variant="secondary"
            onClick={() => router.back()}
            aria-label={RESULTS_PAGE_CONTENT.ARIA_LABELS.GO_BACK}
          >
            {RESULTS_PAGE_CONTENT.BUTTONS.GO_BACK}
          </Button>
        </div>

        <div id="blueprint-section">
          <BlueprintDisplay idea={idea.raw_text} answers={formattedAnswers} />
        </div>

        {/* Task Management */}
        <div id="tasks-section" className={MT_CLASSES.XXXL}>
          <TaskManagement ideaId={idea.id} />
        </div>

        {/* Export Options */}
        <div id="exports-section" className={CARD_PATTERNS.WITH_MARGIN}>
          <h2
            className={`text-2xl font-semibold ${GRAY_CLASSES.TEXT_900} ${MB_CLASSES.XXL}`}
          >
            {RESULTS_PAGE_CONTENT.EXPORT_HEADING}
          </h2>

          {/* Micro-UX: Staggered entrance animation for export buttons */}
          {/* Creates a cascading fade-in effect that guides user attention to available export options */}
          {/* Respects prefers-reduced-motion for accessibility */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${GAP_CLASSES.XL}`}
          >
            {/* Markdown Export */}
            <div
              className={`${prefersReducedMotion ? '' : 'fade-in'}`}
              style={
                !prefersReducedMotion
                  ? { animationDelay: ANIMATION_DELAYS.INLINE.IMMEDIATE }
                  : undefined
              }
            >
              <Tooltip
                content={RESULTS_PAGE_CONTENT.TOOLTIPS.MARKDOWN}
                shortcut={[isMac ? '⌘' : 'Ctrl', 'E']}
                position="top"
              >
                <Button
                  variant="primary"
                  onClick={() => handleExport('markdown')}
                  loading={exportingFormat === 'markdown'}
                  loadingText={EXPORT_LABELS.MARKDOWN.LOADING}
                  disabled={exportLoading && exportingFormat !== 'markdown'}
                  aria-label={
                    RESULTS_PAGE_CONTENT.ARIA_LABELS.DOWNLOAD_MARKDOWN
                  }
                >
                  {EXPORT_LABELS.MARKDOWN.DEFAULT}
                </Button>
              </Tooltip>
            </div>

            {/* JSON Export */}
            <div
              className={`${prefersReducedMotion ? '' : 'fade-in'}`}
              style={
                !prefersReducedMotion
                  ? { animationDelay: ANIMATION_DELAYS.INLINE.SHORT }
                  : undefined
              }
            >
              <Tooltip
                content={RESULTS_PAGE_CONTENT.TOOLTIPS.JSON}
                shortcut={[isMac ? '⌘' : 'Ctrl', 'J']}
                position="top"
              >
                <Button
                  variant="secondary"
                  onClick={() => handleExport('json')}
                  loading={exportingFormat === 'json'}
                  loadingText={EXPORT_LABELS.JSON.LOADING}
                  disabled={exportLoading && exportingFormat !== 'json'}
                  aria-label={RESULTS_PAGE_CONTENT.ARIA_LABELS.EXPORT_JSON}
                >
                  {EXPORT_LABELS.JSON.DEFAULT}
                </Button>
              </Tooltip>
            </div>

            {/* Notion Export */}
            <div
              className={`${prefersReducedMotion ? '' : 'fade-in'}`}
              style={
                !prefersReducedMotion
                  ? { animationDelay: ANIMATION_DELAYS.INLINE.MEDIUM }
                  : undefined
              }
            >
              {connectorHealth.notion?.configured ? (
                <Tooltip
                  content={RESULTS_PAGE_CONTENT.TOOLTIPS.NOTION}
                  shortcut={[isMac ? '⌘' : 'Ctrl', 'N']}
                  position="top"
                >
                  <Button
                    variant="outline"
                    onClick={() => handleExport('notion')}
                    loading={exportingFormat === 'notion'}
                    loadingText={EXPORT_LABELS.NOTION.LOADING}
                    disabled={exportLoading && exportingFormat !== 'notion'}
                    aria-label={RESULTS_PAGE_CONTENT.ARIA_LABELS.EXPORT_NOTION}
                  >
                    {EXPORT_LABELS.NOTION.DEFAULT}
                  </Button>
                </Tooltip>
              ) : (
                <Tooltip
                  content={RESULTS_PAGE_CONTENT.TOOLTIPS.NOTION}
                  shortcut={[isMac ? '⌘' : 'Ctrl', 'N']}
                  position="top"
                >
                  <Button
                    variant="outline"
                    disabled={true}
                    aria-label={
                      RESULTS_PAGE_CONTENT.ARIA_LABELS.EXPORT_NOTION_SETUP
                    }
                  >
                    {EXPORT_LABELS.NOTION.DEFAULT}
                    <span className={BADGE_STYLES.SETUP_REQUIRED}>
                      {RESULTS_PAGE_CONTENT.SETUP_REQUIRED_LABEL}
                    </span>
                  </Button>
                </Tooltip>
              )}
            </div>

            {/* Trello Export */}
            <div
              className={`${prefersReducedMotion ? '' : 'fade-in'}`}
              style={
                !prefersReducedMotion
                  ? { animationDelay: ANIMATION_DELAYS.INLINE.LONG }
                  : undefined
              }
            >
              {connectorHealth.trello?.configured ? (
                <Tooltip
                  content={RESULTS_PAGE_CONTENT.TOOLTIPS.TRELLO}
                  shortcut={[isMac ? '⌘' : 'Ctrl', 'T']}
                  position="top"
                >
                  <Button
                    variant="outline"
                    onClick={() => handleExport('trello')}
                    loading={exportingFormat === 'trello'}
                    loadingText={EXPORT_LABELS.TRELLO.LOADING}
                    disabled={exportLoading && exportingFormat !== 'trello'}
                    aria-label={RESULTS_PAGE_CONTENT.ARIA_LABELS.EXPORT_TRELLO}
                  >
                    {EXPORT_LABELS.TRELLO.DEFAULT}
                  </Button>
                </Tooltip>
              ) : (
                <Tooltip
                  content={RESULTS_PAGE_CONTENT.TOOLTIPS.TRELLO}
                  shortcut={[isMac ? '⌘' : 'Ctrl', 'T']}
                  position="top"
                >
                  <Button
                    variant="outline"
                    disabled={true}
                    aria-label={
                      RESULTS_PAGE_CONTENT.ARIA_LABELS.EXPORT_TRELLO_SETUP
                    }
                  >
                    {EXPORT_LABELS.TRELLO.DEFAULT}
                    <span className={BADGE_STYLES.SETUP_REQUIRED}>
                      {RESULTS_PAGE_CONTENT.SETUP_REQUIRED_LABEL}
                    </span>
                  </Button>
                </Tooltip>
              )}
            </div>

            {/* Google Tasks Export */}
            <div
              className={`${prefersReducedMotion ? '' : 'fade-in'}`}
              style={
                !prefersReducedMotion
                  ? { animationDelay: ANIMATION_DELAYS.INLINE.STANDARD }
                  : undefined
              }
            >
              {connectorHealth['google-tasks']?.configured ? (
                <Tooltip
                  content={RESULTS_PAGE_CONTENT.TOOLTIPS.GOOGLE_TASKS}
                  shortcut={[isMac ? '⌘' : 'Ctrl', 'G']}
                  position="top"
                >
                  <Button
                    variant="outline"
                    onClick={() => handleExport('google-tasks')}
                    loading={exportingFormat === 'google-tasks'}
                    loadingText={EXPORT_LABELS.GOOGLE_TASKS.LOADING}
                    disabled={
                      exportLoading && exportingFormat !== 'google-tasks'
                    }
                    aria-label={
                      RESULTS_PAGE_CONTENT.ARIA_LABELS.EXPORT_GOOGLE_TASKS
                    }
                  >
                    {EXPORT_LABELS.GOOGLE_TASKS.DEFAULT}
                  </Button>
                </Tooltip>
              ) : (
                <Tooltip
                  content={RESULTS_PAGE_CONTENT.TOOLTIPS.GOOGLE_TASKS}
                  shortcut={[isMac ? '⌘' : 'Ctrl', 'G']}
                  position="top"
                >
                  <Button
                    variant="outline"
                    disabled={true}
                    aria-label={
                      RESULTS_PAGE_CONTENT.ARIA_LABELS.EXPORT_GOOGLE_TASKS_SETUP
                    }
                  >
                    {EXPORT_LABELS.GOOGLE_TASKS.DEFAULT}
                    <span className={BADGE_STYLES.SETUP_REQUIRED}>
                      {RESULTS_PAGE_CONTENT.SETUP_REQUIRED_LABEL}
                    </span>
                  </Button>
                </Tooltip>
              )}
            </div>

            {/* GitHub Projects Export */}
            <div
              className={`${prefersReducedMotion ? '' : 'fade-in'}`}
              style={
                !prefersReducedMotion
                  ? { animationDelay: ANIMATION_DELAYS.INLINE.EXTENDED }
                  : undefined
              }
            >
              {connectorHealth['github-projects']?.configured ? (
                <Tooltip
                  content={RESULTS_PAGE_CONTENT.TOOLTIPS.GITHUB_PROJECTS}
                  shortcut={[isMac ? '⌘' : 'Ctrl', 'H']}
                  position="top"
                >
                  <Button
                    variant="outline"
                    onClick={() => handleExport('github-projects')}
                    loading={exportingFormat === 'github-projects'}
                    loadingText={EXPORT_LABELS.GITHUB_PROJECTS.LOADING}
                    disabled={
                      exportLoading && exportingFormat !== 'github-projects'
                    }
                    aria-label={
                      RESULTS_PAGE_CONTENT.ARIA_LABELS.EXPORT_GITHUB_PROJECTS
                    }
                  >
                    {EXPORT_LABELS.GITHUB_PROJECTS.DEFAULT}
                  </Button>
                </Tooltip>
              ) : (
                <Tooltip
                  content={RESULTS_PAGE_CONTENT.TOOLTIPS.GITHUB_PROJECTS}
                  shortcut={[isMac ? '⌘' : 'Ctrl', 'H']}
                  position="top"
                >
                  <Button
                    variant="outline"
                    disabled={true}
                    aria-label={
                      RESULTS_PAGE_CONTENT.ARIA_LABELS
                        .EXPORT_GITHUB_PROJECTS_SETUP
                    }
                  >
                    {EXPORT_LABELS.GITHUB_PROJECTS.DEFAULT}
                    <span className={BADGE_STYLES.SETUP_REQUIRED}>
                      {RESULTS_PAGE_CONTENT.SETUP_REQUIRED_LABEL}
                    </span>
                  </Button>
                </Tooltip>
              )}
            </div>

            {/* Email to Self - Growth: User retention and accessibility */}
            <div
              className={`${prefersReducedMotion ? '' : 'fade-in'}`}
              style={
                !prefersReducedMotion
                  ? { animationDelay: ANIMATION_DELAYS.INLINE.RIPPLE }
                  : undefined
              }
            >
              <EmailButton
                ideaTitle={idea.title}
                ideaContent={idea.raw_text}
                sessionAnswers={formattedAnswers}
                onEmailSent={() => {
                  // Growth: Track email send event
                  trackEvent(ANALYTICS_EVENTS.CTA_CLICK, {
                    cta_name: 'email_send_to_self',
                    idea_id: idea.id,
                    page_path: '/results',
                  });
                }}
              />
            </div>
          </div>

          {/* Micro-UX: Keyboard shortcut hints bar for discoverability */}
          {/* Shows all available keyboard shortcuts for the results page */}
          {/* Matches the dashboard keyboard hints bar pattern for consistency */}
          <div className={`${DASHBOARD_PATTERNS.KEYBOARD_HINTS_BAR}`}>
            <div className={DASHBOARD_PATTERNS.KEYBOARD_HINTS_GROUP}>
              <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_ITEM}>
                <kbd className={ELEMENT_PATTERNS.KBD}>
                  {isMac ? '⌘' : 'Ctrl'}
                </kbd>
                <kbd className={ELEMENT_PATTERNS.KBD}>C</kbd>
                <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_LABEL}>
                  copy blueprint
                </span>
              </span>
              <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_ITEM}>
                <kbd className={ELEMENT_PATTERNS.KBD}>
                  {isMac ? '⌘' : 'Ctrl'}
                </kbd>
                <kbd className={ELEMENT_PATTERNS.KBD}>P</kbd>
                <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_LABEL}>
                  print
                </span>
              </span>
              <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_ITEM}>
                <kbd className={ELEMENT_PATTERNS.KBD}>
                  {isMac ? '⌘' : 'Ctrl'}
                </kbd>
                <kbd className={ELEMENT_PATTERNS.KBD}>E</kbd>
                <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_LABEL}>
                  export
                </span>
              </span>
              <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_ITEM}>
                <kbd className={ELEMENT_PATTERNS.KBD}>
                  {isMac ? '⌘' : 'Ctrl'}
                </kbd>
                <kbd className={ELEMENT_PATTERNS.KBD}>J</kbd>
                <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_LABEL}>
                  JSON
                </span>
              </span>
              <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_ITEM}>
                <kbd className={ELEMENT_PATTERNS.KBD}>
                  {isMac ? '⌘' : 'Ctrl'}
                </kbd>
                <kbd className={ELEMENT_PATTERNS.KBD}>N</kbd>
                <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_LABEL}>
                  Notion
                </span>
              </span>
              <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_ITEM}>
                <kbd className={ELEMENT_PATTERNS.KBD}>
                  {isMac ? '⌘' : 'Ctrl'}
                </kbd>
                <kbd className={ELEMENT_PATTERNS.KBD}>T</kbd>
                <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_LABEL}>
                  Trello
                </span>
              </span>
              <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_ITEM}>
                <kbd className={ELEMENT_PATTERNS.KBD}>
                  {isMac ? '⌘' : 'Ctrl'}
                </kbd>
                <kbd className={ELEMENT_PATTERNS.KBD}>G</kbd>
                <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_LABEL}>
                  Google
                </span>
              </span>
              <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_ITEM}>
                <kbd className={ELEMENT_PATTERNS.KBD}>
                  {isMac ? '⌘' : 'Ctrl'}
                </kbd>
                <kbd className={ELEMENT_PATTERNS.KBD}>H</kbd>
                <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_LABEL}>
                  GitHub
                </span>
              </span>
              <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_ITEM}>
                <kbd className={ELEMENT_PATTERNS.KBD}>
                  {isMac ? '⌘' : 'Ctrl'}
                </kbd>
                <kbd className={ELEMENT_PATTERNS.KBD}>⇧</kbd>
                <kbd className={ELEMENT_PATTERNS.KBD}>E</kbd>
                <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_LABEL}>
                  email
                </span>
              </span>
              <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_ITEM}>
                <kbd className={KBD_HINT_STYLE}>n</kbd>
                <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_LABEL}>
                  new idea
                </span>
              </span>
              <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_ITEM}>
                <kbd className={KBD_HINT_STYLE}>?</kbd>
                <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_LABEL}>
                  all shortcuts
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => openHelp()}
              className={DASHBOARD_PATTERNS.VIEW_SHORTCUTS_BTN}
              aria-label={
                KEYBOARD_SHORTCUTS_HELP_LABELS.SHORTCUT_DESCRIPTIONS
                  .SHOW_SHORTCUTS
              }
            >
              <span>{RESULTS_PAGE_CONTENT.VIEW_SHORTCUTS}</span>
              <svg
                className={SVG_SIZES.SM}
                fill="none"
                viewBox={SVG_VIEWBOX.STANDARD}
                stroke="currentColor"
                strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {exportUrl && (
            <div ref={exportSuccessRef} className={RESULTS_SUCCESS_CONTAINER}>
              <Alert type="success" title={RESULTS_PAGE_CONTENT.SUCCESS_TITLE}>
                {RESULTS_PAGE_CONTENT.SUCCESS_MESSAGE}
                <span className={RESULTS_SHARE_BUTTON_CONTAINER}>
                  <ShareButton
                    shareTitle="Check out my project blueprint on IdeaFlow!"
                    shareText="I just created a project blueprint using IdeaFlow's AI-powered planning tool. Transform your ideas into action!"
                    label="Share your blueprint"
                    successLabel="Shared!"
                    ariaLabel="Share your project blueprint"
                    onShare={() => {
                      trackEvent(ANALYTICS_EVENTS.SOCIAL_SHARE, {
                        share_platform: 'web_share',
                        idea_id: idea.id,
                        source: 'export_success_alert',
                      });
                    }}
                  />
                </span>
              </Alert>
              {showExportSuccess &&
                particles.map((particle) => (
                  <span
                    key={particle.id}
                    className={CONFETTI_DOT}
                    style={
                      {
                        left: '50%',
                        top: '50%',
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        backgroundColor: particle.color,
                        '--confetti-x': `${particle.x}px`,
                        '--confetti-y': `${particle.y}px`,
                        animationDelay: `${particle.delay}ms`,
                      } as React.CSSProperties
                    }
                    aria-hidden="true"
                  />
                ))}
            </div>
          )}
        </div>

        {/* Share Options - Growth: Viral sharing for user acquisition */}
        {/* Micro-UX: Staggered entrance animation matches Export section for visual consistency */}
        <div className={CARD_PATTERNS.WITH_MARGIN}>
          <h2
            className={`text-2xl font-semibold ${GRAY_CLASSES.TEXT_900} ${MB_CLASSES.XXL}`}
          >
            {RESULTS_PAGE_CONTENT.SHARE_HEADING}
          </h2>
          <p className={`${GRAY_CLASSES.TEXT_600} ${MB_CLASSES.XXL}`}>
            {RESULTS_PAGE_CONTENT.SHARE_MESSAGE}
          </p>
          <div
            className={`flex flex-wrap ${GAP_CLASSES.XL} ${prefersReducedMotion ? '' : 'fade-in'}`}
            style={
              !prefersReducedMotion
                ? { animationDelay: ANIMATION_DELAYS.INLINE.IMMEDIATE }
                : undefined
            }
          >
            <ShareButton
              shareTitle={`Check out my project blueprint on IdeaFlow!`}
              shareText={`I just created a project blueprint using IdeaFlow's AI-powered planning tool. Transform your ideas into action!`}
              label={RESULTS_PAGE_CONTENT.SHARE_BUTTON_LABEL}
              successLabel={RESULTS_PAGE_CONTENT.SHARE_BUTTON_SUCCESS_LABEL}
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

        {/* Micro-UX: "Start New Idea" CTA closes the user journey loop */}
        {/* Encourages repeat usage by providing a clear next step after reviewing results */}
        <section
          className={`${CARD_PATTERNS.WITH_MARGIN} text-center`}
          aria-labelledby="start-new-idea-cta"
        >
          <div className={PY_CLASSES.XL}>
            <h2
              id="start-new-idea-cta"
              className={`text-xl sm:text-2xl font-semibold ${GRAY_CLASSES.TEXT_900} ${MB_CLASSES.MD}`}
            >
              {RESULTS_PAGE_CONTENT.NEW_IDEA_CTA.TITLE}
            </h2>
            <p
              className={`${GRAY_CLASSES.TEXT_600} ${MB_CLASSES.XXL} max-w-md mx-auto`}
            >
              {RESULTS_PAGE_CONTENT.NEW_IDEA_CTA.DESCRIPTION}
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push(ROUTES.HOME)}
              aria-label={RESULTS_PAGE_CONTENT.NEW_IDEA_CTA.ARIA_LABEL}
              className={`inline-flex items-center ${GAP_CLASSES.MD} ${prefersReducedMotion ? '' : 'hover:-translate-y-0.5 active:translate-y-0'} transition-transform`}
            >
              <svg
                className={`${ICON_SIZES.MD}`}
                fill="none"
                viewBox={SVG_VIEWBOX.STANDARD}
                stroke="currentColor"
                strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {RESULTS_PAGE_CONTENT.NEW_IDEA_CTA.BUTTON}
            </Button>
          </div>
        </section>

        <div className={DASHBOARD_PATTERNS.KEYBOARD_HINTS_BAR}>
          <div className={DASHBOARD_PATTERNS.KEYBOARD_HINTS_GROUP}>
            <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_ITEM}>
              <kbd className={KBD_HINT_STYLE}>b</kbd>
              <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_LABEL}>
                Blueprint
              </span>
            </span>
            <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_ITEM}>
              <kbd className={KBD_HINT_STYLE}>t</kbd>
              <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_LABEL}>
                Tasks
              </span>
            </span>
            <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_ITEM}>
              <kbd className={KBD_HINT_STYLE}>e</kbd>
              <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_LABEL}>
                Exports
              </span>
            </span>
            <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_ITEM}>
              <kbd className={KBD_HINT_STYLE}>n</kbd>
              <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_LABEL}>
                New Idea
              </span>
            </span>
            <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_ITEM}>
              <kbd className={KBD_HINT_STYLE}>?</kbd>
              <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_LABEL}>
                Shortcuts
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => openHelp()}
            className={DASHBOARD_PATTERNS.VIEW_SHORTCUTS_BTN}
          >
            View all
          </button>
        </div>
      </div>
    </>
  );
}

// Main export with Suspense boundary
export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className={PAGE_LAYOUT_CLASSES.CONTAINER_MD}>
          <div className={CARD_PATTERNS.CENTERED}>
            <LoadingSpinner
              size="md"
              className={MB_CLASSES.XL}
              ariaLabel={RESULTS_PAGE_CONTENT.LOADING}
              label={RESULTS_PAGE_CONTENT.LOADING_SHORT}
            />
          </div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
