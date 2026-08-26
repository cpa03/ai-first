'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  UI_CONFIG,
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  PROGRESS_STEPPER_LABELS,
  ANIMATION_DELAYS,
  ANIMATION_CONFIG,
  TRANSITION_CLASSES,
  TEXT_COLOR_CLASSES,
  TEXT_COLORS,
  BG_COLORS,
  BORDER_COLOR_CLASSES,
  PROGRESS_BAR_A11Y,
  PROGRESS_BAR_TRACK,
  ICON_SIZES,
  HEIGHT_ONLY,
  PROGRESS_STEPPER_STYLES,
  FLEX_PATTERNS,
  PROGRESS_PERCENTAGE,
  GENTLE_PULSE,
  STEP_CHECK_POP,
} from '@/lib/config';
import { FOCUS_RING_PATTERNS } from '@/lib/config/remaining-styles';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { triggerHapticFeedback } from '@/lib/utils';
import { isFocusedOnInput } from '@/lib/dom-utils';
import { SR_ONLY, HIDDEN_SM } from '@/lib/config/remaining-hardcoded-patterns';
import { COMPONENT_PRIMARY_PATTERNS } from '@/lib/config/primary-colors';

interface Step {
  id: string;
  label: string;
  completed: boolean;
  current: boolean;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (_stepIndex: number) => void;
}

