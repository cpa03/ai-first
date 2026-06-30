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
  Z_INDEX_LAYERS,
  COMPONENT_CONFIG,
  UI_CONFIG,
  OPACITY_CONFIG,
  STEP_CELEBRATION_LABELS,
  GRADIENT_PATTERNS,
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
      rotation: (i / count) * 360,
      scale: 0.5 + Math.random() * 0.5,
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
          transition-opacity duration-300
          ${isExiting ? 'opacity-0' : 'opacity-100'}
        `}
        aria-hidden="true"
        role="presentation"
      >
        <div
          className={`
          absolute inset-0 bg-white/30 backdrop-blur-[2px]
          transition-opacity duration-300
          ${isExiting ? 'opacity-0' : 'opacity-100'}
        `}
        />

        <div
          className={`
          relative flex flex-col items-center justify-center
          transform transition-all duration-500
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
                className="absolute w-2 h-2 rounded-full bg-primary-500"
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
                className="transition-all duration-700 ease-out"
                style={{
                  filter: `drop-shadow(0 0 6px ${CELEBRATION_COLORS.SHADOWS.DROP_SHADOW})`,
                }}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div
                className={`
                w-10 h-10 rounded-full bg-green-500 flex items-center justify-center
                shadow-lg shadow-green-500/30
                transform transition-all duration-500
                ${isExiting ? 'scale-50 opacity-0' : 'scale-100 opacity-100'}
              `}
                style={{
                  transitionDelay: ANIMATION_DELAYS.INLINE.SHORT,
                }}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={SVG_STROKE_WIDTHS.THICK}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                    className={shouldAnimate ? 'animate-draw-check' : ''}
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
                  absolute inset-0 rounded-full border-4 border-primary-400/30
                  ${isExiting ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}
                `}
                  style={{
                    transition: `all ${ANIMATION_DELAYS.INLINE.RIPPLE} ease-out`,
                  }}
                />
                <div
                  className={`
                  absolute inset-0 rounded-full border-4 border-primary-400/20
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
            mt-4 text-center
            transform transition-all duration-500
            ${isExiting ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}
          `}
            style={{
              transitionDelay: ANIMATION_DELAYS.INLINE.MEDIUM,
            }}
          >
            <p className="text-lg font-bold text-gray-900">
              {STEP_CELEBRATION_LABELS.STEP_COMPLETE(stepNumber)}
            </p>
            <p className="text-sm font-medium text-primary-600 mt-1">
              {STEP_CELEBRATION_LABELS.PROGRESS_COMPLETE(progress)}
            </p>
          </div>

          <div
            className={`
            mt-3 w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden
            transform transition-all duration-500
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
