'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface ScrollToTopProps {
  showAt?: number;
  smooth?: boolean;
  className?: string;
}

export default function ScrollToTop({
  showAt = 400,
  smooth = true,
  className = '',
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleVisibility = useCallback(() => {
    if (window.scrollY > showAt) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [showAt]);

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [toggleVisibility]);

  const scrollToTop = useCallback(() => {
    if (prefersReducedMotion) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({
        top: 0,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, [smooth, prefersReducedMotion]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        scrollToTop();
      }
    },
    [scrollToTop]
  );

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      onKeyDown={handleKeyDown}
      className={`
        fixed bottom-8 right-8 z-50
        w-12 h-12
        flex items-center justify-center
        bg-white text-gray-700
        rounded-full shadow-lg
        border border-gray-200
        transition-all duration-300 ease-out
        hover:bg-gray-50 hover:text-primary-600 hover:shadow-xl hover:scale-110
        hover:border-primary-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
        active:scale-95
        ${prefersReducedMotion ? '' : 'animate-in fade-in slide-in-from-bottom-4 duration-300'}
        ${className}
      `}
      aria-label="Scroll to top of page"
      aria-live="polite"
      type="button"
    >
      <svg
        className={`
          w-6 h-6 transition-transform duration-200
          ${prefersReducedMotion ? '' : 'group-hover:-translate-y-0.5'}
        `}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>

      <span className="sr-only">Back to top</span>
    </button>
  );
}
