'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics';
import { COMPONENT_CONFIG } from '@/lib/config/components';
import { ANIMATION_CONFIG } from '@/lib/config/animation';
import { LOCAL_STORAGE_KEYS } from '@/lib/config/storage-keys';
import {
  DURATION_TAILWIND,
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  Z_INDEX_LAYERS,
  TEXT_COLORS,
  BG_COLORS,
  BORDER_COLORS,
  SHADOW_CLASSES,
  TRANSITION_CLASSES,
  TYPOGRAPHY_CLASSES,
  PROGRESS_BAR_A11Y,
} from '@/lib/config/theme';
import { PROGRESS_PERCENTAGE } from '@/lib/config/modular-constants';
import { ICON_SIZES, INDICATOR_SIZES } from '@/lib/config/icon-sizes';
import {
  USER_ONBOARDING_LABELS,
  USER_ONBOARDING_COMPLETION_LABELS,
} from '@/lib/config/component-labels';
import {
  ONBOARDING_ELEMENT_IDS,
  ARIA_HEADING_IDS,
} from '@/lib/config/element-ids';
import {
  TEXT_SIZE_CLASSES,
  TEXT_SIZE_PRESETS,
} from '@/lib/config/ui-text-sizes';
import { CONTAINER_WIDTH_CLASSES } from '@/lib/config/ui-dimensions';
import { FOCUS_RING_PATTERNS } from '@/lib/config/remaining-styles';
import { COORDINATE_POSITION_PATTERNS } from '@/lib/config/positioning';
import {
  MT_CLASSES,
  MB_CLASSES,
  COMMON_SPACING_PATTERNS,
} from '@/lib/config/spacing';
import { triggerHapticFeedback } from '@/lib/utils';
import { isFocusedOnInput } from '@/lib/dom-utils';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useConfetti } from '@/hooks/useConfetti';
import Tooltip from './Tooltip';
import { CONFETTI_DOT } from '@/lib/config';
import { CSS_POSITIONING } from '@/lib/config/css-positioning';
import { MX_CLASSES } from '@/lib/config/spacing';

/**
 * Onboarding Tour Steps
 * Each step highlights a key feature or area of the page
 */