const ProgressStepperComponent = function ProgressStepper({
  steps,
  currentStep,
  onStepClick,
}: ProgressStepperProps) {
  const progressPercentage = Math.round(
    ((currentStep + 1) / steps.length) * PROGRESS_PERCENTAGE.MAX
  );
  const completedCount = steps.filter((step) => step.completed).length;
  const prefersReducedMotion = usePrefersReducedMotion();
  const [animatingStep, setAnimatingStep] = useState<number | null>(null);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const animatedProgressRef = useRef(0);
  const prevCurrentStepRef = useRef(currentStep);

  // PERFORMANCE: Track values in refs to avoid tearing down and re-binding
  // the global keyboard event listener (listener churn) on every step or prop change.
  const currentStepRef = useRef(currentStep);
  const onStepClickRef = useRef(onStepClick);
  const stepsCountRef = useRef(steps.length);

  // Sync refs using specific dependency effects to guarantee they always hold
  // the up-to-date values while fully adhering to React purity standards and lint rules.
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    onStepClickRef.current = onStepClick;
  }, [onStepClick]);

  useEffect(() => {
    stepsCountRef.current = steps.length;
  }, [steps.length]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setAnimatedProgress(progressPercentage);
      animatedProgressRef.current = progressPercentage;
      return;
    }

    const startValue = animatedProgressRef.current;
    const endValue = progressPercentage;
    const duration = ANIMATION_CONFIG.PROGRESS_STEPPER.PROGRESS_DURATION;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * eased;

      setAnimatedProgress(Math.round(currentValue));
      animatedProgressRef.current = Math.round(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [progressPercentage, prefersReducedMotion]);

  const handleStepClick = useCallback(
    (index: number) => {
      if (!onStepClick) return;
      if (index === currentStep) return;
      triggerHapticFeedback();
      onStepClick(index);
    },
    [onStepClick, currentStep]
  );

  const handleStepKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleStepClick(index);
      }
    },
    [handleStepClick]
  );

  useEffect(() => {
    const prevStep = prevCurrentStepRef.current;
    if (currentStep > prevStep && prevStep < steps.length) {
      setAnimatingStep(prevStep);
      const timer = setTimeout(
        () => setAnimatingStep(null),
        ANIMATION_DELAYS.STEP_ANIMATION
      );
      prevCurrentStepRef.current = currentStep;
      return () => clearTimeout(timer);
    }
    prevCurrentStepRef.current = currentStep;
  }, [currentStep, steps.length]);

  useEffect(() => {
    // Only register the keydown listener if onStepClick callback exists.
    if (!onStepClickRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFocusedOnInput(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const currentStepVal = currentStepRef.current;
      const stepsCountVal = stepsCountRef.current;
      const onStepClickFn = onStepClickRef.current;

      if (!onStepClickFn) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentStepVal < stepsCountVal - 1) {
          triggerHapticFeedback();
          onStepClickFn(currentStepVal + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentStepVal > 0) {
          triggerHapticFeedback();
          onStepClickFn(currentStepVal - 1);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []); // Run exactly once on mount, zero unbind/rebind cycles over the component lifetime!

  return (
    <nav
      className={PROGRESS_STEPPER_STYLES.NAV_CONTAINER}
      aria-label={PROGRESS_STEPPER_LABELS.NAV_ARIA_LABEL}
      role="navigation"
    >
      <div className={HIDDEN_SM}>
        <div className={`${FLEX_PATTERNS.BETWEEN} px-2`}>
          <ol className={PROGRESS_STEPPER_STYLES.MOBILE_STEP_LIST}>
            {steps.map((step, index) => {
              const isClickable = onStepClick && index !== currentStep;
              return (
                <li key={step.id}>
                  <button
                    type="button"
                    onClick={() => handleStepClick(index)}
                    onKeyDown={(e) => handleStepKeyDown(e, index)}
                    disabled={!isClickable}
                    className={`
                      rounded-full ${TRANSITION_CLASSES.SLOW_EASE_OUT}
                      ${isClickable ? `cursor-pointer hover:scale-125 hover:shadow-md hover:shadow-primary-200/50 ${FOCUS_RING_PATTERNS.DEFAULT}` : 'cursor-default'}
                      ${
                        step.current
                          ? `${ICON_SIZES.MD} ${BG_COLORS.BRAND} scale-110 shadow-md shadow-primary-200 ${GENTLE_PULSE}`
                          : step.completed
                            ? `${ICON_SIZES.SM} ${BG_COLORS.BRAND} ${!prefersReducedMotion && animatingStep === index ? STEP_CHECK_POP : ''}`
                            : `${ICON_SIZES.SM} ${BORDER_COLOR_CLASSES.DEFAULT}`
                      }
                    `}
                    aria-current={step.current ? 'step' : undefined}
                    aria-label={`Question ${index + 1}: ${step.current ? PROGRESS_STEPPER_LABELS.STEP_CURRENT : step.completed ? PROGRESS_STEPPER_LABELS.STEP_COMPLETED : PROGRESS_STEPPER_LABELS.STEP_UPCOMING}${isClickable ? ' - Click to jump' : ''}`}
                  />
                </li>
              );
            })}
          </ol>
          <span
            className={`${PROGRESS_STEPPER_STYLES.MOBILE_STEP_COUNT} ${TEXT_COLOR_CLASSES.BODY}`}
            aria-hidden="true"
          >
            {currentStep + 1} / {steps.length}
          </span>
        </div>
        {/* Micro-UX: Show current step label on mobile for context */}
        {/* Helps users understand where they are in the flow without relying on memory */}
        {steps[currentStep] && (
          <div
            className={`${PROGRESS_STEPPER_STYLES.MOBILE_STEP_LABEL} ${TEXT_COLOR_CLASSES.BRAND} truncate`}
            aria-hidden="true"
          >
            {steps[currentStep].label}
          </div>
        )}
        <div
          className={`${PROGRESS_STEPPER_STYLES.MOBILE_PROGRESS_CONTAINER} ${PROGRESS_BAR_TRACK}`}
          role="progressbar"
          aria-valuenow={animatedProgress}
          aria-valuemin={PROGRESS_BAR_A11Y.VALUE_MIN}
          aria-valuemax={PROGRESS_BAR_A11Y.VALUE_MAX}
          aria-label={PROGRESS_STEPPER_LABELS.PROGRESS_ARIA_LABEL(
            completedCount,
            steps.length,
            progressPercentage
          )}
        >
          <div
            className={`h-full ${BG_COLORS.BRAND} rounded-full ${TRANSITION_CLASSES.SLOW_EASE_OUT}`}
            style={{ width: `${animatedProgress}%` }}
          />
        </div>
      </div>

      <ol className={`${FLEX_PATTERNS.BETWEEN} hidden sm:flex`}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isClickable = onStepClick && index !== currentStep;

          return (
            <li
              key={step.id}
              className={`flex-1 ${!isLast ? 'flex items-center' : ''}`}
              aria-current={step.current ? 'step' : undefined}
              aria-label={`${step.label}: ${step.current ? PROGRESS_STEPPER_LABELS.STEP_CURRENT : step.completed ? PROGRESS_STEPPER_LABELS.STEP_COMPLETED : PROGRESS_STEPPER_LABELS.STEP_UPCOMING}${isClickable ? ' - Click to jump' : ''}`}
            >
              <button
                type="button"
                onClick={() => handleStepClick(index)}
                onKeyDown={(e) => handleStepKeyDown(e, index)}
                disabled={!isClickable}
                className={`flex items-center w-full rounded-full transition-all duration-200 ${isClickable ? `cursor-pointer group ${FOCUS_RING_PATTERNS.DEFAULT}` : 'cursor-default'}`}
              >
                <div className={FLEX_PATTERNS.BETWEEN} aria-hidden="true">
                  <div
                    className={`
                      flex items-center justify-center
                      ${ICON_SIZES.XXXL} rounded-full border-2
                      font-medium text-sm ${UI_CONFIG.ACCESSIBILITY.TOUCH_TARGET.MIN_SIZE}
                      ${TRANSITION_CLASSES.SLOW}
                      ${isClickable ? `group-hover:scale-110 group-focus-visible:scale-110 group-hover:shadow-md ${COMPONENT_PRIMARY_PATTERNS.PROGRESS_HOVER}` : ''}
                      ${
                        step.completed
                          ? `${COMPONENT_PRIMARY_PATTERNS.ACTIVE_STEP} ${BG_COLORS.BRAND} text-white`
                          : step.current
                            ? `${COMPONENT_PRIMARY_PATTERNS.ACTIVE_STEP_OUTLINE} ${GENTLE_PULSE}`
                            : `${BORDER_COLOR_CLASSES.DEFAULT} ${TEXT_COLOR_CLASSES.MUTED}`
                      }
                    `}
                  >
                    {step.completed ? (
                      <svg
                        aria-hidden="true"
                        className={`${ICON_SIZES.XL} ${!prefersReducedMotion && animatingStep === index ? STEP_CHECK_POP : ''}`}
                        fill="none"
                        viewBox={SVG_VIEWBOX.STANDARD}
                        stroke="currentColor"
                        strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                        aria-label={
                          PROGRESS_STEPPER_LABELS.CHECKMARK_ARIA_LABEL
                        }
                        role="img"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className={PROGRESS_STEPPER_STYLES.DESKTOP_STEP_LABEL}>
                    <span
                      className={`
                        ${PROGRESS_STEPPER_STYLES.DESKTOP_STEP_LABEL_TEXT}
                        ${isClickable ? `group-hover:${TEXT_COLORS.BRAND} transition-colors` : ''}
                        ${
                          step.current
                            ? TEXT_COLORS.BRAND
                            : step.completed
                              ? TEXT_COLOR_CLASSES.HEADING
                              : TEXT_COLOR_CLASSES.BODY
                        }
                      `}
                    >
                      {step.label}
                    </span>
                    {step.current && (
                      <span
                        className={`${PROGRESS_STEPPER_STYLES.DESKTOP_STEP_COUNT} ${TEXT_COLORS.BRAND_LIGHT}`}
                      >
                        Step {currentStep + 1} of {steps.length}
                      </span>
                    )}
                  </div>
                </div>
              </button>
              {!isLast && (
                <div
                  className={`
                    flex-1 ${HEIGHT_ONLY.XXS} mx-4
                    ${step.completed ? BG_COLORS.BRAND : BG_COLORS.PROGRESS_NEUTRAL}
                    ${TRANSITION_CLASSES.COLOR_SLOW}
                  `}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
      {/* Micro-UX: ARIA progress indicator for screen readers */}
      <div
        role="progressbar"
        aria-valuenow={progressPercentage}
        aria-valuemin={PROGRESS_BAR_A11Y.VALUE_MIN}
        aria-valuemax={PROGRESS_BAR_A11Y.VALUE_MAX}
        aria-label={PROGRESS_STEPPER_LABELS.PROGRESS_ARIA_LABEL(
          completedCount,
          steps.length,
          progressPercentage
        )}
        className={SR_ONLY}
      />
      {/* Micro-UX: Keyboard navigation hints for step navigation */}
      {onStepClick && steps.length > 1 && (
        <div
          className={`${PROGRESS_STEPPER_STYLES.KEYBOARD_HINT} ${TEXT_COLOR_CLASSES.MUTED}`}
          aria-label={PROGRESS_STEPPER_LABELS.KEYBOARD_NAV_ARIA_LABEL}
        >
          <span className={FLEX_PATTERNS.GAP_SM}>
            <kbd className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}>
              ←
            </kbd>
            <kbd className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}>
              →
            </kbd>
            <span>{PROGRESS_STEPPER_LABELS.KEYBOARD_NAV_HINT}</span>
          </span>
        </div>
      )}
    </nav>
  );
};

export default React.memo(ProgressStepperComponent);
