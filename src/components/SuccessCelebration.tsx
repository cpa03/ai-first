'use client';

import React, { useEffect, useState, useCallback } from 'react';

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

const COLORS = [
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#F59E0B',
  '#EC4899',
  '#06B6D4',
];

const PARTICLE_COUNT = 30;

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
      x: 50 + (Math.random() - 0.5) * 20,
      y: 50 + (Math.random() - 0.5) * 20,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      velocity: {
        x: (Math.random() - 0.5) * 30,
        y: -Math.random() * 25 - 10,
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
      }, duration);

      return () => clearTimeout(timer);
    } else if (show && !shouldAnimate) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [show, shouldAnimate, duration, generateParticles, onComplete]);

  useEffect(() => {
    if (!isVisible || particles.length === 0 || !shouldAnimate) return;

    let animationId: number;
    const gravity = 0.8;
    const friction = 0.98;

    const animate = () => {
      setParticles((prevParticles) =>
        prevParticles
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.velocity.x * 0.5,
            y: particle.y + particle.velocity.y * 0.5,
            velocity: {
              x: particle.velocity.x * friction,
              y: particle.velocity.y * friction + gravity,
            },
            rotation: particle.rotation + particle.velocity.x * 2,
            opacity: particle.opacity - 0.015,
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
