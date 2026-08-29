'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ANIMATION_CONFIG } from '@/lib/config/constants';
import {
  ALERT_STYLES,
  ALERT_BASE_STYLES,
  COMPONENT_CONFIG,
  COMPONENT_DEFAULTS,
  SVG_STROKE_WIDTHS,
  SVG_SIZES,
  SVG_VIEWBOX,
  ALERT_LABELS,
  DURATION_TAILWIND,
  TIME_CONVERSIONS,
  MT_CLASSES,
  MB_CLASSES,
  GAP_CLASSES,
  ICON_SIZES,
  GRAY_CLASSES,
  TEXT_SIZE_CLASSES,
  FOCUS_RING_OFFSET_PATTERNS,
  COORDINATE_POSITION_PATTERNS,
  COMMON_SPACING_PATTERNS,
  HEIGHT_ONLY,
  FLEX_GROW_PATTERNS,
  TOAST_DISMISS_BUTTON,
  TYPOGRAPHY_CLASSES,
} from '@/lib/config';
import { triggerHapticFeedback } from '@/lib/utils';
import Tooltip from './Tooltip';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface AlertProps {
  type: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
  /** Auto-dismiss after delay (only for success and info alerts) */
  autoDismiss?: boolean;
  /** Delay in ms before auto-dismiss (default: 5000ms for success, 3000ms for info) */
  dismissDelay?: number;
}

const ALERT_ICONS = {
  error: (
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
      clipRule="evenodd"
    />
  ),
  warning: (
    <path
      fillRule="evenodd"
      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  ),
  info: (
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
      clipRule="evenodd"
    />
  ),
  success: (
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  ),
} as const;

const ALERT_DISMISS_DELAYS: Record<string, number> = {
  success: COMPONENT_CONFIG.ALERT.SUCCESS_DISMISS_MS,
  info: COMPONENT_CONFIG.ALERT.INFO_DISMISS_MS,
};

