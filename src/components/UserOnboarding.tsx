'use client';

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useSyncExternalStore,
} from 'react';
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics';
import {
  COMPONENT_CONFIG,
  ANIMATION_CONFIG,
  LOCAL_STORAGE_KEYS,
  SVG_STROKE_WIDTHS,
  Z_INDEX_LAYERS,
  USER_ONBOARDING_LABELS,
} from '@/lib/config';
import { triggerHapticFeedback } from '@/lib/utils';

// Reduced motion detection for celebration animation
const subscribeToMotionPreference = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
};

const getMotionSnapshot = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const getServerMotionSnapshot = () => false;

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToMotionPreference,
    getMotionSnapshot,
    getServerMotionSnapshot
  );
}

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

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to IdeaFlow! 👋',
    content:
      "Transform your ideas into actionable project plans with AI. Let's take a quick tour.",
    targetSelector: 'h1',
    position: 'bottom',
  },
  {
    id: 'idea-input',
    title: '1. Share Your Idea',
    content:
      'Enter your project idea in natural language. Our AI will help clarify details.',
    targetSelector: '[aria-labelledby="idea-input-heading"]',
    position: 'top',
  },
  {
    id: 'breakdown',
    title: '2. Get Your Project Plan',
    content:
      'We break down your idea into tasks, estimate effort, and create a realistic timeline.',
    targetSelector: '[aria-labelledby="how-it-works-heading"]',
    position: 'top',
  },
  {
    id: 'share',
    title: '3. Export or Share',
    content: 'Export to Markdown, Notion, Trello, or share with your team!',
    targetSelector: '[aria-label*="Share IdeaFlow"]',
    position: 'left',
  },
];

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

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;
  const progress = ((currentStepIndex + 1) / TOUR_STEPS.length) * 100;

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
      // Default position if element not found
      const tooltipWidth = COMPONENT_CONFIG.ONBOARDING.TOOLTIP.WIDTH;
      return { top: 200, left: window.innerWidth / 2 - tooltipWidth / 2 };
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
  }, [isLastStep, prefersReducedMotion]);

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
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
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
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          aria-hidden="true"
        />
        <div
          className={`relative bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm mx-4 ${
            prefersReducedMotion
              ? ''
              : 'animate-in fade-in zoom-in duration-300'
          }`}
        >
          <div
            className={`w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center ${
              prefersReducedMotion
                ? 'bg-green-100'
                : 'bg-green-100 animate-success-pop'
            }`}
          >
            <svg
              className={`w-10 h-10 text-green-700 ${prefersReducedMotion ? '' : 'animate-success-check'}`}
              fill="none"
              viewBox="0 0 24 24"
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
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            You&apos;re all set!
          </h3>
          <p className="text-sm text-gray-600">
            You&apos;re ready to turn your ideas into actionable plans.
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
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[${Z_INDEX_LAYERS.OVERLAY}] transition-opacity duration-300`}
        aria-hidden="true"
        onClick={handleSkip}
      />

      {/* Highlighted area indicator (simplified) */}
      <div
        className={`fixed pointer-events-none z-[${Z_INDEX_LAYERS.CONTENT}] border-2 border-primary-500 rounded-lg transition-all duration-300`}
        style={{
          opacity: 0,
        }}
        aria-hidden="true"
      />

      {/* Tooltip */}
      <div
        role="dialog"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-content"
        className={`
          fixed z-[${Z_INDEX_LAYERS.MODAL}] w-[300px] bg-white rounded-xl shadow-2xl 
          border border-gray-200 p-5
          transition-all duration-300 ease-out
          ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
        `}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        {/* Progress bar */}
        <div
          className="absolute top-0 left-0 h-1 bg-primary-500 rounded-t-xl transition-all duration-300"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={USER_ONBOARDING_LABELS.PROGRESS_ARIA_LABEL}
        />

        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-1"
          aria-label={USER_ONBOARDING_LABELS.SKIP_ARIA_LABEL}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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

        {/* Content */}
        <div className="mt-2">
          <h3
            id="onboarding-title"
            className="text-lg font-semibold text-gray-900 mb-2"
          >
            {currentStep.title}
          </h3>
          <p
            id="onboarding-content"
            className="text-gray-600 text-sm leading-relaxed"
          >
            {currentStep.content}
          </p>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-5">
          {/* Step indicator with keyboard hint */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">
              Step {currentStepIndex + 1} of {TOUR_STEPS.length}
            </span>
            <span className="text-[10px] text-gray-500 hidden sm:inline">
              <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[9px] text-gray-600">
                ←
              </kbd>{' '}
              <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[9px] text-gray-600">
                →
              </kbd>{' '}
              navigate
              <span className="mx-1">·</span>
              <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[9px] text-gray-600">
                Esc
              </kbd>{' '}
              skip
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              {isLastStep ? 'Get Started!' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
