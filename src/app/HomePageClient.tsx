'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import IdeaInput from '@/components/IdeaInput';
import CopyButton from '@/components/CopyButton';
import ShareButton from '@/components/ShareButton';
import UserOnboarding from '@/components/UserOnboarding';
import Skeleton from '@/components/Skeleton';
import {
  trackEvent,
  trackPageView,
  ANALYTICS_EVENTS,
  trackIdeaSubmit,
  trackCopyAction,
  trackFunnelStep,
} from '@/lib/analytics';

const FeatureGrid = dynamic(() => import('@/components/FeatureGrid'), {
  loading: () => (
    <section aria-hidden="true" className="mt-16 grid md:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="text-center p-6 rounded-xl bg-white border border-gray-100"
        >
          <Skeleton variant="circle" className="w-16 h-16 mx-auto mb-4" />
          <Skeleton variant="text" className="h-6 mx-auto mb-2 w-3/4" />
          <Skeleton variant="text" className="h-4 mx-auto w-full" />
        </div>
      ))}
    </section>
  ),
});

const WhyChooseSection = dynamic(
  () => import('@/components/WhyChooseSection'),
  {
    loading: () => (
      <section aria-hidden="true" className="mt-16 bg-gray-50 rounded-lg p-8">
        <Skeleton variant="text" className="h-10 mx-auto mb-6 w-3/4" />
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-start space-x-3 p-4 rounded-lg bg-white border border-gray-100"
            >
              <Skeleton variant="circle" className="w-6 h-6 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <Skeleton variant="text" className="h-5 mb-2 w-1/2" />
                <Skeleton variant="text" className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </section>
    ),
  }
);

export default function HomePageClient() {
  const router = useRouter();
  const [idea, setIdea] = useState('');
  const [ideaId, setIdeaId] = useState('');

  // Growth: Track page view on mount
  useEffect(() => {
    trackPageView();

    // Flush events before page unload
    const handleBeforeUnload = () => {
      // Import flush dynamically to avoid issues
      import('@/lib/analytics').then(({ flush }) => flush());
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // PERFORMANCE: Memoize handler to prevent unnecessary re-renders of IdeaInput
  // which receives this function as a prop
  // Growth: Track idea submission event
  const handleIdeaSubmit = useCallback(
    (submittedIdea: string, submittedIdeaId: string) => {
      setIdea(submittedIdea);
      setIdeaId(submittedIdeaId);

      // Growth: Track idea submission
      trackIdeaSubmit(submittedIdeaId);

      // Growth: Track funnel step - idea submission started (step 1 of 4)
      trackFunnelStep('idea_submission', 1, 4);

      router.push(
        `/clarify?idea=${encodeURIComponent(submittedIdea)}&ideaId=${submittedIdeaId}`
      );
    },
    [router]
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <section aria-labelledby="hero-heading" className="text-center mb-12">
        <h1 id="hero-heading" className="text-4xl font-bold text-gray-900 mb-4">
          AI-Powered Project Planning & Task Management
        </h1>
        <p className="text-xl text-gray-700 max-w-2xl mx-auto">
          Transform raw ideas into actionable project plans with AI. Get
          automated task breakdown, realistic timelines, and comprehensive
          roadmaps in minutes.
        </p>
        {/* Growth: Social sharing for viral loops */}
        <div className="mt-6 flex justify-center gap-3">
          <ShareButton
            shareTitle="IdeaFlow - Turn Ideas into Action"
            shareText="Transform your ideas into structured projects with AI-powered planning, task breakdown, and export to your favorite tools."
            label="Share IdeaFlow"
            ariaLabel="Share IdeaFlow with friends"
            onShare={() =>
              trackEvent(ANALYTICS_EVENTS.SOCIAL_SHARE_CLICK, {
                share_platform: 'web_share_api',
              })
            }
          />
        </div>
      </section>

      <section
        aria-labelledby="idea-input-heading"
        className="bg-white rounded-lg shadow-lg p-8"
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
          className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6"
        >
          <h3
            id="idea-confirmation-heading"
            className="text-lg font-semibold text-blue-900 mb-2"
          >
            Your Idea:
          </h3>
          <p className="text-blue-900">{idea}</p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
            <p className="text-sm text-blue-800">
              Saved with ID:{` `}
              <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-900 font-mono text-xs">
                {ideaId}
              </code>
            </p>
            <CopyButton
              textToCopy={ideaId}
              label="Copy ID"
              successLabel="Copied!"
              ariaLabel="Copy idea ID to clipboard"
              variant="default"
              toastMessage="Idea ID copied to clipboard!"
              onCopy={() => trackCopyAction('idea_id')}
            />
          </div>
          <p className="text-sm text-blue-600 mt-3">
            Redirecting to clarification...
          </p>
        </section>
      )}

      <section aria-labelledby="how-it-works-heading">
        <h2 id="how-it-works-heading" className="sr-only">
          How It Works
        </h2>
        <FeatureGrid />
      </section>

      <section aria-labelledby="why-choose-heading">
        <h2 id="why-choose-heading" className="sr-only">
          Why Choose IdeaFlow
        </h2>
        <WhyChooseSection />
      </section>

      {/* Growth: User onboarding guided tour */}
      <UserOnboarding />
    </div>
  );
}
