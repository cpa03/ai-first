'use client';

import React, { useEffect, useState, useCallback, memo } from 'react';
import { ANIMATION_CONFIG } from '@/lib/config/constants';
import {
  CELEBRATION_COLORS,
  ANIMATION_PHYSICS,
  SVG_ANIMATION,
  ANIMATION_DELAYS,
  COMPONENT_DEFAULTS,
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  Z_INDEX_LAYERS,
  COMPONENT_CONFIG,
  UI_CONFIG,
  OPACITY_CONFIG,
  STEP_CELEBRATION_LABELS,
  GRADIENT_PATTERNS,
  STEP_CELEBRATION_TAILWIND,
  DURATION_TAILWIND,
  TRANSITION_CLASSES,
  WHITE_BG_PATTERNS,
  STEP_CELEBRATION_CHECKMARK_CONTAINER,
  STEP_CELEBRATION_CHECKMARK_ICON,
  STEP_CELEBRATION_RIPPLE_1,
  STEP_CELEBRATION_RIPPLE_2,
  STEP_CELEBRATION_PROGRESS_TRACK,
  STEP_CELEBRATION_PARTICLE,
  STEP_CELEBRATION_TEXT_CONTAINER,
  STEP_CELEBRATION_STEP_COMPLETE,
  STEP_CELEBRATION_PROGRESS_COMPLETE,
  DRAW_CHECK,
} from '@/lib/config';
import { triggerHapticFeedback } from '@/lib/utils';
import StatusAnnouncer from './StatusAnnouncer';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface StepCelebrationProps {
  stepNumber: number;
  totalSteps: number;
  show: boolean;
  onComplete?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  delay: number;
}

