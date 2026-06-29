'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ANIMATION_CONFIG } from '@/lib/config/constants';
import {
  ALERT_STYLES,
  ALERT_BASE_STYLES,
  COMPONENT_CONFIG,
  COMPONENT_DEFAULTS,
  SVG_STROKE_WIDTHS,
  ALERT_LABELS,
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
  const styles = ALERT_STYLES[type];
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const progressValueRef = useRef(COMPONENT_DEFAULTS.PROGRESS.COMPLETE);
  const prefersReducedMotion = usePrefersReducedMotion();

  const shouldAutoDismiss =
    autoDismiss && (type === 'success' || type === 'info') && onClose;

  const effectiveDelay =
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
  }, []);

  useEffect(() => {
    return cleanupTimers;
  }, [cleanupTimers]);

  useEffect(() => {
    if (!shouldAutoDismiss || isPaused) return;

    const updateInterval = COMPONENT_CONFIG.ALERT.PROGRESS_INTERVAL_MS;
    const totalSteps = effectiveDelay / updateInterval;
    let currentStep = 0;

    progressRef.current = setInterval(() => {
      currentStep++;
      const remainingProgress = Math.max(
        0,
        COMPONENT_DEFAULTS.PROGRESS.COMPLETE -
          (currentStep / totalSteps) * COMPONENT_DEFAULTS.PROGRESS.COMPLETE
      );
      progressValueRef.current = remainingProgress;
      setProgress(remainingProgress);

      if (currentStep >= totalSteps) {
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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        handleClose();
      }
    };

    if (onClose) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [onClose, handleClose]);

  if (!isVisible) return null;

  const visibilityClass = isExiting
    ? ALERT_BASE_STYLES.exiting
    : ALERT_BASE_STYLES.visible;

  const handleMouseEnter = () => {
    if (shouldAutoDismiss) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (shouldAutoDismiss) {
      setIsPaused(false);
    }
  };

  return (
    <div
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={`
        ${styles.container} ${ALERT_BASE_STYLES.container}
        ${ALERT_BASE_STYLES.transition}
        ${visibilityClass}
        ${className}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      <svg
        className={`w-5 h-5 ${styles.iconColor} flex-shrink-0 mt-0.5`}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        {ALERT_ICONS[type]}
      </svg>
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className={`text-lg font-semibold ${styles.titleColor} mb-2`}>
            {title}
          </h3>
        )}
        <div className={styles.textColor}>{children}</div>
      </div>
      {onClose && (
        <Tooltip content="Dismiss alert" position="top">
          <button
            onClick={handleClose}
            className={`${ALERT_BASE_STYLES.closeButton} ${styles.textColor} ${styles.focusRing}`}
            aria-label={ALERT_LABELS.DISMISS_ARIA_LABEL}
            type="button"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
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
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-current opacity-30 transition-all duration-75 ease-linear rounded-b-lg"
          style={{
            width: `${progress}%`,
            transitionDuration: isPaused ? '0ms' : '75ms',
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default React.memo(AlertComponent);
