'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface AlertProps {
  type: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

const EXIT_ANIMATION_DURATION_MS = 200;

const alertStyles = {
  error: {
    container: 'bg-red-50 border-red-200',
    iconColor: 'text-red-600',
    titleColor: 'text-red-900',
    textColor: 'text-red-800',
    subtextColor: 'text-red-600',
    icon: (
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    ),
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200',
    iconColor: 'text-yellow-600',
    titleColor: 'text-yellow-900',
    textColor: 'text-yellow-800',
    subtextColor: 'text-yellow-600',
    icon: (
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    ),
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-900',
    textColor: 'text-blue-800',
    subtextColor: 'text-blue-600',
    icon: (
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    ),
  },
  success: {
    container: 'bg-green-50 border-green-200',
    iconColor: 'text-green-600',
    titleColor: 'text-green-900',
    textColor: 'text-green-800',
    subtextColor: 'text-green-600',
    icon: (
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    ),
  },
};

const AlertComponent = function Alert({
  type,
  title,
  children,
  className = '',
  onClose,
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const styles = alertStyles[type];

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, EXIT_ANIMATION_DURATION_MS);
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

  return (
    <div
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={`
        ${styles.container} border rounded-lg p-4 flex items-start gap-3
        transition-all duration-200 ease-out
        ${isExiting ? 'opacity-0 scale-[0.98] translate-y-[-8px]' : 'opacity-100 scale-100 translate-y-0'}
        motion-reduce:transition-none
        ${className}
      `}
    >
      <svg
        className={`w-5 h-5 ${styles.iconColor} flex-shrink-0 mt-0.5`}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        {styles.icon}
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
        <button
          onClick={handleClose}
          className={`flex-shrink-0 ml-2 ${styles.textColor} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-md p-1 min-h-[32px] min-w-[32px] transition-opacity`}
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
      )}
    </div>
  );
};

export default React.memo(AlertComponent);
