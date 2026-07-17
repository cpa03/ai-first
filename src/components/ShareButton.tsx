'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createLogger } from '@/lib/logger';
import { UI_CONFIG } from '@/lib/config/constants';
import {
  APP_CONFIG,
  SHARE_BUTTON_LABELS,
  SVG_STROKE_WIDTHS,
  SVG_SIZES,
  SVG_VIEWBOX,
  COMPONENT_CONFIG,
  TRANSITION_CLASSES,
  TEXT_COLORS,
} from '@/lib/config';
import { ToastOptions } from '@/components/ToastContainer';
import { triggerHapticFeedback } from '@/lib/utils';
import Tooltip from './Tooltip';
import StatusAnnouncer from './StatusAnnouncer';
import { useConfetti } from '@/hooks/useConfetti';

export interface ShareButtonProps {
  shareUrl?: string;
  shareTitle?: string;
  shareText?: string;
  label?: string;
  successLabel?: string;
  ariaLabel?: string;
  className?: string;
  variant?: 'default' | 'icon-only';
  showToast?: boolean;
  toastMessage?: string;
  /** Callback fired after successful share - useful for analytics tracking */
  onShare?: () => void;
}

const logger = createLogger('ShareButton');

/**
 * ShareButton - Social sharing component
 *
 * Uses Web Share API when available (mobile native share dialog)
 * Falls back to clipboard copy on desktop
 *
 * Growth: Enables viral sharing loops for user acquisition
 */
