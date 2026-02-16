'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { CELEBRATION_COLORS, ANIMATION_PHYSICS } from '@/lib/config';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocity: { x: number; y: number };
  opacity: number;
}

interface SuccessCelebrationProps {
  show: boolean;
  onComplete?: () => void;
  duration?: number;
}

const COLORS = CELEBRATION_COLORS.ALL;
const PARTICLE_COUNT = ANIMATION_PHYSICS.PARTICLE_COUNT;

export default function SuccessCelebration({
  show,
  onComplete,
  duration = 2000,
}: SuccessCelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldAnimate(!mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setShouldAnimate(!e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

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
      velocity: {
        x: (Math.random() - 0.5) * ANIMATION_PHYSICS.MAX_HORIZONTAL_VELOCITY,
        y:
          -Math.random() * ANIMATION_PHYSICS.MAX_VERTICAL_VELOCITY -
          ANIMATION_PHYSICS.MIN_VERTICAL_BOOST,
      },
      opacity: 1,
    }));
  }, []);

  useEffect(() => {
    if (show && shouldAnimate) {
      setParticles(generateParticles());
      setIsVisible(true);

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
      setParticles((prevParticles) =>
        prevParticles
          .map((particle) => ({
            ...particle,
            x:
              particle.x +
              particle.velocity.x * ANIMATION_PHYSICS.VELOCITY_MULTIPLIER,
            y:
              particle.y +
              particle.velocity.y * ANIMATION_PHYSICS.VELOCITY_MULTIPLIER,
            velocity: {
              x: particle.velocity.x * ANIMATION_PHYSICS.FRICTION,
              y:
                particle.velocity.y * ANIMATION_PHYSICS.FRICTION +
                ANIMATION_PHYSICS.GRAVITY,
            },
            rotation:
              particle.rotation +
              particle.velocity.x * ANIMATION_PHYSICS.ROTATION_MULTIPLIER,
            opacity: particle.opacity - ANIMATION_PHYSICS.OPACITY_DECAY,
          }))
          .filter((p) => p.opacity > 0)
      );

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [isVisible, particles.length, shouldAnimate]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
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
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
              style={
                shouldAnimate
                  ? {
                      strokeDasharray: 24,
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
            }}
          />
        ))}
    </div>
  );
}
