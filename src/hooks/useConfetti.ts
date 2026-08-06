'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { CONFETTI_COLORS, COMPONENT_CONFIG } from '@/lib/config';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export interface ConfettiParticle {
  id: string;
  x: number;
  y: number;
  color: string;
  delay: number;
  size: number;
}

/**
 * Module-level auto-incrementing counter for generating high-performance unique
 * IDs for transient UI visual assets (e.g. confetti particles) without the heavy
 * CPU/entropy overhead of cryptographically secure ID generation (such as `generateId()`).
 */
let confettiIdCounter = 0;

/**
 * useConfetti Hook
 *
 * Manages a local burst of confetti particles for UI delight.
 * Follows the visual pattern established in CopyButton.
 *
 * Features:
 * - Respects prefers-reduced-motion
 * - Automatic cleanup of particles
 * - Highly customizable via centralized config
 */
export function useConfetti() {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const confettiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    return () => {
      if (confettiTimeoutRef.current) {
        clearTimeout(confettiTimeoutRef.current);
      }
    };
  }, []);

  const fire = useCallback(() => {
    if (prefersReducedMotion) return;

    if (confettiTimeoutRef.current) {
      clearTimeout(confettiTimeoutRef.current);
    }

    const newParticles: ConfettiParticle[] = [];
    const particleCount = CONFETTI_COLORS.PARTICLE_COUNT;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance =
        CONFETTI_COLORS.MIN_DISTANCE +
        Math.random() * CONFETTI_COLORS.MAX_DISTANCE_VARIANCE;
      const size =
        CONFETTI_COLORS.MIN_SIZE +
        Math.random() * CONFETTI_COLORS.MAX_SIZE_VARIANCE;

      // PERFORMANCE (⚡ Bolt): Use an incrementing counter instead of `generateId()`
      // to avoid expensive cryptographic random UUID generation overhead during animation triggers.
      newParticles.push({
        id: `confetti-${Date.now()}-${i}-${confettiIdCounter++}`,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        color: CONFETTI_COLORS.PRIMARY[i % CONFETTI_COLORS.PRIMARY.length],
        delay: i * CONFETTI_COLORS.PARTICLE_DELAY_MS,
        size,
      });
    }

    setParticles(newParticles);

    confettiTimeoutRef.current = setTimeout(
      () => setParticles([]),
      COMPONENT_CONFIG.CONFETTI.CLEANUP_MS
    );
  }, [prefersReducedMotion]);

  return { particles, fire };
}
