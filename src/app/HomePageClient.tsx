'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { HOME_PAGE_CONFIG } from '@/lib/config/pages';
import { PAGE_LAYOUT_CLASSES } from '@/lib/config/page-layout';
import {
  CARD_PATTERNS,
  BG_COLORS,
  TEXT_COLORS,
  BORDER_COLORS,
} from '@/lib/config/theme';
import {
  SPACE_Y_PATTERNS,
  SPACE_X_PATTERNS,
  RESPONSIVE_GRID_PATTERNS,
} from '@/lib/config/remaining-styles';
import { GAP_CLASSES, MT_CLASSES } from '@/lib/config/spacing';
import { GRAY_CLASSES } from '@/lib/config/remaining-styles';
import {
  HOME_PAGE_ELEMENT_IDS,
  ARIA_HEADING_IDS,
} from '@/lib/config/element-ids';
import { HOMEPAGE_SKELETON_TAILWIND } from '@/lib/config/tailwind-arbitrary';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { HERO_ENTRANCE, CSS_CONTAINMENT } from '@/lib/config';
import {
  REMAINING_PATTERNS,
  HOMEPAGE_HERO_SECTION,
  HOMEPAGE_HERO_ACTIONS,
} from '@/lib/config/remaining-hardcoded-patterns';

const ShareButton = dynamic(() => import('@/components/ShareButton'), {
  loading: () => (
    <div className={REMAINING_PATTERNS.SKELETON_SIZES.SHARE_BUTTON} />
  ),
  ssr: false,
});

const Skeleton = dynamic(() => import('@/components/Skeleton'), {
  ssr: false,
});

// Dynamic imports for heavy components to reduce initial bundle size
const IdeaInput = dynamic(() => import('@/components/IdeaInput'), {
  loading: () => (
    <div
      className={`${SPACE_Y_PATTERNS.LG}`}
      style={{
        minHeight: HOMEPAGE_SKELETON_TAILWIND.IDEA_INPUT_MIN_H,
        contain: 'layout size',
      }}
    >
      <Skeleton
        variant="text"
        className={REMAINING_PATTERNS.SKELETON_SIZES.IDEA_INPUT_TEXT}
      />
      <Skeleton
        variant="rect"
        className={REMAINING_PATTERNS.SKELETON_SIZES.IDEA_INPUT_BUTTON}
      />
    </div>
  ),
  ssr: false,
});

const CopyButton = dynamic(() => import('@/components/CopyButton'), {
  loading: () => (
    <div className={REMAINING_PATTERNS.SKELETON_SIZES.COPY_BUTTON} />
  ),
  ssr: false,
});

const FeatureGrid = dynamic(() => import('@/components/FeatureGrid'), {
  loading: () => (
    <section
      aria-hidden="true"
      className={`${MT_CLASSES.XXXXL} grid md:grid-cols-3 ${GAP_CLASSES.XXXL}`}
      style={{
        minHeight: HOMEPAGE_SKELETON_TAILWIND.FEATURE_GRID_MIN_H,
        contain: 'layout size',
      }}
    >
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`text-center p-6 rounded-xl bg-white border ${GRAY_CLASSES.BORDER_200} flex flex-col items-center justify-center`}
        >
          <Skeleton
            variant="circle"
            className={`${REMAINING_PATTERNS.SKELETON_SIZES.FEATURE_CIRCLE} mx-auto mb-4`}
          />
          <Skeleton
            variant="text"
            className={`${REMAINING_PATTERNS.SKELETON_SIZES.FEATURE_TITLE} mx-auto mb-2 w-3/4`}
          />
          <Skeleton
            variant="text"
            className={`${REMAINING_PATTERNS.SKELETON_SIZES.FEATURE_DESC} mx-auto w-full`}
          />
        </div>
      ))}
    </section>
  ),
});

