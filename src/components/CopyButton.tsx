'use client';

import React, { useCallback } from 'react';
import { createLogger } from '@/lib/logger';
import { UI_CONFIG } from '@/lib/config/constants';
import {
  COPY_BUTTON_LABELS,
  SVG_STROKE_WIDTHS,
  SVG_SIZES,
  SVG_VIEWBOX,
  COMPONENT_CONFIG,
  TRANSITION_CLASSES,
  TEXT_COLORS,
} from '@/lib/config';
import { ToastOptions } from '@/components/ToastContainer';
import Tooltip from './Tooltip';
import StatusAnnouncer from './StatusAnnouncer';
import { useConfetti } from '@/hooks/useConfetti';
import { useClipboard } from '@/hooks/useClipboard';

export interface CopyButtonProps {
  textToCopy: string;
  label?: string;
  successLabel?: string;
  ariaLabel?: string;
  className?: string;
  variant?: 'default' | 'subtle' | 'icon-only';
  showToast?: boolean;
  toastMessage?: string;
  /** Callback fired after successful copy - useful for analytics tracking */
  onCopy?: () => void;
}

const logger = createLogger('CopyButton');

const CopyButtonComponent = function CopyButton({
  textToCopy,
  label = COPY_BUTTON_LABELS.DEFAULT_LABEL,
  successLabel = COPY_BUTTON_LABELS.SUCCESS_LABEL,
  ariaLabel = COPY_BUTTON_LABELS.ARIA_LABEL,
  className = '',
  variant = 'default',
  showToast = true,
  toastMessage = COPY_BUTTON_LABELS.CLIPBOARD_TOAST,
  onCopy,
}: CopyButtonProps) {
  const { fire, particles } = useConfetti();

  const handleOnCopy = useCallback(() => {
    fire();
    if (onCopy) onCopy();

    if (showToast && typeof window !== 'undefined') {
      const win = window as unknown as Window & {
        showToast?: (options: ToastOptions) => void;
      };
      if (win.showToast) {
        win.showToast({
          type: 'success',
          message: toastMessage,
          duration: UI_CONFIG.TOAST_DURATION,
        });
      }
    }
    logger.debug('Successfully copied text to clipboard', {
      textLength: textToCopy.length,
    });
  }, [fire, onCopy, showToast, toastMessage, textToCopy.length]);

  const { copy, hasCopied: copied } = useClipboard({
    onCopy: handleOnCopy,
    duration: UI_CONFIG.COPY_FEEDBACK_DURATION,
  });

  const handleCopy = useCallback(() => {
    copy(textToCopy);
  }, [copy, textToCopy]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        e.preventDefault();
        e.stopPropagation();
        handleCopy();
      }
    },
    [handleCopy]
  );

  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-medium ${TRANSITION_CLASSES.DEFAULT} ease-out transform
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    focus-visible:ring-primary-500 focus-visible:ring-offset-white
    motion-reduce:transition-none motion-reduce:hover:transform-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100
  `;

  const variantClasses = {
    default: `
      px-3 py-1.5 text-sm
      bg-primary-100 text-primary-700 hover:bg-primary-200
      ${COMPONENT_CONFIG.COPY_FEEDBACK.SCALE.DEFAULT_HOVER} hover:-translate-y-0.5 active:translate-y-0
      rounded-md
      ${COMPONENT_CONFIG.BUTTON.SCALE_CLASSES.DEFAULT}
    `,
    subtle: `
      px-2 py-1 text-xs
      text-primary-600 hover:text-primary-800 hover:bg-primary-50
      ${COMPONENT_CONFIG.COPY_FEEDBACK.SCALE.SUBTLE_HOVER} hover:-translate-y-0.5 active:translate-y-0
      rounded
      underline-offset-2 hover:underline
    `,
    'icon-only': `
      p-1.5
      text-gray-500 hover:text-primary-600 hover:bg-primary-50
      ${COMPONENT_CONFIG.COPY_FEEDBACK.SCALE.ICON_HOVER} hover:-translate-y-0.5 active:translate-y-0
      rounded-full
      ${COMPONENT_CONFIG.BUTTON.SCALE_CLASSES.COMPACT}
      ${copied ? 'text-green-700 bg-green-50 hover:bg-green-100 hover:text-green-800' : ''}
    `,
  };

  const glowClass = copied ? 'animate-copy-success-glow' : '';

  return (
    <>
      <StatusAnnouncer message={successLabel} triggered={copied} />
      <Tooltip
        content={copied ? successLabel : ariaLabel}
        shortcut={copied ? undefined : ['⌘', 'C']}
        disabled={false}
        position="top"
      >
        <span className="relative inline-flex">
          <button
            onClick={handleCopy}
            onKeyDown={handleKeyDown}
            className={`${baseClasses} ${variantClasses[variant]} ${glowClass} ${className}`}
            aria-label={ariaLabel}
            type="button"
          >
            <span
              className={`relative flex items-center justify-center ${SVG_SIZES.MD}`}
            >
              <svg
                className={`
              absolute inset-0 ${SVG_SIZES.MD} ${TRANSITION_CLASSES.DEFAULT}
              ${copied ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}
            `}
                fill="none"
                viewBox={SVG_VIEWBOX.STANDARD}
                stroke="currentColor"
                strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                aria-hidden="true"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>

              <svg
                className={`
              absolute inset-0 ${SVG_SIZES.MD} text-green-700 ${TRANSITION_CLASSES.DEFAULT}
              ${copied ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
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
              ${copied ? TEXT_COLORS.SUCCESS_DARK : ''}
            `}
              >
                {copied ? successLabel : label}
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

CopyButtonComponent.displayName = 'CopyButton';

export default React.memo(CopyButtonComponent);
