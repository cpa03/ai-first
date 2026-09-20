'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { HOME_PAGE_CONFIG } from '@/lib/config/pages';
import { GRAY_CLASSES } from '@/lib/config/remaining-styles';
import { useGuestMode } from '@/hooks/useGuestMode';

const IdeaInput = dynamic(() => import('@/components/IdeaInput'), {
  loading: () => (
    <div className="space-y-6" style={{ minHeight: '200px' }}>
      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
      <div className="h-10 bg-gray-200 rounded w-1/4 animate-pulse" />
    </div>
  ),
  ssr: false,
});

export default function HomePageInteractive() {
  const router = useRouter();
  const [idea, setIdea] = useState('');
  const [ideaId, setIdeaId] = useState('');
  const { isGuest, setGuestIdea } = useGuestMode();

  const handleIdeaSubmit = useCallback(
    (submittedIdea: string, submittedIdeaId: string, isGuestMode?: boolean) => {
      setIdea(submittedIdea);
      setIdeaId(submittedIdeaId);

      // Save to guest mode if applicable
      if (isGuestMode) {
        setGuestIdea(submittedIdea, submittedIdeaId);
      }

      import('@/lib/analytics').then(({ trackIdeaSubmit, trackFunnelStep }) => {
        trackIdeaSubmit(submittedIdeaId);
        trackFunnelStep('idea_submission', 1, 4);
      });

      router.push(
        `/clarify?idea=${encodeURIComponent(submittedIdea)}&ideaId=${submittedIdeaId}`
      );
    },
    [router, setGuestIdea]
  );

  // Check if user is in guest mode on mount
  useEffect(() => {
    if (isGuest) {
      // User already has a guest session, could redirect or show banner
    }
  }, [isGuest]);

  return (
    <>
      {/* Guest mode banner */}
      {isGuest && (
        <div
          className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-4"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-amber-600 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-amber-800">
              You're in <strong>guest mode</strong> - your progress is saved locally.
            </span>
          </div>
          <span className="text-xs text-amber-600">
            Sign up to save permanently
          </span>
        </div>
      )}

      <section
        aria-labelledby="idea-input-heading"
        className="bg-white border border-gray-200 rounded-xl p-6 mb-12"
      >
        <h2 id="idea-input-heading" className="sr-only">
          Enter Your Idea
        </h2>
        <IdeaInput onSubmit={handleIdeaSubmit} />
      </section>

      {idea && (
        <section
          aria-live="polite"
          aria-labelledby="idea-confirmation-heading"
          className={`mt-8 ${GRAY_CLASSES.BG_100} ${GRAY_CLASSES.BORDER_200} rounded-lg p-6`}
        >
          <h3
            id="idea-confirmation-heading"
            className={`text-lg font-semibold ${GRAY_CLASSES.TEXT_700} mb-2`}
          >
            {HOME_PAGE_CONFIG.CONFIRMATION.LABEL}
          </h3>
          <p className={GRAY_CLASSES.TEXT_700}>{idea}</p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
            <p className={`text-sm ${GRAY_CLASSES.TEXT_600}`}>
              {HOME_PAGE_CONFIG.CONFIRMATION.SAVED_WITH_ID}
              {' '}
              <code className={`${GRAY_CLASSES.BG_100} px-1.5 py-0.5 rounded ${GRAY_CLASSES.TEXT_700} font-mono text-xs`}>
                {ideaId}
              </code>
            </p>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              onClick={() => navigator.clipboard.writeText(ideaId)}
            >
              {HOME_PAGE_CONFIG.CONFIRMATION.COPY_ID_BUTTON}
            </button>
          </div>
          <p className={`text-sm ${GRAY_CLASSES.TEXT_500} mt-3`}>
            {HOME_PAGE_CONFIG.CONFIRMATION.REDIRECTING}
          </p>
        </section>
      )}
    </>
  );
}