const WhyChooseSection = dynamic(
  () => import('@/components/WhyChooseSection'),
  {
    loading: () => (
      <section
        aria-hidden="true"
        className={`${MT_CLASSES.XXXXL} ${GRAY_CLASSES.BG_50} rounded-lg p-8`}
        style={{
          minHeight: HOMEPAGE_SKELETON_TAILWIND.WHY_CHOOSE_MIN_H,
          contain: 'layout size',
        }}
      >
        <Skeleton
          variant="text"
          className={`${REMAINING_PATTERNS.SKELETON_SIZES.WHY_CHOOSE_TITLE} mx-auto mb-6 w-3/4`}
        />
        <div className={RESPONSIVE_GRID_PATTERNS.MD_2_GAP_LG}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`flex items-start ${SPACE_X_PATTERNS.MD} p-4 rounded-lg bg-white border ${GRAY_CLASSES.BORDER_200}`}
            >
              <Skeleton
                variant="circle"
                className={`${REMAINING_PATTERNS.SKELETON_SIZES.WHY_CHOOSE_ICON} flex-shrink-0 mt-1`}
              />
              <div className={REMAINING_PATTERNS.SKELETON_LAYOUT.FLEX_GROW}>
                <Skeleton
                  variant="text"
                  className={`${REMAINING_PATTERNS.SKELETON_SIZES.WHY_CHOOSE_ITEM_TITLE} mb-2 w-1/2`}
                />
                <Skeleton
                  variant="text"
                  className={`${REMAINING_PATTERNS.SKELETON_SIZES.FEATURE_DESC} w-3/4`}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    ),
  }
);

const UserOnboarding = dynamic(() => import('@/components/UserOnboarding'), {
  ssr: false,
});

// Micro-UX: First-visit keyboard shortcut discovery hint
// Shows a brief tooltip for new users to discover keyboard shortcuts
const KeyboardShortcutHint = dynamic(
  () => import('@/components/KeyboardShortcutHint'),
  { ssr: false }
);

