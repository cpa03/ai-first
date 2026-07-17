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
} from '@/lib/config';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { triggerHapticFeedback } from '@/lib/utils';
import { isFocusedOnInput } from '@/lib/dom-utils';

interface Step {
  id: string;
  label: string;
  completed: boolean;
  current: boolean;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

const ProgressStepperComponent = function ProgressStepper({
  steps,
  currentStep,
  onStepClick,
}: ProgressStepperProps) {
  const progressPercentage = Math.round(
    ((currentStep + 1) / steps.length) * 100
  );
  const completedCount = steps.filter((step) => step.completed).length;
  const prefersReducedMotion = usePrefersReducedMotion();
  const [animatingStep, setAnimatingStep] = useState<number | null>(null);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const animatedProgressRef = useRef(0);
  const prevCurrentStepRef = useRef(currentStep);

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
    if (!onStepClick) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFocusedOnInput(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentStep < steps.length - 1) {
          triggerHapticFeedback();
          onStepClick(currentStep + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentStep > 0) {
          triggerHapticFeedback();
          onStepClick(currentStep - 1);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onStepClick, currentStep, steps.length]);

  return (
    <nav
      className="mb-6 sm:mb-8"
      aria-label={PROGRESS_STEPPER_LABELS.NAV_ARIA_LABEL}
      role="navigation"
    >
      <div className="sm:hidden">
        <div className="flex items-center justify-between px-2">
          <ol className="flex items-center space-x-2">
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
                      ${isClickable ? 'cursor-pointer hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2' : 'cursor-default'}
                      ${
                        step.current
                          ? 'w-4 h-4 bg-primary-600 scale-110 shadow-md shadow-primary-200 animate-gentle-pulse'
                          : step.completed
                            ? `w-3 h-3 bg-primary-600 ${!prefersReducedMotion && animatingStep === index ? 'animate-step-check-pop' : ''}`
                            : 'w-3 h-3 bg-gray-300'
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
            className={`text-xs ${TEXT_COLOR_CLASSES.BODY} font-medium tabular-nums`}
            aria-hidden="true"
          >
            {currentStep + 1} / {steps.length}
          </span>
        </div>
        <div
          className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden mx-2"
          role="progressbar"
          aria-valuenow={animatedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={PROGRESS_STEPPER_LABELS.PROGRESS_ARIA_LABEL(
            completedCount,
            steps.length,
            progressPercentage
          )}
        >
          <div
            className="h-full bg-primary-600 rounded-full ${TRANSITION_CLASSES.SLOW_EASE_OUT}"
            style={{ width: `${animatedProgress}%` }}
          />
        </div>
      </div>

      <ol className="hidden sm:flex items-center justify-between">
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
                className={`flex items-center w-full ${isClickable ? 'cursor-pointer group focus-visible:outline-none' : 'cursor-default'}`}
              >
                <div className="flex items-center w-full" aria-hidden="true">
                  <div
                    className={`
                      flex items-center justify-center
                      w-10 h-10 rounded-full border-2
                      font-medium text-sm ${UI_CONFIG.ACCESSIBILITY.TOUCH_TARGET.MIN_SIZE}
                      ${TRANSITION_CLASSES.SLOW}
                      ${isClickable ? 'group-hover:scale-110 group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-primary-500 group-focus-visible:ring-offset-2' : ''}
                      ${
                        step.completed
                          ? 'border-primary-600 bg-primary-600 text-white'
                          : step.current
                            ? 'border-primary-600 text-primary-600 animate-gentle-pulse'
                            : `border-gray-300 ${TEXT_COLOR_CLASSES.MUTED}`
                      }
                    `}
                  >
                    {step.completed ? (
                      <svg
                        className={`w-6 h-6 ${!prefersReducedMotion && animatingStep === index ? 'animate-step-check-pop' : ''}`}
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
                  <div className="flex flex-col ml-3 text-left">
                    <span
                      className={`
                        text-sm font-medium
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
                        className={`text-xs ${TEXT_COLORS.BRAND_LIGHT} font-medium`}
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
                    flex-1 h-0.5 mx-4
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
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={PROGRESS_STEPPER_LABELS.PROGRESS_ARIA_LABEL(
          completedCount,
          steps.length,
          progressPercentage
        )}
        className="sr-only"
      />
      {/* Micro-UX: Keyboard navigation hints for step navigation */}
      {onStepClick && steps.length > 1 && (
        <div
          className="hidden sm:flex items-center justify-center gap-2 mt-2 text-xs text-gray-400"
          aria-label={PROGRESS_STEPPER_LABELS.KEYBOARD_NAV_ARIA_LABEL}
        >
          <span className="flex items-center gap-1.5">
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
