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
  INTERSECTION_OBSERVER_CONFIG,
  TEXT_COLORS,
  ICON_SIZES,
} from '@/lib/config';
import { SECTION_INDICATOR_LABELS } from '@/lib/config/component-labels';
import { FOCUS_RING_OFFSET_PATTERNS } from '@/lib/config/focus-ring-offsets';
import { SECTION_INDICATOR_COLORS } from '@/lib/config/theme';
import { useKeyboardShortcuts } from '@/components/KeyboardShortcutsProvider';
import { SR_ONLY } from '@/lib/config/remaining-hardcoded-patterns';

interface Section {
  id: string;
  label: string;
  shortcut?: string;
}

interface SectionIndicatorProps {
  sections: Section[];
  className?: string;
}

function SectionIndicatorComponent({
  sections,
  className = '',
}: SectionIndicatorProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionsRef = useRef<Map<string, Element>>(new Map());
  const { openHelp } = useKeyboardShortcuts();

  useEffect(() => {
    if (sections.length === 0) return;

    const observerCallback: IntersectionObserverCallback = (entries) => {
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
      rootMargin: INTERSECTION_OBSERVER_CONFIG.SECTION_INDICATOR.ROOT_MARGIN,
      threshold: [...INTERSECTION_OBSERVER_CONFIG.SECTION_INDICATOR.THRESHOLD],
    });

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

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsVisible(scrollTop > UI_CONFIG.SECTION_INDICATOR_SCROLL_THRESHOLD);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isSectionDot = target.closest('[data-section-dot]');
      if (!isSectionDot) return;

      const currentIndex = sections.findIndex(
        (section) => section.id === target.dataset.sectionId
      );
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;

      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          nextIndex = Math.max(currentIndex - 1, 0);
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          nextIndex = Math.min(currentIndex + 1, sections.length - 1);
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = sections.length - 1;
          break;
        case '?':
          e.preventDefault();
          openHelp();
          return;
        default:
          return;
      }

      if (nextIndex !== currentIndex) {
        const nextDot = document.querySelector(
          `[data-section-id="${sections[nextIndex].id}"]`
        ) as HTMLElement;
        if (nextDot) {
          nextDot.focus();
          setAnnouncement(
            SECTION_INDICATOR_LABELS.ANNOUNCEMENT(sections[nextIndex].label)
          );
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sections, openHelp]);

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

  if (sections.length === 0) return null;

  return (
    <nav
      className={`fixed left-4 top-1/2 -translate-y-1/2 z-${Z_INDEX_LAYERS.TOAST} ${className}`}
      aria-label={SECTION_INDICATOR_LABELS.NAV_ARIA_LABEL}
      aria-hidden={!isVisible}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? 'translateY(-50%) translateX(0)'
          : 'translateY(-50%) translateX(-8px)',
        pointerEvents: isVisible ? 'auto' : 'none',
        transition: prefersReducedMotion
          ? 'opacity 0.15s ease, transform 0.15s ease'
          : 'opacity 0.3s ease, transform 0.3s ease',
      }}
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
        {sections.map((section, index) => {
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
                data-section-dot
                data-section-id={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`
                  relative
                  ${ICON_SIZES.SM}
                  rounded-full
                  ${TRANSITION_CLASSES.DEFAULT}
                  ${FOCUS_RING_OFFSET_PATTERNS.COMPACT}
                  ${
                    isActive
                      ? `${SECTION_INDICATOR_COLORS.ACTIVE_BG} scale-125`
                      : `${SECTION_INDICATOR_COLORS.INACTIVE_BG} ${SECTION_INDICATOR_COLORS.INACTIVE_HOVER_BG} hover:scale-110 focus-visible:scale-125`
                  }
                `}
                aria-label={SECTION_INDICATOR_LABELS.SECTION_ARIA_LABEL(
                  section.label
                )}
                aria-current={isActive ? 'true' : undefined}
              >
                {isActive && !prefersReducedMotion && (
                  <span
                    className={`absolute inset-0 rounded-full ${SECTION_INDICATOR_COLORS.ACTIVE_PING} animate-ping opacity-75`}
                    aria-hidden="true"
                  />
                )}
              </button>
            </Tooltip>
          );
        })}
      </div>
      {/* Micro-UX: Descriptive keyboard hint with styled kbd elements for discoverability */}
      <div
        className={`hidden sm:flex items-center justify-center gap-1 mt-2 text-xs ${TEXT_COLORS.MUTED}`}
        aria-hidden="true"
      >
        <kbd className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_MINI}>↑</kbd>
        <kbd className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_MINI}>↓</kbd>
      </div>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={SR_ONLY}
      >
        {announcement}
      </div>
    </nav>
  );
}

SectionIndicatorComponent.displayName = 'SectionIndicator';

export default memo(SectionIndicatorComponent);
