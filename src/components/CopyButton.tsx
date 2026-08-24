'use client';

import React, { useCallback, useMemo } from 'react';
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
  COMPONENT_STATE_COLORS,
  CONFETTI_DOT,
  COPY_SUCCESS_GLOW,
} from '@/lib/config';
import { FOCUS_RING_PATTERNS } from '@/lib/config/remaining-styles';
import Tooltip from './Tooltip';
import StatusAnnouncer from './StatusAnnouncer';
import { useConfetti } from '@/hooks/useConfetti';
import { useClipboard } from '@/hooks/useClipboard';
import { useToast } from '@/hooks/useAnnouncement';
import { CSS_POSITIONING } from '@/lib/config/css-positioning';
import { PLATFORM } from '@/lib/dom-utils';
import { INLINE_FLEX_RELATIVE } from '@/lib/config/remaining-hardcoded-patterns';
import { COPY_BUTTON_PATTERNS } from '@/lib/config/final-hardcoded-patterns';

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
  const { showToast: showToastFn } = useToast();

  const handleOnCopy = useCallback(() => {
    fire();
    if (onCopy) onCopy();

    if (showToast) {
      showToastFn({
        type: 'success',
        message: toastMessage,
      });
    }
    logger.debug('Successfully copied text to clipboard', {
      textLength: textToCopy.length,
    });
  }, [fire, onCopy, showToast, showToastFn, toastMessage, textToCopy.length]);

  const { copy, hasCopied: copied } = useClipboard({
    onCopy: handleOnCopy,
    duration: UI_CONFIG.COPY_FEEDBACK_DURATION,
  });

  const handleCopy = useCallback(() => {
    copy(textToCopy);
  }, [copy, textToCopy]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        e.stopPropagation();
        handleCopy();
      }
    },
    [handleCopy]
  );

  const shortcutHint = useMemo(
    () => COPY_BUTTON_LABELS.KEYBOARD_SHORTCUT(PLATFORM.isMac()),
    []
  );

  const baseClasses = `
    ${COPY_BUTTON_PATTERNS.BUTTON_CONTAINER}
    font-medium ${TRANSITION_CLASSES.DEFAULT} ease-out transform
    ${FOCUS_RING_PATTERNS.DEFAULT}
    ${COMPONENT_CONFIG.COPY_FEEDBACK.FOCUS_RING_CLASS} focus-visible:ring-offset-gray-100
    motion-reduce:transition-none motion-reduce:hover:transform-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100
  `;

  const variantClasses = {
    default: `
      ${COMPONENT_CONFIG.COPY_FEEDBACK.VARIANT_CLASSES.DEFAULT}
      ${COMPONENT_CONFIG.COPY_FEEDBACK.SCALE.DEFAULT_HOVER}
      ${COMPONENT_CONFIG.BUTTON.SCALE_CLASSES.DEFAULT}
    `,
    subtle: `
      ${COMPONENT_CONFIG.COPY_FEEDBACK.VARIANT_CLASSES.SUBTLE}
      ${COMPONENT_CONFIG.COPY_FEEDBACK.SCALE.SUBTLE_HOVER}
    `,
    'icon-only': `
      ${COMPONENT_CONFIG.COPY_FEEDBACK.VARIANT_CLASSES.ICON_ONLY}
      ${TEXT_COLORS.MUTED}
      ${COMPONENT_CONFIG.COPY_FEEDBACK.SCALE.ICON_HOVER}
      ${COMPONENT_CONFIG.BUTTON.SCALE_CLASSES.COMPACT}
      ${copied ? COMPONENT_STATE_COLORS.COPIED.ICON : ''}
    `,
  };

  const glowClass = copied ? COPY_SUCCESS_GLOW : '';

  return (
    <>
      <StatusAnnouncer message={successLabel} triggered={copied} />
      <Tooltip
        content={copied ? successLabel : ariaLabel}
        shortcut={copied ? undefined : shortcutHint}
        disabled={false}
        position="top"
      >
        <span className={INLINE_FLEX_RELATIVE}>
          <button
            onClick={handleCopy}
            onKeyDown={handleKeyDown}
            className={`${baseClasses} ${variantClasses[variant]} ${glowClass} ${className}`}
            aria-label={ariaLabel}
            aria-keyshortcuts="Control+C, Meta+C"
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
              absolute inset-0 ${SVG_SIZES.MD} ${COMPONENT_STATE_COLORS.COPIED.CHECKMARK} ${TRANSITION_CLASSES.DEFAULT}
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
              className={CONFETTI_DOT}
              style={
                {
                  ...CSS_POSITIONING.CENTER_ANIMATED,
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
