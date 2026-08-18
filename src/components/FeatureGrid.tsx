'use client';

import { memo, useEffect, useRef, useState } from 'react';
import {
  ANIMATION_DELAYS,
  DURATION_TAILWIND,
  TYPOGRAPHY_CLASSES,
  TEXT_COLORS,
  GRADIENT_CONFIG,
  BG_COLORS,
  ROUNDED_CLASSES,
} from '@/lib/config/theme';
import {
  CSS_CONTAINMENT,
  BADGE_ENTRANCE_GLOW,
  CONNECTOR_REVEAL,
} from '@/lib/config';
import { FOCUS_RING_OFFSET_PATTERNS } from '@/lib/config/focus-ring-offsets';
import { MT_CLASSES, GAP_CLASSES } from '@/lib/config/spacing';
import { ICON_SIZES, CONNECTOR_SIZES } from '@/lib/config/icon-sizes';
import { GRAY_CLASSES } from '@/lib/config/remaining-styles';
import { FLEX_PATTERNS } from '@/lib/config/remaining-styles';
import { FEATURE_CONFIG } from '@/lib/config/landing-page';
import { FEATURE_GRID_LABELS } from '@/lib/config/component-labels';
import { UI_STRINGS, UI_CONFIG } from '@/lib/config/ui';
import { ANIMATION_CONFIG } from '@/lib/config/animation';
import {
  HOME_PAGE_ELEMENT_IDS,
  ARIA_HEADING_IDS,
} from '@/lib/config/element-ids';
import { SR_ONLY } from '@/lib/config/remaining-hardcoded-patterns';
import { COMPONENT_PRIMARY_PATTERNS } from '@/lib/config/primary-colors';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';

