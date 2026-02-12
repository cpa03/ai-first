'use client';

import React, { useState, useCallback } from 'react';
import { createLogger } from '@/lib/logger';
import { UI_CONFIG } from '@/lib/config/constants';
import { ToastOptions } from '@/components/ToastContainer';

export interface CopyButtonProps {
  textToCopy: string;
  label?: string;
  successLabel?: string;
  ariaLabel?: string;
  className?: string;
  variant?: 'default' | 'subtle' | 'icon-only';
  showToast?: boolean;
  toastMessage?: string;
}

const logger = createLogger('CopyButton');

const CopyButtonComponent = function CopyButton({
  textToCopy,
  label = 'Copy',
  successLabel = 'Copied!',
  ariaLabel = 'Copy to clipboard',
  className = '',
  variant = 'default',
  showToast = true,
  toastMessage = 'Copied to clipboard!',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const win = window as unknown as Window & {
      showToast?: (options: ToastOptions) => void;
    };

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, UI_CONFIG.COPY_FEEDBACK_DURATION);

      if (showToast && typeof window !== 'undefined' && win.showToast) {
        win.showToast({
          type: 'success',
          message: toastMessage,
          duration: UI_CONFIG.TOAST_DURATION,
        });
      }

      logger.debug('Successfully copied text to clipboard', {
        textLength: textToCopy.length,
      });
    } catch (err) {
      logger.error('Failed to copy text', err);

      if (showToast && typeof window !== 'undefined' && win.showToast) {
        win.showToast({
          type: 'error',
          message: 'Failed to copy. Please try selecting and copying manually.',
          duration: UI_CONFIG.TOAST_DURATION,
        });
      }
    }
  }, [textToCopy, showToast, toastMessage]);

  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-medium transition-all duration-200 ease-out
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    focus-visible:ring-primary-500 focus-visible:ring-offset-white
    motion-reduce:transition-none
  `;

  const variantClasses = {
    default: `
      px-3 py-1.5 text-sm
      bg-blue-100 text-blue-700 hover:bg-blue-200
      rounded-md
      active:scale-[0.95]
    `,
    subtle: `
      px-2 py-1 text-xs
      text-blue-600 hover:text-blue-800 hover:bg-blue-50
      rounded
      underline-offset-2 hover:underline
    `,
    'icon-only': `
      p-1.5
      text-gray-500 hover:text-blue-600 hover:bg-blue-50
      rounded-full
      active:scale-[0.9]
    `,
  };

  return (
    <button
      onClick={handleCopy}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      aria-label={copied ? 'Copied to clipboard' : ariaLabel}
      aria-live="polite"
      aria-atomic="true"
      type="button"
    >
      <span className="relative flex items-center justify-center w-4 h-4">
        <svg
          className={`
            absolute inset-0 w-4 h-4 transition-all duration-200
            ${copied ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}
          `}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>

        <svg
          className={`
            absolute inset-0 w-4 h-4 text-green-600 transition-all duration-200
            ${copied ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
          `}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
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
            transition-all duration-200
            ${copied ? 'text-green-700' : ''}
          `}
        >
          {copied ? successLabel : label}
        </span>
      )}
    </button>
  );
};

CopyButtonComponent.displayName = 'CopyButton';

export default React.memo(CopyButtonComponent);