export default function HomePageClient() {
  const router = useRouter();
  const [idea, setIdea] = useState('');
  const [ideaId, setIdeaId] = useState('');
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    import('@/lib/analytics').then(({ trackPageView }) => trackPageView());

    const handlePageHide = () => {
      import('@/lib/analytics').then(({ flush }) => flush());
    };
    window.addEventListener('pagehide', handlePageHide);
    return () => window.removeEventListener('pagehide', handlePageHide);
  }, []);

  const handleIdeaSubmit = useCallback(
    (submittedIdea: string, submittedIdeaId: string) => {
      setIdea(submittedIdea);
      setIdeaId(submittedIdeaId);

      import('@/lib/analytics').then(({ trackIdeaSubmit, trackFunnelStep }) => {
        trackIdeaSubmit(submittedIdeaId);
        trackFunnelStep('idea_submission', 1, 4);
      });

      router.push(
        `/clarify?idea=${encodeURIComponent(submittedIdea)}&ideaId=${submittedIdeaId}`
      );
    },
    [router]
  );

  return (
    <div className={PAGE_LAYOUT_CLASSES.CONTAINER_MD}>
      {/* Micro-UX: Staggered entrance animation for hero section creates a polished first impression */}
      {/* Respects prefers-reduced-motion for accessibility */}
      <section
        aria-labelledby={ARIA_HEADING_IDS.HERO}
        className={HOMEPAGE_HERO_SECTION}
      >
        <h1
          id={HOME_PAGE_ELEMENT_IDS.HERO_HEADING}
          className={`text-4xl font-bold ${GRAY_CLASSES.TEXT_900} mb-4 ${
            prefersReducedMotion ? '' : HERO_ENTRANCE
          }`}
          style={
            !prefersReducedMotion
              ? { animationDelay: HOME_PAGE_CONFIG.HERO_ANIMATION_DELAYS.TITLE }
              : undefined
          }
        >
          {HOME_PAGE_CONFIG.HERO.TITLE}
        </h1>
        <p
          className={`text-xl ${GRAY_CLASSES.TEXT_700} max-w-2xl mx-auto ${
            prefersReducedMotion ? '' : HERO_ENTRANCE
          }`}
          style={
            !prefersReducedMotion
              ? {
                  animationDelay:
                    HOME_PAGE_CONFIG.HERO_ANIMATION_DELAYS.DESCRIPTION,
                }
              : undefined
          }
        >
          {HOME_PAGE_CONFIG.HERO.DESCRIPTION}
        </p>
        <div
          className={`${HOMEPAGE_HERO_ACTIONS} ${
            prefersReducedMotion ? '' : HERO_ENTRANCE
          }`}
          style={
            !prefersReducedMotion
              ? { animationDelay: HOME_PAGE_CONFIG.HERO_ANIMATION_DELAYS.CTA }
              : undefined
          }
        >
          <ShareButton
            shareTitle={HOME_PAGE_CONFIG.SHARE.TITLE}
            shareText={HOME_PAGE_CONFIG.SHARE.TEXT}
            label={HOME_PAGE_CONFIG.SHARE.LABEL}
            ariaLabel={HOME_PAGE_CONFIG.SHARE.ARIA_LABEL}
            onShare={() =>
              import('@/lib/analytics').then(
                ({ trackEvent, ANALYTICS_EVENTS }) =>
                  trackEvent(ANALYTICS_EVENTS.SOCIAL_SHARE_CLICK, {
                    share_platform: 'web_share_api',
                  })
              )
            }
          />
        </div>
      </section>

      <section
        aria-labelledby={ARIA_HEADING_IDS.IDEA_INPUT}
        className={CARD_PATTERNS.BASE}
        style={CSS_CONTAINMENT.LAYOUT}
      >
        <h2 id={HOME_PAGE_ELEMENT_IDS.IDEA_INPUT_HEADING} className="sr-only">
          Enter Your Idea
        </h2>
        <IdeaInput onSubmit={handleIdeaSubmit} />
      </section>

      {idea && (
        <section
          aria-live="polite"
          aria-labelledby={ARIA_HEADING_IDS.IDEA_CONFIRMATION}
          className={`mt-8 ${BG_COLORS.INFO_LIGHT} ${BORDER_COLORS.INFO} rounded-lg p-6`}
        >
          <h3
            id={HOME_PAGE_ELEMENT_IDS.IDEA_CONFIRMATION_HEADING}
            className={`text-lg font-semibold ${TEXT_COLORS.INFO_DARK} mb-2`}
          >
            {HOME_PAGE_CONFIG.CONFIRMATION.LABEL}
          </h3>
          <p className={TEXT_COLORS.INFO_DARK}>{idea}</p>
          <div
            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between ${GAP_CLASSES.LG} ${MT_CLASSES.XL}`}
          >
            <p className={`text-sm ${TEXT_COLORS.INFO}`}>
              {HOME_PAGE_CONFIG.CONFIRMATION.SAVED_WITH_ID}
              {` `}
              <code
                className={`${BG_COLORS.INFO} px-1.5 py-0.5 rounded ${TEXT_COLORS.INFO_DARK} font-mono text-xs`}
              >
                {ideaId}
              </code>
            </p>
            <CopyButton
              textToCopy={ideaId}
              label={HOME_PAGE_CONFIG.CONFIRMATION.COPY_ID_BUTTON}
              successLabel={HOME_PAGE_CONFIG.CONFIRMATION.COPY_ID_SUCCESS}
              ariaLabel="Copy idea ID to clipboard"
              variant="default"
              toastMessage={HOME_PAGE_CONFIG.CONFIRMATION.COPY_ID_TOAST}
              onCopy={() =>
                import('@/lib/analytics').then(({ trackCopyAction }) =>
                  trackCopyAction('idea_id')
                )
              }
            />
          </div>
          <p className={`text-sm ${TEXT_COLORS.INFO_LIGHT} mt-3`}>
            {HOME_PAGE_CONFIG.CONFIRMATION.REDIRECTING}
          </p>
        </section>
      )}

      {/* FeatureGrid and WhyChooseSection render their own <section> tags with aria-labelledby */}
      <FeatureGrid />

      <WhyChooseSection />

      {/* Growth: User onboarding guided tour */}
      <UserOnboarding />

      <KeyboardShortcutHint />
    </div>
  );
}
