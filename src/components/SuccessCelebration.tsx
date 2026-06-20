'use client';

import {
  useEffect,
  useState,
  useCallback,
  memo,
  useSyncExternalStore,
} from 'react';
import {
  CELEBRATION_COLORS,
  ANIMATION_PHYSICS,
  COMPONENT_DEFAULTS,
  SVG_ANIMATION,
  SVG_STROKE_WIDTHS,
  Z_INDEX_LAYERS,
} from '@/lib/config';
import { triggerHapticFeedback } from '@/lib/utils';

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

// PERFORMANCE: Centralized reduced motion detection using useSyncExternalStore
// This avoids redundant useState/useEffect cycles across components
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
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * ANIMATION_PHYSICS.CENTER_OFFSET,
      y: 50 + (Math.random() - 0.5) * ANIMATION_PHYSICS.CENTER_OFFSET,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size:
        Math.random() *
          (ANIMATION_PHYSICS.PARTICLE_SIZE.MAX -
            ANIMATION_PHYSICS.PARTICLE_SIZE.MIN) +
        ANIMATION_PHYSICS.PARTICLE_SIZE.MIN,
      rotation: Math.random() * 360,
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
    <div
      className={`fixed inset-0 pointer-events-none z-[${Z_INDEX_LAYERS.CELEBRATION}] flex items-center justify-center`}
      aria-hidden="true"
      role="presentation"
    >
      <div className="relative">
        <div
          className={`w-24 h-24 rounded-full bg-green-100 flex items-center justify-center shadow-lg ${
            shouldAnimate ? 'animate-success-pop' : ''
          }`}
        >
          <svg
            className={`w-12 h-12 text-green-600 ${
              shouldAnimate ? 'animate-success-check' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
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
            <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ripple-ring-1" />
            <div className="absolute inset-0 rounded-full border-4 border-green-300 animate-ripple-ring-2" />
          </>
        )}
      </div>

      {shouldAnimate &&
        particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 rounded-sm"
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
  );
}

export default memo(SuccessCelebrationComponent);
