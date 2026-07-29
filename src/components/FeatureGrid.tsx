'use client';

import { memo, useEffect, useRef, useState, useCallback } from 'react';
import {
  ANIMATION_DELAYS,
  DURATION_TAILWIND,
  TYPOGRAPHY_CLASSES,
  TEXT_COLORS,
  GRADIENT_CONFIG,
} from '@/lib/config/theme';
import { GRAY_CLASSES } from '@/lib/config/remaining-styles';
import { FEATURE_CONFIG } from '@/lib/config/landing-page';
import { FEATURE_GRID_LABELS } from '@/lib/config/component-labels';
import { UI_STRINGS, UI_CONFIG } from '@/lib/config/ui';
import {
  HOME_PAGE_ELEMENT_IDS,
  ARIA_HEADING_IDS,
} from '@/lib/config/element-ids';

function FeatureGridComponent() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isFeatureCardFocused = target.closest('[data-feature-card]');
      if (!isFeatureCardFocused) return;

      const currentIndex = FEATURE_CONFIG.FEATURES.findIndex(
        (feature) => feature.step.toString() === target.dataset.featureStep
      );
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = Math.min(
            currentIndex + 1,
            FEATURE_CONFIG.FEATURES.length - 1
          );
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          nextIndex = Math.max(currentIndex - 1, 0);
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = FEATURE_CONFIG.FEATURES.length - 1;
          break;
        default:
          return;
      }

      if (nextIndex !== currentIndex) {
        const nextCard = document.querySelector(
          `[data-feature-step="${FEATURE_CONFIG.FEATURES[nextIndex].step}"]`
        ) as HTMLElement;
        if (nextCard) {
          nextCard.focus();
          setFocusedIndex(nextIndex);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFocus = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedIndex(null);
  }, []);

  const animationClasses = UI_STRINGS.ANIMATION.FEATURE_GRID;

  return (
    <section
      ref={sectionRef}
      aria-labelledby={ARIA_HEADING_IDS.HOW_IT_WORKS}
      className="mt-16"
    >
      <h2 id={HOME_PAGE_ELEMENT_IDS.HOW_IT_WORKS_HEADING} className="sr-only">
        How It Works
      </h2>
      <ul
        className="grid md:grid-cols-3 gap-8"
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
              group relative text-center p-6 rounded-xl
              gradient-border-hover card-lift feature-card-focus
              bg-white
              focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2
              focus-visible:scale-[1.02] focus-visible:shadow-lg focus-visible:shadow-primary-100/50
              motion-reduce:transition-none
              ${isVisible ? animationClasses[index] : 'opacity-0'}
              ${focusedIndex === index ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
            `}
            aria-label={FEATURE_GRID_LABELS.STEP_ARIA_LABEL(
              feature.step,
              feature.title,
              feature.description
            )}
          >
            <div
              className="
              bg-primary-100 rounded-full w-16 h-16 
              flex items-center justify-center mx-auto mb-4
              transition-all ${DURATION_TAILWIND[300]} group-hover:scale-110
              group-hover:bg-primary-200
              group-focus-visible:scale-110 group-focus-visible:bg-primary-200 group-focus-visible:shadow-lg group-focus-visible:shadow-primary-200/50
              motion-reduce:transition-none motion-reduce:group-hover:scale-100
            "
              aria-hidden="true"
            >
              <span
                className={`badge-animate ${TEXT_COLORS.BRAND} text-2xl ${TYPOGRAPHY_CLASSES.BOLD} ${
                  isVisible ? `animate-badge-entrance-glow` : 'opacity-0'
                }`}
                style={{
                  animationDelay: isVisible
                    ? `${index * 200 + 300}ms`
                    : undefined,
                }}
              >
                {feature.step}
              </span>
            </div>

            <h3
              className={`text-lg font-semibold ${TEXT_COLORS.PRIMARY} mb-2 group-hover:text-primary-700 transition-colors ${DURATION_TAILWIND[300]}`}
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
                {/* Micro-UX: Show on hover AND focus-visible for keyboard accessibility */}
                {/* Micro-UX: Staggered animation delay creates a polished sequential reveal */}
                <div
                  className={`
                  hidden md:block absolute top-1/2 -right-4 
                  w-8 h-0.5 ${GRADIENT_CONFIG.CONNECTOR.HORIZONTAL}
                  transform -translate-y-1/2
                  opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100
                  transition-opacity ${DURATION_TAILWIND[500]}
                  ${index === 0 ? ANIMATION_DELAYS.TAILWIND[100] : index === 1 ? ANIMATION_DELAYS.TAILWIND[200] : ANIMATION_DELAYS.TAILWIND[300]}
                  motion-reduce:opacity-0
                `}
                  aria-hidden="true"
                />
                {/* Mobile: Vertical connector line for step flow clarity */}
                {/* Micro-UX: Show on hover AND focus-visible for keyboard accessibility */}
                {/* Micro-UX: Staggered animation delay creates a polished sequential reveal */}
                <div
                  className={`
                  md:hidden absolute left-1/2 -bottom-4
                  w-0.5 h-8 ${GRADIENT_CONFIG.CONNECTOR.VERTICAL}
                  transform -translate-x-1/2
                  ${isVisible ? 'fade-in' : 'opacity-0'}
                  group-hover:opacity-100 group-focus-visible:opacity-100
                  transition-opacity ${DURATION_TAILWIND[500]}
                  ${index === 0 ? ANIMATION_DELAYS.TAILWIND[100] : index === 1 ? ANIMATION_DELAYS.TAILWIND[200] : ANIMATION_DELAYS.TAILWIND[300]}
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
        aria-label={FEATURE_GRID_LABELS.KEYBOARD_NAV_HINT}
      >
        <span className="flex items-center gap-1.5">
          <kbd className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}>
            ←
          </kbd>
          <kbd className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}>
            →
          </kbd>
          <span>{FEATURE_GRID_LABELS.KEYBOARD_NAV_HINT}</span>
        </span>
      </div>
    </section>
  );
}

export default memo(FeatureGridComponent);