function StepCelebrationComponent({
  stepNumber,
  totalSteps,
  show,
  onComplete,
}: StepCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldAnimate = !prefersReducedMotion;
  const exitTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
      }
    };
  }, []);

  const generateParticles = useCallback((): Particle[] => {
    const count = COMPONENT_CONFIG.STEP_CELEBRATION.PARTICLE_COUNT;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x:
        Math.cos((i / count) * Math.PI * 2) *
        COMPONENT_CONFIG.STEP_CELEBRATION.RADIUS_MULTIPLIER,
      y:
        Math.sin((i / count) * Math.PI * 2) *
        COMPONENT_CONFIG.STEP_CELEBRATION.RADIUS_MULTIPLIER,
      rotation: (i / count) * ANIMATION_PHYSICS.FULL_ROTATION_DEGREES,
      scale:
        ANIMATION_PHYSICS.SCALE_RANGE.MIN +
        Math.random() *
          (ANIMATION_PHYSICS.SCALE_RANGE.MAX -
            ANIMATION_PHYSICS.SCALE_RANGE.MIN),
      delay: i * ANIMATION_DELAYS.PARTICLE_STAGGER,
    }));
  }, []);

  useEffect(() => {
    if (show && shouldAnimate) {
      setParticles(generateParticles());
      setIsVisible(true);
      setIsExiting(false);
      triggerHapticFeedback();

      const timer = setTimeout(() => {
        setIsExiting(true);
        exitTimeoutRef.current = setTimeout(() => {
          setIsVisible(false);
          onComplete?.();
        }, ANIMATION_CONFIG.FAST);
      }, ANIMATION_PHYSICS.STEP_CELEBRATION_DURATION_MS);

      return () => {
        clearTimeout(timer);
        if (exitTimeoutRef.current) {
          clearTimeout(exitTimeoutRef.current);
        }
      };
    } else if (show && !shouldAnimate) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, ANIMATION_PHYSICS.REDUCED_MOTION_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [show, shouldAnimate, generateParticles, onComplete]);

  if (!isVisible) return null;

  const progress = Math.round(
    (stepNumber / totalSteps) * COMPONENT_DEFAULTS.PROGRESS.COMPLETE
  );
  const circumference = SVG_ANIMATION.PROGRESS.getCircumference(
    CELEBRATION_COLORS.PROGRESS_CIRCLE.RADIUS
  );

  const announcement = STEP_CELEBRATION_LABELS.ANNOUNCEMENT(
    stepNumber,
    progress
  );

  return (
    <>
      <StatusAnnouncer
        message={announcement}
        triggered={show && !isExiting}
        politeness="polite"
      />
      <div
        className={`
          fixed inset-0 pointer-events-none z-[${Z_INDEX_LAYERS.OVERLAY}]
          flex items-center justify-center
          ${TRANSITION_CLASSES.COLOR_SLOW}
          ${isExiting ? 'opacity-0' : 'opacity-100'}
        `}
        aria-hidden="true"
        role="presentation"
      >
        <div
          className={`
absolute inset-0 ${WHITE_BG_PATTERNS.TRANSPARENT} backdrop-blur-[${STEP_CELEBRATION_TAILWIND.BACKDROP_BLUR}]
          ${TRANSITION_CLASSES.COLOR_SLOW}
          ${isExiting ? 'opacity-0' : 'opacity-100'}
        `}
        />

        <div
          className={`
          relative flex flex-col items-center justify-center
          transform ${TRANSITION_CLASSES.ULTRA_SLOW}
          ${isExiting ? 'scale-90 opacity-0' : 'scale-100 opacity-100'}
        `}
          style={{
            transitionTimingFunction: UI_CONFIG.ANIMATION.EASING.SPRING,
          }}
        >
          {shouldAnimate &&
            particles.map((particle) => (
              <div
                key={particle.id}
                className={STEP_CELEBRATION_PARTICLE}
                style={{
                  transform: `translate(${particle.x}px, ${particle.y}px) rotate(${particle.rotation}deg) scale(${isExiting ? 0 : particle.scale})`,
                  opacity: isExiting
                    ? OPACITY_CONFIG.STEP_CELEBRATION_EXIT
                    : OPACITY_CONFIG.STEP_CELEBRATION_VISIBLE,
                  transition: `all ${ANIMATION_CONFIG.STANDARD}ms ${UI_CONFIG.ANIMATION.EASING.SPRING}`,
                  transitionDelay: `${particle.delay}ms`,
                }}
              />
            ))}

          <div className="relative">
            <svg
              className={`${COMPONENT_CONFIG.STEP_CELEBRATION.CONTAINER_SIZE} -rotate-90`}
              viewBox={`0 0 ${COMPONENT_CONFIG.STEP_CELEBRATION.VIEWBOX_SIZE} ${COMPONENT_CONFIG.STEP_CELEBRATION.VIEWBOX_SIZE}`}
            >
              <circle
                cx={COMPONENT_CONFIG.STEP_CELEBRATION.CIRCLE_CENTER}
                cy={COMPONENT_CONFIG.STEP_CELEBRATION.CIRCLE_CENTER}
                r={CELEBRATION_COLORS.PROGRESS_CIRCLE.RADIUS}
                fill="none"
                stroke={CELEBRATION_COLORS.PROGRESS_CIRCLE.TRACK}
                strokeWidth={
                  COMPONENT_CONFIG.STEP_CELEBRATION.PROGRESS_STROKE_WIDTH
                }
              />
              <circle
                cx={COMPONENT_CONFIG.STEP_CELEBRATION.CIRCLE_CENTER}
                cy={COMPONENT_CONFIG.STEP_CELEBRATION.CIRCLE_CENTER}
                r={CELEBRATION_COLORS.PROGRESS_CIRCLE.RADIUS}
                fill="none"
                stroke={CELEBRATION_COLORS.PROGRESS_CIRCLE.PROGRESS}
                strokeWidth={
                  COMPONENT_CONFIG.STEP_CELEBRATION.PROGRESS_STROKE_WIDTH
                }
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={SVG_ANIMATION.PROGRESS.getDashOffset(
                  circumference,
                  (stepNumber / totalSteps) *
                    COMPONENT_DEFAULTS.PROGRESS.COMPLETE
                )}
                className={`transition-all ${DURATION_TAILWIND[700]} ease-out`}
                style={{
                  filter: `drop-shadow(0 0 6px ${CELEBRATION_COLORS.SHADOWS.DROP_SHADOW})`,
                }}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div
                className={`
                ${STEP_CELEBRATION_CHECKMARK_CONTAINER}
                transform ${TRANSITION_CLASSES.ULTRA_SLOW}
                ${isExiting ? 'scale-50 opacity-0' : 'scale-100 opacity-100'}
              `}
                style={{
                  transitionDelay: ANIMATION_DELAYS.INLINE.SHORT,
                }}
              >
                <svg
                  className={STEP_CELEBRATION_CHECKMARK_ICON}
                  fill="none"
                  viewBox={SVG_VIEWBOX.STANDARD}
                  stroke="currentColor"
                  strokeWidth={SVG_STROKE_WIDTHS.THICK}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                    className={shouldAnimate ? DRAW_CHECK : ''}
                    style={{
                      strokeDasharray: SVG_ANIMATION.CHECKMARK_PATH_LENGTH,
                      strokeDashoffset: isExiting
                        ? SVG_ANIMATION.CHECKMARK_PATH_LENGTH
                        : 0,
                      transition: `stroke-dashoffset ${ANIMATION_DELAYS.INLINE.STANDARD} ease-out`,
                    }}
                  />
                </svg>
              </div>
            </div>

            {shouldAnimate && (
              <>
                <div
                  className={`
                  ${STEP_CELEBRATION_RIPPLE_1}
                  ${isExiting ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}
                `}
                  style={{
                    transition: `all ${ANIMATION_DELAYS.INLINE.RIPPLE} ease-out`,
                  }}
                />
                <div
                  className={`
                  ${STEP_CELEBRATION_RIPPLE_2}
                  ${isExiting ? 'scale-175 opacity-0' : 'scale-100 opacity-100'}
                `}
                  style={{
                    transition: `all ${ANIMATION_DELAYS.INLINE.STEP_TRANSITION} ease-out ${ANIMATION_DELAYS.INLINE.SHORT}`,
                  }}
                />
              </>
            )}
          </div>

          <div
            className={`
            ${STEP_CELEBRATION_TEXT_CONTAINER}
            transform ${TRANSITION_CLASSES.ULTRA_SLOW}
            ${isExiting ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}
          `}
            style={{
              transitionDelay: ANIMATION_DELAYS.INLINE.MEDIUM,
            }}
          >
            <p className={STEP_CELEBRATION_STEP_COMPLETE}>
              {STEP_CELEBRATION_LABELS.STEP_COMPLETE(stepNumber)}
            </p>
            <p className={STEP_CELEBRATION_PROGRESS_COMPLETE}>
              {STEP_CELEBRATION_LABELS.PROGRESS_COMPLETE(progress)}
            </p>
          </div>

          <div
            className={`
              ${STEP_CELEBRATION_PROGRESS_TRACK}
            transform ${TRANSITION_CLASSES.ULTRA_SLOW}
            ${isExiting ? 'scale-x-0 opacity-0' : 'scale-x-100 opacity-100'}
          `}
            style={{
              transitionDelay: ANIMATION_DELAYS.INLINE.LONG,
            }}
          >
            <div
              className={`h-full ${GRADIENT_PATTERNS.PROGRESS_BAR}`}
              style={{
                width: `${progress}%`,
                boxShadow: `0 0 8px ${CELEBRATION_COLORS.SHADOWS.BOX_SHADOW}`,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(StepCelebrationComponent);
