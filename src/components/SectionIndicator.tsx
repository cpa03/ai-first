'use client';

import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { triggerHapticFeedback } from '@/lib/utils';
import Tooltip from './Tooltip';
import {
  TRANSITION_CLASSES,
  Z_INDEX_LAYERS,
  BG_COLORS,
  BORDER_COLORS,
  SHADOW_CLASSES,
  DURATION_TAILWIND,
  UI_CONFIG,
} from '@/lib/config';
import { SECTION_INDICATOR_LABELS } from '@/lib/config/component-labels';
import { FOCUS_RING_OFFSET_PATTERNS } from '@/lib/config/focus-ring-offsets';

interface Section {
  id: string;
  label: string;
  shortcut?: string;
}

interface SectionIndicatorProps {
  sections: Section[];
  className?: string;
}

/**
 * SectionIndicator - Fixed position section navigation indicator
 *
 * Micro-UX: Shows which section is currently in view as user scrolls.
 * Provides spatial awareness on long pages and makes keyboard shortcuts
 * (b, t, e) more discoverable.
 *
 * Follows the pattern of ScrollProgress for positioning and styling.
 */
function SectionIndicatorComponent({
  sections,
  className = '',
}: SectionIndicatorProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionsRef = useRef<Map<string, Element>>(new Map());

  // Set up intersection observer to track which section is in view
  useEffect(() => {
    if (sections.length === 0) return;

    const observerCallback: IntersectionObserverCallback = (entries) => {
      // Find the most visible section
      let maxRatio = 0;
      let visibleSection: string | null = null;

      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
          maxRatio = entry.intersectionRatio;
          visibleSection = entry.target.id;
        }
      });

      if (visibleSection) {
        setActiveSection(visibleSection);
      }
    };

    observerRef.current = new IntersectionObserver(observerCallback, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1],
    });

    // Observe all section elements
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        sectionsRef.current.set(section.id, element);
        observerRef.current?.observe(element);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [sections]);

  // Show/hide indicator based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      // Show after scrolling past the header area
      setIsVisible(scrollTop > UI_CONFIG.SECTION_INDICATOR_SCROLL_THRESHOLD);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = useCallback(
    (sectionId: string) => {
      triggerHapticFeedback();
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      }
    },
    [prefersReducedMotion]
  );

  if (!isVisible || sections.length === 0) return null;

  return (
    <nav
      className={`fixed left-4 top-1/2 -translate-y-1/2 z-${Z_INDEX_LAYERS.TOAST} ${className}`}
      aria-label={SECTION_INDICATOR_LABELS.NAV_ARIA_LABEL}
    >
      <div
        className={`
          flex flex-col gap-2
          ${BG_COLORS.DEFAULT} ${SHADOW_CLASSES.DEFAULT}
          rounded-full
          border ${BORDER_COLORS.LIGHT}
          p-2
          ${prefersReducedMotion ? '' : 'transition-all ' + DURATION_TAILWIND[300]}
        `}
      >
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <Tooltip
              key={section.id}
              content={section.label}
              shortcut={section.shortcut ? [section.shortcut] : undefined}
              position="right"
            >
              <button
                type="button"
                onClick={() => scrollToSection(section.id)}
                className={`
                  relative
                  w-3 h-3
                  rounded-full
                  ${TRANSITION_CLASSES.DEFAULT}
                  ${FOCUS_RING_OFFSET_PATTERNS.COMPACT}
                  ${
                    isActive
                      ? 'bg-primary-600 scale-125'
                      : `${BG_COLORS.LIGHT} hover:${BG_COLORS.BRAND_LIGHT} hover:scale-110`
                  }
                `}
                aria-label={SECTION_INDICATOR_LABELS.SECTION_ARIA_LABEL(
                  section.label
                )}
                aria-current={isActive ? 'true' : undefined}
              >
                {isActive && !prefersReducedMotion && (
                  <span
                    className="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-75"
                    aria-hidden="true"
                  />
                )}
              </button>
            </Tooltip>
          );
        })}
      </div>
    </nav>
  );
}

SectionIndicatorComponent.displayName = 'SectionIndicator';

export default memo(SectionIndicatorComponent);
