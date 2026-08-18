'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
  useId,
  memo,
} from 'react';
import {
  ANIMATION_CONFIG,
  UI_CONFIG as UI_CONFIG_CONSTANTS,
} from '@/lib/config/constants';
import {
  UI_CONFIG,
  Z_INDEX_LAYERS,
  CONTAINER_WIDTH_CLASSES,
  TEXT_SIZE_CLASSES,
  TYPOGRAPHY_CLASSES,
  TEXT_COLORS,
  BG_COLORS,
  BORDER_COLOR_CLASSES,
  DURATION_TAILWIND,
  TOOLTIP_CONFIG,
} from '@/lib/config';

const VIEWPORT_PADDING = TOOLTIP_CONFIG.VIEWPORT_PADDING;
const TRIGGER_SPACING = TOOLTIP_CONFIG.TRIGGER_SPACING;
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { PLATFORM } from '@/lib/dom-utils';
import { RELATIVE } from '@/lib/config/remaining-hardcoded-patterns';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  /** Optional keyboard shortcut keys to display in the tooltip (e.g. ['⌘', 'C']) */
  shortcut?: string[];
  position?: TooltipPosition;
  delay?: number;
  disabled?: boolean;
  className?: string;
}

function getOppositePosition(pos: TooltipPosition): TooltipPosition {
  const opposites: Record<TooltipPosition, TooltipPosition> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  };
  return opposites[pos];
}

function hasEnoughSpace(
  triggerRect: DOMRect,
  position: TooltipPosition,
  tooltipWidth: number,
  tooltipHeight: number
): boolean {
  const { top, bottom, left, right } = triggerRect;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  switch (position) {
    case 'top':
      return top - tooltipHeight - TRIGGER_SPACING >= VIEWPORT_PADDING;
    case 'bottom':
      return (
        bottom + tooltipHeight + TRIGGER_SPACING <=
        viewportHeight - VIEWPORT_PADDING
      );
    case 'left':
      return left - tooltipWidth - TRIGGER_SPACING >= VIEWPORT_PADDING;
    case 'right':
      return (
        right + tooltipWidth + TRIGGER_SPACING <=
        viewportWidth - VIEWPORT_PADDING
      );
    default:
      return true;
  }
}

