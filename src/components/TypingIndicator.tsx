'use client';

import { memo, useEffect, useState, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface TypingIndicatorProps {
  /** Whether the user is currently typing */
  isTyping: boolean;
  /** Delay in ms before the indicator disappears after typing stops */
  hideDelay?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TypingIndicator - Micro-UX component that provides visual feedback
 * when the user is actively typing.
 *
 * Shows animated dots that pulse when typing is active,
 * providing delightful visual confirmation that input is being registered.
 *
 * Accessibility:
 * - Respects prefers-reduced-motion
 * - Uses aria-hidden since it's purely decorative
 * - Fades out smoothly for screen readers
 */
function TypingIndicatorComponent({
  isTyping,
  hideDelay = 300,
  className = '',
}: TypingIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle typing state changes
  useEffect(() => {
    if (isTyping) {
      // Show immediately when typing starts
      setIsVisible(true);
      setIsAnimating(true);

      // Clear any pending hide timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } else {
      // Start hiding after delay when typing stops
      setIsAnimating(false);
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, hideDelay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isTyping, hideDelay]);

  // Don't render anything if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      aria-hidden="true"
    >
      {/* Animated dots */}
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className={`
            w-1.5 h-1.5 rounded-full bg-primary-400
            transition-opacity duration-200
            ${isAnimating && !prefersReducedMotion ? 'animate-typing-dot' : 'opacity-40'}
          `}
          style={{
            animationDelay: `${index * 150}ms`,
          }}
        />
      ))}
      {/* Screen reader text for accessibility */}
      <span className="sr-only">Typing</span>
    </div>
  );
}

TypingIndicatorComponent.displayName = 'TypingIndicator';

export default memo(TypingIndicatorComponent);
