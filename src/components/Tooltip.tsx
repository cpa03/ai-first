'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  memo,
} from 'react';
import { ANIMATION_CONFIG, UI_CONFIG } from '@/lib/config/constants';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: TooltipPosition;
  delay?: number;
  disabled?: boolean;
  className?: string;
}

// PERFORMANCE: Memoize Tooltip to prevent re-renders when parent components update
// Tooltip is a wrapper component that may be nested inside frequently updating parents
function TooltipComponent({
  children,
  content,
  position = 'top',
  delay = UI_CONFIG.TOOLTIP_DELAY,
  disabled = false,
  className = '',
}: TooltipProps) {
  const id = useId();
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<number>(0);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const prefersReducedMotion = usePrefersReducedMotion();

  const showTooltip = useCallback(() => {
    if (disabled) return;

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    showTimeoutRef.current = setTimeout(() => {
      setIsMounted(true);
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }, delay);
  }, [delay, disabled]);

  const hideTooltip = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }

    setIsVisible(false);
    hideTimeoutRef.current = setTimeout(() => {
      setIsMounted(false);
    }, ANIMATION_CONFIG.FAST);
  }, []);

  const handleTouchStart = useCallback(() => {
    touchStartRef.current = Date.now();
    touchTimeoutRef.current = setTimeout(() => {
      showTooltip();
    }, UI_CONFIG.TOOLTIP_TOUCH_PRESS_MS);
  }, [showTooltip]);

  const handleTouchEnd = useCallback(() => {
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
    const pressDuration = Date.now() - touchStartRef.current;
    if (pressDuration >= UI_CONFIG.TOOLTIP_TOUCH_PRESS_MS) {
      setTimeout(hideTooltip, UI_CONFIG.TOOLTIP_HIDE_DELAY_MS);
    }
  }, [hideTooltip]);

  const handleTouchMove = useCallback(() => {
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        hideTooltip();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, hideTooltip]);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1 border-t-gray-800',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-gray-800',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1 border-l-gray-800',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1 border-r-gray-800',
  };

  const arrowBorderClasses = {
    top: 'border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent',
    bottom:
      'border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent',
    left: 'border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent',
    right:
      'border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent',
  };

  return (
    <div
      ref={triggerRef}
      className={`relative inline-flex ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      aria-describedby={isMounted ? id : undefined}
    >
      {children}
      {isMounted && (
        <div
          id={id}
          ref={tooltipRef}
          role="tooltip"
          className={`
            absolute z-50 pointer-events-none
            ${positionClasses[position]}
            ${prefersReducedMotion ? '' : 'transition-all duration-200 ease-out'}
            ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `}
        >
          <div className="relative">
            <div
              className={`
                px-2 py-1 bg-gray-800 text-white text-xs font-medium rounded-md
                shadow-lg whitespace-normal
                max-w-[200px] break-words
              `}
            >
              {content}
            </div>
            <div
              className={`
                absolute w-0 h-0
                ${arrowClasses[position]}
                ${arrowBorderClasses[position]}
              `}
              aria-hidden="true"
            />
          </div>
        </div>
      )}
    </div>
  );
}

TooltipComponent.displayName = 'Tooltip';

export default memo(TooltipComponent);