// PERFORMANCE: Memoize Tooltip to prevent re-renders when parent components update
// Tooltip is a wrapper component that may be nested inside frequently updating parents
function TooltipComponent({
  children,
  content,
  shortcut,
  position: requestedPosition = 'top',
  delay = UI_CONFIG_CONSTANTS.TOOLTIP_DELAY,
  disabled = false,
  className = '',
}: TooltipProps) {
  const id = useId();
  const [isVisible, setIsVisible] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [computedPosition, setComputedPosition] =
    useState<TooltipPosition>(requestedPosition);
  const [horizontalOffset, setHorizontalOffset] = useState(0);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<number>(0);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    if (!isMounted || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipEl = tooltipRef.current;
    const tooltipRect = tooltipEl.getBoundingClientRect();

    let bestPosition = requestedPosition;

    if (
      !hasEnoughSpace(
        triggerRect,
        requestedPosition,
        tooltipRect.width,
        tooltipRect.height
      )
    ) {
      const opposite = getOppositePosition(requestedPosition);
      if (
        hasEnoughSpace(
          triggerRect,
          opposite,
          tooltipRect.width,
          tooltipRect.height
        )
      ) {
        bestPosition = opposite;
      }
    }

    setComputedPosition(bestPosition);

    if (bestPosition === 'top' || bestPosition === 'bottom') {
      const triggerCenter = triggerRect.left + triggerRect.width / 2;
      const tooltipHalfWidth = tooltipRect.width / 2;
      const viewportWidth = window.innerWidth;

      let offset = 0;
      if (triggerCenter - tooltipHalfWidth < VIEWPORT_PADDING) {
        offset = -(triggerCenter - tooltipHalfWidth - VIEWPORT_PADDING);
      } else if (
        triggerCenter + tooltipHalfWidth >
        viewportWidth - VIEWPORT_PADDING
      ) {
        offset =
          viewportWidth - VIEWPORT_PADDING - (triggerCenter + tooltipHalfWidth);
      }
      setHorizontalOffset(offset);
    } else {
      setHorizontalOffset(0);
    }
  }, [isMounted, requestedPosition]);

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
    }, UI_CONFIG_CONSTANTS.TOOLTIP_TOUCH_PRESS_MS);
  }, [showTooltip]);

  const handleTouchEnd = useCallback(() => {
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
    const pressDuration = Date.now() - touchStartRef.current;
    if (pressDuration >= UI_CONFIG_CONSTANTS.TOOLTIP_TOUCH_PRESS_MS) {
      setTimeout(hideTooltip, UI_CONFIG_CONSTANTS.TOOLTIP_HIDE_DELAY_MS);
    }
  }, [hideTooltip]);

  const handleTouchMove = useCallback(() => {
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    setIsMac(PLATFORM.isMac());

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
    top: `top-full left-1/2 -translate-x-1/2 -mt-1 border-t-${TOOLTIP_CONFIG.ARROW.BORDER_COLOR_NAME}`,
    bottom: `bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-${TOOLTIP_CONFIG.ARROW.BORDER_COLOR_NAME}`,
    left: `left-full top-1/2 -translate-y-1/2 -ml-1 border-l-${TOOLTIP_CONFIG.ARROW.BORDER_COLOR_NAME}`,
    right: `right-full top-1/2 -translate-y-1/2 -mr-1 border-r-${TOOLTIP_CONFIG.ARROW.BORDER_COLOR_NAME}`,
  };

  const arrowBorderClasses = {
    top: `${TOOLTIP_CONFIG.ARROW.BORDER_SIZE} border-t-4 ${TOOLTIP_CONFIG.ARROW.TRANSPARENT.TOP_BOTTOM}`,
    bottom: `${TOOLTIP_CONFIG.ARROW.BORDER_SIZE} border-b-4 ${TOOLTIP_CONFIG.ARROW.TRANSPARENT.TOP_BOTTOM}`,
    left: `border-t-4 border-b-4 border-l-4 ${TOOLTIP_CONFIG.ARROW.TRANSPARENT.LEFT_RIGHT}`,
    right: `border-t-4 border-b-4 border-r-4 ${TOOLTIP_CONFIG.ARROW.TRANSPARENT.LEFT_RIGHT}`,
  };

  const tooltipStyle: React.CSSProperties = {
    zIndex: Z_INDEX_LAYERS.TOAST,
    ...(horizontalOffset !== 0
      ? { transform: `translateX(calc(-50% + ${horizontalOffset}px))` }
      : {}),
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
      aria-describedby={isVisible ? id : undefined}
    >
      {children}
      {isMounted && (
        <div
          id={id}
          ref={tooltipRef}
          role="tooltip"
          className={`
            absolute pointer-events-none
            ${positionClasses[computedPosition]}
            ${prefersReducedMotion ? '' : `transition-all ${DURATION_TAILWIND[200]} ease-out`}
            ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `}
          style={tooltipStyle}
        >
          <div className={RELATIVE}>
            <div
              className={`
                ${TOOLTIP_CONFIG.CONTENT_PADDING} ${BG_COLORS.DARKER} text-white text-xs font-medium rounded-md
                shadow-lg border ${BORDER_COLOR_CLASSES.MUTED_DARK}/50 whitespace-normal
                w-max ${CONTAINER_WIDTH_CLASSES.TOOLTIP} break-words
                flex items-center ${TOOLTIP_CONFIG.CONTENT_GAP}
              `}
            >
              {content && <span>{content}</span>}
              {shortcut && shortcut.length > 0 && (
                <div
                  className={`flex items-center ${TOOLTIP_CONFIG.SHORTCUT_GAP} ${TOOLTIP_CONFIG.SHORTCUT_SECTION} ${
                    content ? `border-l ${BORDER_COLOR_CLASSES.MUTED_DARK}` : ''
                  }`}
                >
                  {shortcut.map((key, i) => (
                    <React.Fragment key={i}>
                      <kbd
                        className={`${UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_DARK} ${TEXT_SIZE_CLASSES.XS}`}
                      >
                        {key === '⌘' ? (isMac ? '⌘' : 'Ctrl') : key}
                      </kbd>
                      {i < shortcut.length - 1 && (
                        <span
                          className={`${TEXT_SIZE_CLASSES.XS} ${TEXT_COLORS.MUTED_LIGHT} ${TYPOGRAPHY_CLASSES.BOLD}`}
                        >
                          +
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
            <div
              className={`
                absolute w-0 h-0
                ${arrowClasses[computedPosition]}
                ${arrowBorderClasses[computedPosition]}
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