interface TourStep {
  /** Unique identifier for the step */
  id: string;
  /** Title displayed in the tooltip */
  title: string;
  /** Detailed description */
  content: string;
  /** CSS selector for the element to highlight */
  targetSelector: string;
  /** Position of the tooltip relative to target */
  position: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [...USER_ONBOARDING_LABELS.TOUR_STEPS];

/**
 * Storage key for remembering if user has completed onboarding
 */
const ONBOARDING_COMPLETED_KEY = LOCAL_STORAGE_KEYS.ONBOARDING_COMPLETED;

/**
 * UserOnboarding Component
 *
 * A guided tour that helps new users understand how to use IdeaFlow.
 * Shows only to first-time visitors and can be dismissed/skipped.
 * Tracks onboarding start and completion events for growth analytics.
 *
 * @example
 * <UserOnboarding />
 */
export default function UserOnboarding() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
  }>({
    top: 0,
    left: 0,
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const animatingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const celebrationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { particles, fire } = useConfetti();

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;
  const progress =
    ((currentStepIndex + 1) / TOUR_STEPS.length) * PROGRESS_PERCENTAGE.MAX;

  useEffect(() => {
    return () => {
      if (animatingTimeoutRef.current) {
        clearTimeout(animatingTimeoutRef.current);
      }
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Calculate tooltip position based on target element
   */
  const calculatePosition = useCallback(() => {
    if (!currentStep) return { top: 0, left: 0 };

    const targetElement = document.querySelector(currentStep.targetSelector);
    if (!targetElement) {
      const tooltipWidth = COMPONENT_CONFIG.ONBOARDING.TOOLTIP.WIDTH;
      return {
        top: COMPONENT_CONFIG.ONBOARDING.FALLBACK_POSITION.TOP,
        left: window.innerWidth / 2 - tooltipWidth / 2,
      };
    }

    const rect = targetElement.getBoundingClientRect();
    const tooltipWidth = COMPONENT_CONFIG.ONBOARDING.TOOLTIP.WIDTH;
    const tooltipHeight = COMPONENT_CONFIG.ONBOARDING.TOOLTIP.HEIGHT;
    const gap = COMPONENT_CONFIG.ONBOARDING.TOOLTIP.GAP;

    let top = 0;
    let left = 0;

    switch (currentStep.position) {
      case 'top':
        top = rect.top - tooltipHeight - gap + window.scrollY;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = rect.bottom + gap + window.scrollY;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2 + window.scrollY;
        left = rect.left - tooltipWidth - gap;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2 + window.scrollY;
        left = rect.right + gap;
        break;
    }

    // Keep tooltip within viewport
    const padding = COMPONENT_CONFIG.ONBOARDING.TOOLTIP.VIEWPORT_PADDING;
    left = Math.max(
      padding,
      Math.min(left, window.innerWidth - tooltipWidth - padding)
    );
    top = Math.max(
      padding,
      Math.min(top, window.innerHeight - tooltipHeight - padding)
    );

    return { top, left };
  }, [currentStep]);

  /**
   * Initialize onboarding - check if user has seen it before
   */
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem(
      ONBOARDING_COMPLETED_KEY
    );

    if (!hasCompletedOnboarding) {
      // Small delay to let page render
      const timer = setTimeout(() => {
        setIsVisible(true);
        // Growth: Track onboarding start
        trackEvent(ANALYTICS_EVENTS.ONBOARDING_START, {
          step: 'welcome',
        });
      }, COMPONENT_CONFIG.ONBOARDING.DELAY_MS);

      return () => clearTimeout(timer);
    }
  }, []);

  /**
   * Update tooltip position when step changes or on scroll/resize
   */
  useEffect(() => {
    if (!isVisible) return;

    const updatePosition = () => {
      setTooltipPosition(calculatePosition());
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isVisible, currentStepIndex, calculatePosition]);

  /**
   * Handle moving to next step
   */
  const handleNext = useCallback(() => {
    setIsAnimating(true);

    if (isLastStep) {
      triggerHapticFeedback();
      setShowCelebration(true);
      fire(); // Micro-UX: Confetti burst on onboarding completion

      celebrationTimeoutRef.current = setTimeout(
        () => {
          localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
          setIsVisible(false);
          setShowCelebration(false);
          trackEvent(ANALYTICS_EVENTS.ONBOARDING_COMPLETE, {
            total_steps: TOUR_STEPS.length,
          });
        },
        prefersReducedMotion
          ? ANIMATION_CONFIG.ONBOARDING_CELEBRATION_REDUCED
          : ANIMATION_CONFIG.ONBOARDING_CELEBRATION_STANDARD
      );
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }

    animatingTimeoutRef.current = setTimeout(
      () => setIsAnimating(false),
      ANIMATION_CONFIG.MOUNT_DELAY
    );
  }, [isLastStep, prefersReducedMotion, fire]);

  /**
   * Handle skipping/dismissing onboarding
   */
  const handleSkip = useCallback(() => {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    setIsVisible(false);
    // Growth: Track that user skipped onboarding
    trackEvent(ANALYTICS_EVENTS.ONBOARDING_COMPLETE, {
      skipped: true,
      completed_steps: currentStepIndex + 1,
      total_steps: TOUR_STEPS.length,
    });
  }, [currentStepIndex]);

  /**
   * Handle going to previous step
   */
  const handlePrev = useCallback(() => {
    setIsAnimating(true);
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
    animatingTimeoutRef.current = setTimeout(
      () => setIsAnimating(false),
      COMPONENT_CONFIG.ONBOARDING.STEP_TRANSITION_MS
    );
  }, []);

  /**
   * Micro-UX: Keyboard navigation for onboarding tour
   * ArrowRight/Enter = Next step, ArrowLeft/Backspace = Previous step, Escape = Skip
   * Improves accessibility for keyboard-only users
   */
  useEffect(() => {
    if (!isVisible || showCelebration) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if user is typing in an input
      if (isFocusedOnInput(e.target)) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'Enter':
          e.preventDefault();
          triggerHapticFeedback();
          handleNext();
          break;
        case 'ArrowLeft':
        case 'Backspace':
          e.preventDefault();
          if (currentStepIndex > 0) {
            triggerHapticFeedback();
            handlePrev();
          }
          break;
        case 'Escape':
          e.preventDefault();
          triggerHapticFeedback();
          handleSkip();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    isVisible,
    showCelebration,
    currentStepIndex,
    handleNext,
    handlePrev,
    handleSkip,
  ]);

  if (!isVisible) return null;

  if (showCelebration) {
    return (
      <div
        className={`fixed inset-0 z-[${Z_INDEX_LAYERS.MODAL}] flex items-center justify-center`}
        role="dialog"
        aria-label={USER_ONBOARDING_LABELS.COMPLETION_ARIA_LABEL}
      >
        <div
          className={`absolute inset-0 ${BG_COLORS.OVERLAY} backdrop-blur-sm`}
          aria-hidden="true"
        />
        <div
          className={`relative ${BG_COLORS.DEFAULT} rounded-2xl ${SHADOW_CLASSES.EXTRA_LARGE} p-8 text-center max-w-sm mx-4 ${
            prefersReducedMotion
              ? ''
              : `animate-in fade-in zoom-in ${DURATION_TAILWIND[300]}`
          }`}
        >
          {/* Confetti particles */}
          {particles.map((particle) => (
            <span
              key={particle.id}
              className={CONFETTI_DOT}
              style={
                {
                  ...CSS_POSITIONING.CENTER_ANIMATED,
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
          <div
            className={`${ICON_SIZES.XXL_20} mx-auto ${MB_CLASSES.XXL_SM} rounded-full flex items-center justify-center ${
              prefersReducedMotion
                ? BG_COLORS.SUCCESS_LIGHT
                : `${BG_COLORS.SUCCESS_LIGHT} animate-success-pop`
            }`}
          >
            <svg
              className={`${ICON_SIZES.XXXL} ${TEXT_COLORS.SUCCESS_DARK} ${prefersReducedMotion ? '' : 'animate-success-check'}`}
              fill="none"
              viewBox={SVG_VIEWBOX.STANDARD}
              stroke="currentColor"
              strokeWidth={SVG_STROKE_WIDTHS.THICK}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3
            className={`${TYPOGRAPHY_CLASSES.COMPONENT_HEADING} ${TEXT_COLORS.PRIMARY} ${MB_CLASSES.MD}`}
          >
            {USER_ONBOARDING_COMPLETION_LABELS.TITLE}
          </h3>
          <p className={`text-sm ${TEXT_COLORS.SECONDARY}`}>
            {USER_ONBOARDING_COMPLETION_LABELS.DESCRIPTION}
          </p>
        </div>
      </div>
    );
  }

  if (!currentStep) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 ${BG_COLORS.OVERLAY} backdrop-blur-sm z-[${Z_INDEX_LAYERS.OVERLAY}] transition-opacity ${DURATION_TAILWIND[300]}`}
        aria-hidden="true"
        onClick={handleSkip}
      />

      {/* Highlighted area indicator (simplified) */}
      <div
        className={`fixed pointer-events-none z-[${Z_INDEX_LAYERS.CONTENT}] border-2 border-primary-500 rounded-lg transition-all ${DURATION_TAILWIND[300]}`}
        style={{
          opacity: 0,
        }}
        aria-hidden="true"
      />

      {/* Tooltip */}
      <div
        role="dialog"
        aria-labelledby={ARIA_HEADING_IDS.ONBOARDING}
        aria-describedby={ONBOARDING_ELEMENT_IDS.ONBOARDING_CONTENT}
        className={`
          fixed z-[${Z_INDEX_LAYERS.MODAL}] ${CONTAINER_WIDTH_CLASSES.ONBOARDING} ${BG_COLORS.DEFAULT} rounded-xl ${SHADOW_CLASSES.EXTRA_LARGE} 
          border ${BORDER_COLORS.LIGHT} p-5
          ${TRANSITION_CLASSES.SLOW} ease-out
          ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
        `}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        {/* Progress bar */}
        <div
          className={`absolute top-0 left-0 h-1 ${BG_COLORS.BRAND_500} rounded-t-xl transition-all ${DURATION_TAILWIND[300]}`}
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={PROGRESS_BAR_A11Y.VALUE_MIN}
          aria-valuemax={PROGRESS_BAR_A11Y.VALUE_MAX}
          aria-label={USER_ONBOARDING_LABELS.PROGRESS_ARIA_LABEL}
        />

        {/* Close button */}
        <div className={COORDINATE_POSITION_PATTERNS.TOP_RIGHT_SM}>
          <Tooltip
            content={USER_ONBOARDING_LABELS.SKIP_TOOLTIP_LABEL}
            shortcut={['Esc']}
            position="bottom"
          >
            <button
              onClick={handleSkip}
              className={`${TEXT_COLORS.MUTED_DARK} ${TEXT_COLORS.HOVER_SECONDARY} ${TRANSITION_CLASSES.COLOR} p-1 ${FOCUS_RING_PATTERNS.DEFAULT} rounded-md`}
              aria-label={USER_ONBOARDING_LABELS.SKIP_ARIA_LABEL}
            >
              <svg
                className={ICON_SIZES.LG}
                fill="none"
                stroke="currentColor"
                viewBox={SVG_VIEWBOX.STANDARD}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </Tooltip>
        </div>

        {/* Content */}
        <div className={MT_CLASSES.MD}>
          <h3
            id={ONBOARDING_ELEMENT_IDS.ONBOARDING_TITLE}
            className={`${TYPOGRAPHY_CLASSES.SUBHEADING} ${TEXT_COLORS.PRIMARY} ${MB_CLASSES.MD}`}
          >
            {currentStep.title}
          </h3>
          <p
            id={ONBOARDING_ELEMENT_IDS.ONBOARDING_CONTENT}
            className={`${TEXT_COLORS.SECONDARY} text-sm leading-relaxed`}
          >
            {currentStep.content}
          </p>
        </div>

        {/* Navigation buttons */}
        <div
          className={`${COMMON_SPACING_PATTERNS.FLEX_BETWEEN} ${MT_CLASSES.XXL_SM}`}
        >
          <div className={COMMON_SPACING_PATTERNS.FLEX_COL_SM}>
            <div
              className={COMMON_SPACING_PATTERNS.FLEX_CENTER_SM}
              role="group"
              aria-label={USER_ONBOARDING_LABELS.PROGRESS_ARIA_LABEL}
            >
              {TOUR_STEPS.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => {
                    if (index < currentStepIndex) {
                      triggerHapticFeedback();
                      setCurrentStepIndex(index);
                    }
                  }}
                  className={`rounded-full transition-all ${DURATION_TAILWIND[200]} ease-out ${FOCUS_RING_PATTERNS.DEFAULT} hover:scale-125 focus-visible:scale-125 ${
                    index === currentStepIndex
                      ? `${INDICATOR_SIZES.PILL} ${BG_COLORS.BRAND}`
                      : index < currentStepIndex
                        ? `${ICON_SIZES.XS} ${BG_COLORS.BRAND} opacity-60 hover:opacity-80 cursor-pointer`
                        : `${ICON_SIZES.XS} ${BG_COLORS.LIGHTER} ${TEXT_COLORS.MUTED}`
                  }`}
                  aria-label={
                    index === currentStepIndex
                      ? USER_ONBOARDING_COMPLETION_LABELS.STEP_INDICATOR(
                          index + 1,
                          TOUR_STEPS.length
                        )
                      : `Go to step ${index + 1}`
                  }
                  aria-current={index === currentStepIndex ? 'step' : undefined}
                  disabled={index > currentStepIndex}
                  type="button"
                />
              ))}
            </div>
            <span
              className={`${TEXT_SIZE_CLASSES.XS} ${TEXT_COLORS.MUTED} hidden sm:inline`}
            >
              <kbd
                className={`px-1 py-0.5 ${BG_COLORS.LIGHTER} rounded ${TEXT_SIZE_PRESETS.KBD} ${TEXT_COLORS.SECONDARY}`}
              >
                ←
              </kbd>{' '}
              <kbd
                className={`px-1 py-0.5 ${BG_COLORS.LIGHTER} rounded ${TEXT_SIZE_PRESETS.KBD} ${TEXT_COLORS.SECONDARY}`}
              >
                →
              </kbd>{' '}
              {USER_ONBOARDING_COMPLETION_LABELS.NAVIGATE_HINT}
              <span className={MX_CLASSES.SM}>
                {USER_ONBOARDING_LABELS.SEPARATOR}
              </span>
              <kbd
                className={`px-1 py-0.5 ${BG_COLORS.LIGHTER} rounded ${TEXT_SIZE_PRESETS.KBD} ${TEXT_COLORS.SECONDARY}`}
              >
                Esc
              </kbd>{' '}
              {USER_ONBOARDING_COMPLETION_LABELS.SKIP_HINT}
            </span>
          </div>

          {/* Action buttons */}
          <div className={COMMON_SPACING_PATTERNS.FLEX_CENTER_SM}>
            {currentStepIndex > 0 && (
              <Tooltip
                content={USER_ONBOARDING_LABELS.PREV_STEP_TOOLTIP_LABEL}
                shortcut={['←']}
              >
                <button
                  onClick={handlePrev}
                  className={`px-3 py-1.5 text-sm ${TEXT_COLORS.SECONDARY} ${TEXT_COLORS.HOVER_PRIMARY} ${BG_COLORS.LIGHTER} rounded-lg ${TRANSITION_CLASSES.COLOR} ${FOCUS_RING_PATTERNS.DEFAULT}`}
                >
                  {USER_ONBOARDING_COMPLETION_LABELS.BACK_BUTTON}
                </button>
              </Tooltip>
            )}
            <Tooltip
              content={
                isLastStep
                  ? USER_ONBOARDING_LABELS.START_TOOLTIP_LABEL
                  : USER_ONBOARDING_LABELS.NEXT_STEP_TOOLTIP_LABEL
              }
              shortcut={['→']}
            >
              <button
                onClick={handleNext}
                className={`px-4 py-1.5 text-sm ${BG_COLORS.BRAND} text-white rounded-lg ${BG_COLORS.BRAND_HOVER} ${TRANSITION_CLASSES.COLOR} font-medium ${FOCUS_RING_PATTERNS.DEFAULT}`}
              >
                {isLastStep
                  ? USER_ONBOARDING_COMPLETION_LABELS.GET_STARTED_BUTTON
                  : USER_ONBOARDING_COMPLETION_LABELS.NEXT_BUTTON}
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </>
  );
}