const AlertComponent = function Alert({
  type,
  title,
  children,
  className = '',
  onClose,
  autoDismiss = false,
  dismissDelay,
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(
    COMPONENT_DEFAULTS.PROGRESS.COMPLETE
  );
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [currentDelay, setCurrentDelay] = useState<number | null>(null);
  // Micro-UX: Briefly show keyboard shortcut hints when alert appears
  // Helps users discover shortcuts (d=dismiss, s=snooze) without cluttering UI
  const [showShortcutHint, setShowShortcutHint] = useState(false);
  const shortcutHintTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const styles = ALERT_STYLES[type];
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const progressValueRef = useRef(COMPONENT_DEFAULTS.PROGRESS.COMPLETE);
  const currentStepRef = useRef(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  const shouldAutoDismiss =
    autoDismiss && (type === 'success' || type === 'info') && onClose;

  const effectiveDelay =
    currentDelay ??
    dismissDelay ??
    ALERT_DISMISS_DELAYS[type] ??
    COMPONENT_CONFIG.ALERT.DEFAULT_DISMISS_MS;

  const cleanupTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
    if (shortcutHintTimeoutRef.current) {
      clearTimeout(shortcutHintTimeoutRef.current);
      shortcutHintTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanupTimers;
  }, [cleanupTimers]);

  useEffect(() => {
    if (!shouldAutoDismiss || isPaused) return;

    const updateInterval = COMPONENT_CONFIG.ALERT.PROGRESS_INTERVAL_MS;
    const totalSteps = effectiveDelay / updateInterval;

    // Micro-UX: Initialize countdown display with remaining seconds
    setRemainingSeconds(
      Math.ceil(effectiveDelay / TIME_CONVERSIONS.MS_PER_SECOND)
    );

    progressRef.current = setInterval(() => {
      currentStepRef.current++;
      const remainingProgress = Math.max(
        0,
        COMPONENT_DEFAULTS.PROGRESS.COMPLETE -
          (currentStepRef.current / totalSteps) *
            COMPONENT_DEFAULTS.PROGRESS.COMPLETE
      );
      progressValueRef.current = remainingProgress;
      setProgress(remainingProgress);

      // Micro-UX: Update countdown display every second for user feedback
      const elapsedMs = currentStepRef.current * updateInterval;
      const remainingMs = Math.max(0, effectiveDelay - elapsedMs);
      setRemainingSeconds(
        Math.ceil(remainingMs / TIME_CONVERSIONS.MS_PER_SECOND)
      );

      if (currentStepRef.current >= totalSteps) {
        cleanupTimers();
        setIsExiting(true);
        timeoutRef.current = setTimeout(() => {
          setIsVisible(false);
          onClose?.();
        }, ANIMATION_CONFIG.ALERT_EXIT);
      }
    }, updateInterval);

    return cleanupTimers;
  }, [shouldAutoDismiss, isPaused, effectiveDelay, cleanupTimers, onClose]);

  const handleClose = useCallback(() => {
    cleanupTimers();
    triggerHapticFeedback();
    setIsExiting(true);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, ANIMATION_CONFIG.ALERT_EXIT);
  }, [cleanupTimers, onClose]);

  const handleSnooze = useCallback(() => {
    triggerHapticFeedback();
    cleanupTimers();
    currentStepRef.current = 0;
    setCurrentDelay(
      (prev) =>
        (prev ?? effectiveDelay) + COMPONENT_CONFIG.ALERT.SNOOZE_DURATION_MS
    );
    setProgress(COMPONENT_DEFAULTS.PROGRESS.COMPLETE);
  }, [cleanupTimers, effectiveDelay]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        e.preventDefault();
        handleClose();
      }
      if (e.key === 's' && shouldAutoDismiss) {
        e.preventDefault();
        handleSnooze();
      }
      if (e.key === 'd' && onClose) {
        e.preventDefault();
        handleClose();
      }
    },
    [handleClose, handleSnooze, shouldAutoDismiss, onClose]
  );

  if (!isVisible) return null;

  const visibilityClass = isExiting
    ? ALERT_BASE_STYLES.exiting
    : ALERT_BASE_STYLES.visible;

  const handleMouseEnter = () => {
    if (shouldAutoDismiss) {
      setIsPaused(true);
    }
    // Micro-UX: Show keyboard shortcut hints when alert is hovered
    // Helps users discover shortcuts without cluttering the UI permanently
    if (onClose) {
      setShowShortcutHint(true);
    }
  };

  const handleMouseLeave = () => {
    if (shouldAutoDismiss) {
      setIsPaused(false);
    }
    // Micro-UX: Hide keyboard shortcut hints when mouse leaves
    if (onClose) {
      setShowShortcutHint(false);
    }
  };

  const handleFocus = () => {
    if (shouldAutoDismiss) {
      setIsPaused(true);
    }
    // Micro-UX: Show keyboard shortcut hints when alert is focused
    // Critical for keyboard-only users to discover shortcuts (d=dismiss, s=snooze)
    if (onClose) {
      setShowShortcutHint(true);
    }
  };

  const handleBlur = () => {
    if (shouldAutoDismiss) {
      setIsPaused(false);
    }
    // Micro-UX: Hide keyboard shortcut hints when focus leaves
    if (onClose) {
      setShowShortcutHint(false);
    }
  };

  return (
    <div
      role="alert"
      tabIndex={0}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-label={`${type} alert.${shouldAutoDismiss ? ` ${ALERT_LABELS.SNOOZE_SHORTCUT_HINT}.` : ''}${onClose ? ` ${ALERT_LABELS.DISMISS_SHORTCUT_HINT}` : ''}`}
      className={`
        ${styles.container} ${ALERT_BASE_STYLES.container}
        ${ALERT_BASE_STYLES.transition}
        ${visibilityClass}
        ${FOCUS_RING_OFFSET_PATTERNS.FOCUS}
        ${className}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      <svg
        className={`${SVG_SIZES.LG} ${styles.iconColor} flex-shrink-0 ${MT_CLASSES.XS}`}
        fill="currentColor"
        viewBox={SVG_VIEWBOX.SMALL}
        aria-hidden="true"
      >
        {ALERT_ICONS[type]}
      </svg>
      <div className={FLEX_GROW_PATTERNS.GROW}>
        {title && (
          <h3
            className={`${TYPOGRAPHY_CLASSES.LG_SEMIBOLD} ${styles.titleColor} ${MB_CLASSES.MD}`}
          >
            {title}
          </h3>
        )}
        <div className={styles.textColor}>{children}</div>
      </div>
      {onClose && (
        <Tooltip content={ALERT_LABELS.DISMISS_TOOLTIP} position="top">
          <button
            onClick={handleClose}
            className={`${ALERT_BASE_STYLES.closeButton} ${styles.textColor} ${styles.focusRing}`}
            aria-label={ALERT_LABELS.DISMISS_ARIA_LABEL}
            type="button"
          >
            <svg
              className={SVG_SIZES.MD}
              fill="none"
              viewBox={SVG_VIEWBOX.STANDARD}
              stroke="currentColor"
              strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </Tooltip>
      )}
      {shouldAutoDismiss && !prefersReducedMotion && (
        <>
          <div
            className={`absolute bottom-0 left-0 ${HEIGHT_ONLY.XXS} bg-current opacity-30 transition-all ${DURATION_TAILWIND[75]} ease-linear rounded-b-lg`}
            style={{
              width: `${progress}%`,
              transitionDuration: isPaused
                ? '0ms'
                : `${ANIMATION_CONFIG.PROGRESS.TRANSITION}ms`,
            }}
            aria-hidden="true"
          />
          {/* Micro-UX: Pause icon overlay on progress bar when countdown is paused */}
          {/* Provides immediate visual feedback that the auto-dismiss timer is paused */}
          {isPaused && (
            <div
              className={`absolute bottom-0 left-0 ${HEIGHT_ONLY.XS} flex items-center justify-center transition-opacity ${DURATION_TAILWIND[200]}`}
              style={{ width: `${progress}%` }}
              aria-hidden="true"
            >
              <svg
                className="w-2.5 h-2.5 text-current opacity-70"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            </div>
          )}
          <div
            className={`${COORDINATE_POSITION_PATTERNS.BOTTOM_RIGHT_SM} ${COMMON_SPACING_PATTERNS.FLEX_CENTER_SM}`}
            aria-live="polite"
            aria-atomic="true"
          >
            {remainingSeconds > 0 && (
              <span className={TOAST_DISMISS_BUTTON}>
                {isPaused ? (
                  <span
                    className={`flex items-center ${GAP_CLASSES.SM} motion-safe:animate-pulse`}
                  >
                    <svg
                      className={ICON_SIZES.SM}
                      fill="currentColor"
                      viewBox={SVG_VIEWBOX.SMALL}
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {ALERT_LABELS.PAUSED_LABEL}
                  </span>
                ) : (
                  `${remainingSeconds}s`
                )}
              </span>
            )}
            <button
              onClick={handleSnooze}
              className={`${TYPOGRAPHY_CLASSES.XS_MEDIUM} opacity-50 hover:opacity-100 transition-opacity p-0.5 rounded ${FOCUS_RING_OFFSET_PATTERNS.SUBTLE}`}
              aria-label={ALERT_LABELS.SNOOZE_ARIA_LABEL}
              type="button"
            >
              +
              {COMPONENT_CONFIG.ALERT.SNOOZE_DURATION_MS /
                TIME_CONVERSIONS.MS_PER_SECOND}
              s
            </button>
          </div>
        </>
      )}
      {onClose && (
        <div
          className={`${COORDINATE_POSITION_PATTERNS.BOTTOM_LEFT_SM} flex items-center gap-2 text-xs ${showShortcutHint ? 'opacity-60' : 'opacity-0'} focus-within:opacity-60 hover:opacity-60 transition-opacity`}
          aria-hidden="true"
        >
          {shouldAutoDismiss && (
            <span className={COMMON_SPACING_PATTERNS.FLEX_CENTER_SM}>
              <kbd
                className={`px-1 py-0.5 ${GRAY_CLASSES.BG_200_50} rounded ${TEXT_SIZE_CLASSES.XS} font-mono`}
              >
                s
              </kbd>
              <span>snooze</span>
            </span>
          )}
          <span className={COMMON_SPACING_PATTERNS.FLEX_CENTER_XS}>
            <kbd
              className={`px-1 py-0.5 ${GRAY_CLASSES.BG_200_50} rounded ${TEXT_SIZE_CLASSES.XS} font-mono`}
            >
              d
            </kbd>
            <span>dismiss</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default React.memo(AlertComponent);
