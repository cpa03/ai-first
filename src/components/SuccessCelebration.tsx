'use client';

import { useEffect, useState, useCallback, memo } from 'react';
import {
  CELEBRATION_COLORS,
  ANIMATION_PHYSICS,
  COMPONENT_DEFAULTS,
  SVG_ANIMATION,
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  Z_INDEX_LAYERS,
  TEXT_COLORS,
  RIPPLE_RING_1,
  RIPPLE_RING_2,
  COMPONENT_STATE_COLORS,
  ICON_SIZES,
  SUCCESS_POP,
  SUCCESS_CHECK,
} from '@/lib/config';
import { triggerHapticFeedback } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { RELATIVE } from '@/lib/config/remaining-hardcoded-patterns';
import { SUCCESS_CELEBRATION_LABELS } from '@/lib/config/component-labels';
import StatusAnnouncer from './StatusAnnouncer';

// PERFORMANCE: Flatten particle interface to reduce object allocations per frame
// velocity.x -> vx, velocity.y -> vy
interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  vx: number;
  vy: number;
  opacity: number;
}

interface SuccessCelebrationProps {
  show: boolean;
  onComplete?: () => void;
  duration?: number;
}

const COLORS = CELEBRATION_COLORS.ALL;
const PARTICLE_COUNT = ANIMATION_PHYSICS.PARTICLE_COUNT;

function SuccessCelebrationComponent({
  show,
  onComplete,
  duration = COMPONENT_DEFAULTS.SUCCESS_CELEBRATION.DURATION_MS,
}: SuccessCelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldAnimate = !prefersReducedMotion;

  const generateParticles = useCallback((): Particle[] => {
    const center = ANIMATION_PHYSICS.CENTER_POSITION;
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: center + (Math.random() - 0.5) * ANIMATION_PHYSICS.CENTER_OFFSET,
      y: center + (Math.random() - 0.5) * ANIMATION_PHYSICS.CENTER_OFFSET,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size:
        Math.random() *
          (ANIMATION_PHYSICS.PARTICLE_SIZE.MAX -
            ANIMATION_PHYSICS.PARTICLE_SIZE.MIN) +
        ANIMATION_PHYSICS.PARTICLE_SIZE.MIN,
      rotation: Math.random() * ANIMATION_PHYSICS.FULL_ROTATION_DEGREES,
      vx: (Math.random() - 0.5) * ANIMATION_PHYSICS.MAX_HORIZONTAL_VELOCITY,
      vy:
        -Math.random() * ANIMATION_PHYSICS.MAX_VERTICAL_VELOCITY -
        ANIMATION_PHYSICS.MIN_VERTICAL_BOOST,
      opacity: 1,
    }));
  }, []);

  useEffect(() => {
    if (show && shouldAnimate) {
      setParticles(generateParticles());
      setIsVisible(true);
      triggerHapticFeedback();

      const timer = setTimeout(() => {
        setIsVisible(false);
        setParticles([]);
        onComplete?.();
      }, duration ?? ANIMATION_PHYSICS.DEFAULT_DURATION_MS);

      return () => clearTimeout(timer);
    } else if (show && !shouldAnimate) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, ANIMATION_PHYSICS.REDUCED_MOTION_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [show, shouldAnimate, duration, generateParticles, onComplete]);

  useEffect(() => {
    if (!isVisible || particles.length === 0 || !shouldAnimate) return;

    let animationId: number;

    const animate = () => {
      setParticles((prevParticles) => {
        if (prevParticles.length === 0) return prevParticles;

        // PERFORMANCE: Use single-pass for loop instead of map().filter()
        // This significantly reduces object allocations and array traversals per frame
        const nextParticles: Particle[] = [];
        const {
          VELOCITY_MULTIPLIER,
          FRICTION,
          GRAVITY,
          ROTATION_MULTIPLIER,
          OPACITY_DECAY,
        } = ANIMATION_PHYSICS;

        for (let i = 0; i < prevParticles.length; i++) {
          const p = prevParticles[i];
          const nextOpacity = p.opacity - OPACITY_DECAY;

          if (nextOpacity > 0) {
            nextParticles.push({
              ...p,
              x: p.x + p.vx * VELOCITY_MULTIPLIER,
              y: p.y + p.vy * VELOCITY_MULTIPLIER,
              vx: p.vx * FRICTION,
              vy: p.vy * FRICTION + GRAVITY,
              rotation: p.rotation + p.vx * ROTATION_MULTIPLIER,
              opacity: nextOpacity,
            });
          }
        }
        return nextParticles;
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [isVisible, particles.length, shouldAnimate]);

  if (!isVisible) return null;

  return (
    <>
      <StatusAnnouncer
        message={SUCCESS_CELEBRATION_LABELS.ANNOUNCEMENT}
        triggered={isVisible}
        politeness="polite"
      />
      <div
        className={`fixed inset-0 pointer-events-none z-[${Z_INDEX_LAYERS.CELEBRATION}] flex items-center justify-center`}
        aria-hidden="true"
        role="presentation"
      >
      <div className={RELATIVE}>
        <div
          className={`${ICON_SIZES.MASSIVE} rounded-full ${COMPONENT_STATE_COLORS.CELEBRATION.CIRCLE_BG} flex items-center justify-center shadow-lg ${
            shouldAnimate ? SUCCESS_POP : ''
          }`}
        >
          <svg
            className={`${ICON_SIZES.XXXXL} ${TEXT_COLORS.SUCCESS_DARK} ${
              shouldAnimate ? SUCCESS_CHECK : ''
            }`}
            fill="none"
            viewBox={SVG_VIEWBOX.STANDARD}
            stroke="currentColor"
            strokeWidth={SVG_STROKE_WIDTHS.THICK}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
              style={
                shouldAnimate
                  ? {
                      strokeDasharray: SVG_ANIMATION.CHECKMARK_PATH_LENGTH,
                      strokeDashoffset: 0,
                    }
                  : undefined
              }
            />
          </svg>
        </div>

        {shouldAnimate && (
          <>
            <div
              className={`absolute inset-0 rounded-full border-4 ${COMPONENT_STATE_COLORS.CELEBRATION.RIPPLE_1} ${RIPPLE_RING_1}`}
            />
            <div
              className={`absolute inset-0 rounded-full border-4 ${COMPONENT_STATE_COLORS.CELEBRATION.RIPPLE_2} ${RIPPLE_RING_2}`}
            />
          </>
        )}
      </div>

      {shouldAnimate &&
        particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute ${ICON_SIZES.XS} rounded-sm`}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              backgroundColor: particle.color,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              transform: `rotate(${particle.rotation}deg)`,
              opacity: particle.opacity,
              transition: 'none',
              // PERFORMANCE: Enable GPU acceleration for particle movement
              willChange: 'transform, opacity',
            }}
          />
        ))}
      </div>
    </>
  );
}

export default memo(SuccessCelebrationComponent);
