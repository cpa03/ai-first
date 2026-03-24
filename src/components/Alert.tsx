'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ANIMATION_CONFIG } from '@/lib/config/constants';
import { ALERT_STYLES, ALERT_BASE_STYLES } from '@/lib/config';
import Tooltip from './Tooltip';

interface AlertProps {
  type: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
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

const AlertComponent = function Alert({
  type,
  title,
  children,
  className = '',
  onClose,
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const styles = ALERT_STYLES[type];

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, ANIMATION_CONFIG.ALERT_EXIT);
  }, [onClose]);

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
        <Tooltip content="Dismiss alert" position="top" className="flex-shrink-0">
          <button
            onClick={handleClose}
            className={`${ALERT_BASE_STYLES.closeButton} ${styles.textColor} ${styles.focusRing}`}
            aria-label="Dismiss alert"
            type="button"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
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
    </div>
  );
};

export default React.memo(AlertComponent);
