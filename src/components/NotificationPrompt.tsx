'use client';

import React, { useState } from 'react';
import { createLogger } from '@/lib/logger';
import useNotificationPermission from '@/hooks/useNotificationPermission';
export interface NotificationPromptProps {
  /** Custom label for the enable button */
  enableLabel?: string;
  /** Custom label when notifications are enabled */
  enabledLabel?: string;
  /** Custom message explaining the benefit */
  message?: string;
  /** Show dismiss button */
  dismissible?: boolean;
  /** Callback when permission is granted */
  onPermissionGranted?: () => void;
  /** Callback when dismissed */
  onDismiss?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Show as compact banner instead of full card */
  variant?: 'banner' | 'card';
}

const logger = createLogger('NotificationPrompt');

/**
 * NotificationPrompt Component
 *
 * Prompts users to enable browser notifications for engagement.
 * Growth: Critical component for re-engagement and retention.
 * Users who enable notifications have higher return rates.
 *
 * @example
 * <NotificationPrompt
 *   onPermissionGranted={() => analytics.track('notifications_enabled')}
 * />
 */
export default function NotificationPrompt({
  enableLabel = 'Enable Notifications',
  enabledLabel = 'Notifications Enabled',
  message = 'Stay updated with important progress on your ideas!',
  dismissible = true,
  onPermissionGranted,
  onDismiss,
  className = '',
  variant = 'banner',
}: NotificationPromptProps) {
  const { permission, isSupported, isLoading, requestPermission } =
    useNotificationPermission();

  const [isRequesting, setIsRequesting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Don't render if not supported, already granted, or dismissed
  if (!isSupported || permission === 'granted' || dismissed || isLoading) {
    return null;
  }

  // Don't show if explicitly denied (user consciously blocked)
  if (permission === 'denied') {
    return null;
  }

  const handleEnable = async () => {
    setIsRequesting(true);
    try {
      const result = await requestPermission();
      if (result === 'granted') {
        logger.info('User enabled notifications via prompt');
        onPermissionGranted?.();
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
    logger.debug('User dismissed notification prompt');
  };

  const getStatusText = (): string => {
    const perm = permission as string;
    switch (perm) {
      case 'granted':
        return enabledLabel;
      case 'denied':
        return 'Notifications blocked';
      default:
        return enableLabel;
    }
  };

  // Banner variant - compact horizontal layout
  if (variant === 'banner') {
    return (
      <div
        className={`
          bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-100
          rounded-lg px-4 py-3 flex items-center justify-between gap-4
          ${className}
        `}
        role="region"
        aria-label="Notification permission prompt"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <p className="text-sm text-primary-800 truncate">{message}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleEnable}
            disabled={isRequesting}
            className={`
              px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
              bg-primary-600 text-white hover:bg-primary-700
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
              disabled:opacity-50 disabled:cursor-not-allowed
              active:scale-[0.98]
            `}
            aria-label={enableLabel}
          >
            {isRequesting ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Enabling...
              </span>
            ) : (
              getStatusText()
            )}
          </button>

          {dismissible && (
            <button
              onClick={handleDismiss}
              className="p-1 text-primary-400 hover:text-primary-600 transition-colors rounded"
              aria-label="Dismiss notification prompt"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Card variant - larger promotional card
  return (
    <div
      className={`
        bg-gradient-to-br from-primary-50 via-white to-blue-50 rounded-xl
        p-6 border border-primary-100 shadow-sm
        ${className}
      `}
      role="region"
      aria-label="Stay updated with notifications"
    >
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center">
          <svg
            className="w-7 h-7 text-primary-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-primary-900 mb-1">
            Stay in the Loop
          </h3>
          <p className="text-sm text-primary-700 mb-4">{message}</p>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleEnable}
              disabled={isRequesting}
              className={`
                inline-flex items-center justify-center gap-2 px-4 py-2
                text-sm font-medium rounded-lg transition-all duration-200
                bg-primary-600 text-white hover:bg-primary-700
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                focus-visible:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                active:scale-[0.98]
              `}
            >
              {isRequesting ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Enabling...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {getStatusText()}
                </>
              )}
            </button>

            {dismissible && (
              <button
                onClick={handleDismiss}
                className="text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors"
              >
                Maybe later
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

NotificationPrompt.displayName = 'NotificationPrompt';

export { NotificationPrompt };