function FeatureGridComponent() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [announcement, setAnnouncement] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: FEATURE_CONFIG.OBSERVER_THRESHOLD,
        rootMargin: FEATURE_CONFIG.OBSERVER_ROOT_MARGIN,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Micro-UX: Keyboard navigation between feature cards (consistent with WhyChooseSection)
  const { focusedIndex, handleFocus, handleBlur } = useKeyboardNavigation({
    items: FEATURE_CONFIG.FEATURES,
    getItemId: (feature) => feature.step.toString(),
    cardSelector: '[data-feature-card]',
    onAnnounce: setAnnouncement,
    getAnnouncement: (feature, index, total) =>
      `Step ${feature.step} of ${total}: ${feature.title}`,
  });

  const animationClasses = UI_STRINGS.ANIMATION.FEATURE_GRID;

  return (
    <section
      ref={sectionRef}
      aria-labelledby={ARIA_HEADING_IDS.HOW_IT_WORKS}
      className={MT_CLASSES.XXXXL}
      style={CSS_CONTAINMENT.LAYOUT}
    >
      <h2 id={HOME_PAGE_ELEMENT_IDS.HOW_IT_WORKS_HEADING} className={SR_ONLY}>
        How It Works
      </h2>
      <ul
        className={`grid md:grid-cols-3 ${GAP_CLASSES.XXXL}`}
        role="list"
        aria-label={FEATURE_GRID_LABELS.STEPS_LIST_ARIA_LABEL}
      >
        {FEATURE_CONFIG.FEATURES.map((feature, index) => (
          <li
            key={feature.step}
            data-feature-card
            data-feature-step={feature.step.toString()}
            role="listitem"
            tabIndex={0}
            onFocus={() => handleFocus(index)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
              }
            }}
            className={`
              group relative text-center p-6 ${ROUNDED_CLASSES.EXTRA_LARGE}
              gradient-border-hover card-lift feature-card-focus
              ${BG_COLORS.DEFAULT}
              ${FOCUS_RING_OFFSET_PATTERNS.LARGE}
              focus-visible:scale-[1.03] focus-visible:shadow-xl focus-visible:shadow-primary-200/60
              transition-transform transition-shadow duration-200 ease-out
              motion-reduce:transition-none
              ${isVisible ? animationClasses[index] : 'opacity-0'}
              ${focusedIndex === index ? FOCUS_RING_OFFSET_PATTERNS.NAVIGATION_FOCUSED : ''}
            `}
            aria-label={FEATURE_GRID_LABELS.STEP_ARIA_LABEL(
              feature.step,
              feature.title,
              feature.description
            )}
          >
            <div
              className={`
              ${BG_COLORS.BRAND_100} rounded-full ${ICON_SIZES.HUGE}
              flex items-center justify-center mx-auto mb-4
              transition-all ${DURATION_TAILWIND[300]} group-hover:scale-110
              group-hover:${BG_COLORS.BRAND_200}
              group-focus-visible:scale-110 group-focus-visible:${BG_COLORS.BRAND_200} group-focus-visible:shadow-lg group-focus-visible:shadow-primary-200/50 group-focus-visible:ring-2 group-focus-visible:ring-primary-300/50
              motion-reduce:transition-none motion-reduce:group-hover:scale-100
            `}
              aria-hidden="true"
            >
              <span
                className={`badge-animate ${TEXT_COLORS.BRAND} text-2xl ${TYPOGRAPHY_CLASSES.BOLD} ${
                  isVisible ? BADGE_ENTRANCE_GLOW : 'opacity-0'
                }`}
                style={{
                  animationDelay: isVisible
                    ? `${index * ANIMATION_CONFIG.FEATURE_GRID.STAGGER + ANIMATION_CONFIG.FEATURE_GRID.BASE_DELAY}ms`
                    : undefined,
                }}
              >
                {feature.step}
              </span>
            </div>

            <h3
              className={`${TYPOGRAPHY_CLASSES.LG_SEMIBOLD} ${TEXT_COLORS.PRIMARY} mb-2 ${COMPONENT_PRIMARY_PATTERNS.FEATURE_HOVER} transition-colors ${DURATION_TAILWIND[300]}`}
            >
              {feature.title}
            </h3>
            <p
              className={`${TEXT_COLORS.MUTED_DARK} group-hover:${GRAY_CLASSES.TEXT_800} transition-colors ${DURATION_TAILWIND[300]}`}
            >
              {feature.description}
            </p>

            {index < FEATURE_CONFIG.FEATURES.length - 1 && (
              <>
                {/* Desktop: Horizontal connector arrow */}
                {/* Micro-UX: Animate in with staggered delay when section becomes visible */}
                {/* Shows the complete flow at a glance, not just on hover */}
                {/* Still enhances on hover/focus-visible for interactive feedback */}
                <div
                  className={`
                  hidden md:block absolute top-1/2 -right-4 
                  ${CONNECTOR_SIZES.HORIZONTAL} ${GRADIENT_CONFIG.CONNECTOR.HORIZONTAL}
                  transform -translate-y-1/2
                  ${isVisible ? CONNECTOR_REVEAL : 'opacity-0'}
                  group-hover:opacity-100 group-focus-visible:opacity-100
                  transition-opacity ${DURATION_TAILWIND[500]}
                  ${index === 0 ? ANIMATION_DELAYS.TAILWIND[200] : index === 1 ? ANIMATION_DELAYS.TAILWIND[300] : ANIMATION_DELAYS.TAILWIND[500]}
                  motion-reduce:opacity-0
                `}
                  aria-hidden="true"
                />
                {/* Mobile: Vertical connector line for step flow clarity */}
                {/* Micro-UX: Animate in with staggered delay when section becomes visible */}
                {/* Shows the complete flow at a glance, not just on hover */}
                <div
                  className={`
                  md:hidden absolute left-1/2 -bottom-4
                  ${CONNECTOR_SIZES.VERTICAL} ${GRADIENT_CONFIG.CONNECTOR.VERTICAL}
                  transform -translate-x-1/2
                  ${isVisible ? CONNECTOR_REVEAL : 'opacity-0'}
                  group-hover:opacity-100 group-focus-visible:opacity-100
                  transition-opacity ${DURATION_TAILWIND[500]}
                  ${index === 0 ? ANIMATION_DELAYS.TAILWIND[200] : index === 1 ? ANIMATION_DELAYS.TAILWIND[300] : ANIMATION_DELAYS.TAILWIND[500]}
                `}
                  aria-hidden="true"
                />
              </>
            )}
          </li>
        ))}
      </ul>
      <div
        className={`hidden sm:flex items-center justify-center gap-2 mt-6 text-xs ${TEXT_COLORS.MUTED}`}
        role="group"
        aria-label={FEATURE_GRID_LABELS.KEYBOARD_NAV_HINT}
      >
        <span className={FLEX_PATTERNS.GAP_SM}>
          <kbd className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}>
            ←
          </kbd>
          <kbd className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}>
            →
          </kbd>
          <span>{FEATURE_GRID_LABELS.KEYBOARD_NAV_HINT}</span>
        </span>
        <span className={`${TEXT_COLORS.MUTED_LIGHT}`} aria-hidden="true">
          ·
        </span>
        <span className={FLEX_PATTERNS.GAP_SM}>
          <kbd className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}>
            Home
          </kbd>
          <kbd className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}>
            End
          </kbd>
          <span>jump to first/last</span>
        </span>
      </div>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={SR_ONLY}
      >
        {announcement}
      </div>
    </section>
  );
}

export default memo(FeatureGridComponent);