const ShareButtonComponent = function ShareButton({
  shareUrl = APP_CONFIG.URLS.BASE,
  shareTitle = APP_CONFIG.NAME,
  shareText = APP_CONFIG.DESCRIPTION,
  label = SHARE_BUTTON_LABELS.DEFAULT_LABEL,
  successLabel = SHARE_BUTTON_LABELS.SUCCESS_LABEL,
  ariaLabel = SHARE_BUTTON_LABELS.ARIA_LABEL,
  className = '',
  variant = 'default',
  showToast = true,
  toastMessage = SHARE_BUTTON_LABELS.CLIPBOARD_TOAST,
  onShare,
}: ShareButtonProps) {
  const [shared, setShared] = useState(false);
  const { particles, fire } = useConfetti();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getWindow = () => {
    return window as unknown as Window & {
      showToast?: (options: ToastOptions) => void;
    };
  };

  const showSuccessToast = useCallback(
    (message: string) => {
      const win = getWindow();
      if (showToast && typeof window !== 'undefined' && win.showToast) {
        win.showToast({
          type: 'success',
          message,
          duration: UI_CONFIG.TOAST_DURATION,
        });
      }
    },
    [showToast]
  );

  const showErrorToast = useCallback(
    (message: string) => {
      const win = getWindow();
      if (showToast && typeof window !== 'undefined' && win.showToast) {
        win.showToast({
          type: 'error',
          message,
          duration: UI_CONFIG.TOAST_DURATION,
        });
      }
    },
    [showToast]
  );

  const handleShare = useCallback(async () => {
    const shareData: ShareData = {
      title: shareTitle,
      text: shareText,
      url: shareUrl,
    };

    // Check if Web Share API is available
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        triggerHapticFeedback();
        await navigator.share(shareData);
        setShared(true);
        fire();
        logger.debug('Successfully shared via Web Share API', {
          shareTitle,
          shareUrl,
        });

        timeoutRef.current = setTimeout(
          () => setShared(false),
          UI_CONFIG.COPY_FEEDBACK_DURATION
        );
        showSuccessToast(SHARE_BUTTON_LABELS.SHARE_SUCCESS);

        // Growth: Fire onShare callback for analytics
        if (onShare) {
          onShare();
        }
      } catch (err) {
        // User cancelled or error - not necessarily an error
        if ((err as Error).name !== 'AbortError') {
          logger.debug('Web Share API failed, falling back to clipboard', err);
        }
        // Fall through to clipboard fallback
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        triggerHapticFeedback();
        await navigator.clipboard.writeText(shareUrl);
        setShared(true);
        fire();
        logger.debug('Successfully copied share URL to clipboard', {
          shareUrl,
        });

        timeoutRef.current = setTimeout(
          () => setShared(false),
          UI_CONFIG.COPY_FEEDBACK_DURATION
        );
        showSuccessToast(toastMessage);

        // Growth: Fire onShare callback for analytics (clipboard fallback)
        if (onShare) {
          onShare();
        }
      } catch (clipboardErr) {
        logger.error('Failed to copy share URL', clipboardErr);
        showErrorToast(SHARE_BUTTON_LABELS.CLIPBOARD_ERROR);
      }
    }
  }, [
    shareUrl,
    shareTitle,
    shareText,
    toastMessage,
    showSuccessToast,
    showErrorToast,
    onShare,
    fire,
  ]);

  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-medium ${TRANSITION_CLASSES.DEFAULT} ease-out
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    focus-visible:ring-primary-500 focus-visible:ring-offset-white
    motion-reduce:transition-none
  `;

  const variantClasses = {
    default: `
      px-3 py-1.5 text-sm
      bg-primary-600 text-white hover:bg-primary-700
      rounded-md
      ${COMPONENT_CONFIG.BUTTON.SCALE_CLASSES.DEFAULT}
    `,
    'icon-only': `
      p-1.5
      text-gray-500 hover:text-primary-600 hover:bg-primary-50
      rounded-full
      ${COMPONENT_CONFIG.BUTTON.SCALE_CLASSES.COMPACT}
      ${shared ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700' : ''}
    `,
  };

  const glowClass = shared ? 'animate-share-success-glow' : '';

  return (
    <>
      <StatusAnnouncer message={toastMessage} triggered={shared} />
      <Tooltip
        content={shared ? successLabel : ariaLabel}
        disabled={false}
        position="top"
      >
        <span className="relative inline-flex">
          <button
            onClick={handleShare}
            className={`${baseClasses} ${variantClasses[variant]} ${glowClass} ${className}`}
            aria-label={ariaLabel}
            type="button"
          >
            <span
              className={`relative flex items-center justify-center ${SVG_SIZES.MD}`}
            >
              {/* Share icon */}
              <svg
                className={`
              absolute inset-0 ${SVG_SIZES.MD} ${TRANSITION_CLASSES.DEFAULT}
              ${shared ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}
            `}
                fill="none"
                viewBox={SVG_VIEWBOX.STANDARD}
                stroke="currentColor"
                strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>

              {/* Checkmark icon when shared */}
              <svg
                className={`
              absolute inset-0 ${SVG_SIZES.MD} text-green-500 ${TRANSITION_CLASSES.DEFAULT}
              ${shared ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
            `}
                fill="none"
                viewBox={SVG_VIEWBOX.STANDARD}
                stroke="currentColor"
                strokeWidth={SVG_STROKE_WIDTHS.THICK}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </span>

            {variant !== 'icon-only' && (
              <span
                className={`
              ${TRANSITION_CLASSES.DEFAULT}
              ${shared ? TEXT_COLORS.SUCCESS_VERY_LIGHT : ''}
            `}
              >
                {shared ? successLabel : label}
              </span>
            )}
          </button>
          {particles.map((particle) => (
            <span
              key={particle.id}
              className="absolute rounded-full pointer-events-none animate-copy-confetti"
              style={
                {
                  left: '50%',
                  top: '50%',
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  backgroundColor: particle.color,
                  '--confetti-x': `${particle.x}px`,
                  '--confetti-y': `${particle.y}px`,
                  animationDelay: `${particle.delay}ms`,
                } as React.CSSProperties
              }
              aria-hidden="true"
            />
          ))}
        </span>
      </Tooltip>
    </>
  );
};

ShareButtonComponent.displayName = 'ShareButton';

export default React.memo(ShareButtonComponent);
