'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createLogger } from '@/lib/logger';
import { UI_CONFIG } from '@/lib/config/constants';
import {
  COPY_BUTTON_LABELS,
  SVG_STROKE_WIDTHS,
  CONFETTI_COLORS,
  COMPONENT_CONFIG,
} from '@/lib/config';
import { ToastOptions } from '@/components/ToastContainer';
import { triggerHapticFeedback } from '@/lib/utils';
import Tooltip from './Tooltip';
import StatusAnnouncer from './StatusAnnouncer';

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

interface ConfettiParticle {
  id: string;
  x: number;
  y: number;
  color: string;
  delay: number;
  size: number; // Size variation for more natural confetti effect
}

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
  const [copied, setCopied] = useState(false);
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const confettiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (confettiTimeoutRef.current) {
        clearTimeout(confettiTimeoutRef.current);
      }
    };
  }, []);

  const generateConfetti = useCallback(() => {
    if (confettiTimeoutRef.current) {
      clearTimeout(confettiTimeoutRef.current);
    }

    const particles: ConfettiParticle[] = [];
    const particleCount = CONFETTI_COLORS.PARTICLE_COUNT;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 20 + Math.random() * 20;
      const size = 4 + Math.random() * 6;
      particles.push({
        id: `confetti-${Date.now()}-${i}`,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        color: CONFETTI_COLORS.PRIMARY[i % CONFETTI_COLORS.PRIMARY.length],
        delay: i * 30,
        size,
      });
    }
    setConfetti(particles);
    confettiTimeoutRef.current = setTimeout(
      () => setConfetti([]),
      COMPONENT_CONFIG.CONFETTI.CLEANUP_MS
    );
  }, []);

  const handleCopy = useCallback(async () => {
    const win = window as unknown as Window & {
      showToast?: (options: ToastOptions) => void;
    };

    try {
      await navigator.clipboard.writeText(textToCopy);
      triggerHapticFeedback();
      setCopied(true);
      generateConfetti();

      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, UI_CONFIG.COPY_FEEDBACK_DURATION);

      if (showToast && typeof window !== 'undefined' && win.showToast) {
        win.showToast({
          type: 'success',
          message: toastMessage,
          duration: UI_CONFIG.TOAST_DURATION,
        });
      }

      // Growth: Fire onCopy callback for analytics
      if (onCopy) {
        onCopy();
      }

      logger.debug('Successfully copied text to clipboard', {
        textLength: textToCopy.length,
      });
    } catch (err) {
      logger.error('Failed to copy text', err);

      if (showToast && typeof window !== 'undefined' && win.showToast) {
        win.showToast({
          type: 'error',
          message: COPY_BUTTON_LABELS.CLIPBOARD_ERROR,
          duration: UI_CONFIG.TOAST_DURATION,
        });
      }
    }
  }, [textToCopy, showToast, toastMessage, onCopy, generateConfetti]);

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
      bg-primary-100 text-primary-700 hover:bg-primary-200
      rounded-md
      active:scale-[0.95]
    `,
    subtle: `
      px-2 py-1 text-xs
      text-primary-600 hover:text-primary-800 hover:bg-primary-50
      rounded
      underline-offset-2 hover:underline
    `,
    'icon-only': `
      p-1.5
      text-gray-500 hover:text-primary-600 hover:bg-primary-50
      rounded-full
      active:scale-[0.9]
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
            className={`${baseClasses} ${variantClasses[variant]} ${glowClass} ${className}`}
            aria-label={ariaLabel}
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
                strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                aria-hidden="true"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>

              <svg
                className={`
              absolute inset-0 w-4 h-4 text-green-700 transition-all duration-200
              ${copied ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
            `}
                fill="none"
                viewBox="0 0 24 24"
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
              transition-all duration-200
              ${copied ? 'text-green-700' : ''}
            `}
              >
                {copied ? successLabel : label}
              </span>
            )}
          </button>
          {confetti.map((particle) => (
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
