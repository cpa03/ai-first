'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
import Button from './Button';
import Tooltip from './Tooltip';
import StatusAnnouncer from './StatusAnnouncer';
import { createLogger } from '@/lib/logger';
import { triggerHapticFeedback } from '@/lib/utils';
import { useConfetti } from '@/hooks/useConfetti';
import {
  APP_CONFIG,
  UI_CONFIG,
  SVG_STROKE_WIDTHS,
  SVG_SIZES,
  SVG_VIEWBOX,
  TRANSITION_CLASSES,
} from '@/lib/config';
import { EMAIL_BUTTON_LABELS } from '@/lib/config/component-labels';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export interface EmailButtonProps {
  ideaTitle: string;
  ideaContent: string;
  sessionAnswers?: Record<string, string>;
  label?: string;
  successLabel?: string;
  ariaLabel?: string;
  tooltipLabel?: string;
  className?: string;
  onEmailSent?: () => void;
}

const logger = createLogger('EmailButton');

/**
 * EmailButton - Email "Send to Self" component
 *
 * Opens user's default email client with blueprint content pre-filled.
 * This is a privacy-friendly approach - no data leaves the user's device
 * until they explicitly send the email.
 *
 * Micro-UX: Provides visual feedback with loading spinner and success animation
 * to confirm the action was triggered, matching the UX patterns of CopyButton
 * and ShareButton.
 *
 * Growth: Enables user retention and accessibility - users can easily
 * save their blueprint to their email for offline access.
 */
const EmailButtonComponent = function EmailButton({
  ideaTitle,
  ideaContent,
  sessionAnswers = {},
  label = EMAIL_BUTTON_LABELS.DEFAULT_LABEL,
  successLabel = EMAIL_BUTTON_LABELS.SUCCESS_LABEL,
  ariaLabel = EMAIL_BUTTON_LABELS.ARIA_LABEL,
  tooltipLabel = EMAIL_BUTTON_LABELS.TOOLTIP_LABEL,
  className = '',
  onEmailSent,
}: EmailButtonProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'success'>('idle');
  const { particles, fire } = useConfetti();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleEmailClick = useCallback(() => {
    if (state === 'loading') return;

    try {
      triggerHapticFeedback();
      setState('loading');

      // Build the email body
      const emailBody = buildEmailBody(ideaTitle, ideaContent, sessionAnswers);

      // Create mailto link
      const subject = encodeURIComponent(
        `${EMAIL_BUTTON_LABELS.SUBJECT_PREFIX} ${APP_CONFIG.NAME} ${EMAIL_BUTTON_LABELS.SUBJECT_SUFFIX} ${ideaTitle}`
      );
      const body = encodeURIComponent(emailBody);
      const mailtoLink = `mailto:?subject=${subject}&body=${body}`;

      // Open email client
      window.open(mailtoLink, '_blank');

      logger.debug('Opened email client for blueprint', {
        ideaTitle,
        hasAnswers: Object.keys(sessionAnswers).length > 0,
      });

      setState('success');
      fire();

      timeoutRef.current = setTimeout(() => {
        setState('idle');
      }, UI_CONFIG.FEEDBACK.COPY_FEEDBACK_DURATION_MS);

      // Fire callback for analytics
      if (onEmailSent) {
        onEmailSent();
      }
    } catch (error) {
      logger.error('Failed to open email client', error);
      setState('idle');
    }
  }, [ideaTitle, ideaContent, sessionAnswers, onEmailSent, state, fire]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        handleEmailClick();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleEmailClick]);

  const iconTransition = prefersReducedMotion ? '' : TRANSITION_CLASSES.DEFAULT;

  return (
    <>
      <StatusAnnouncer message={successLabel} triggered={state === 'success'} />
      <Tooltip
        content={state === 'success' ? successLabel : tooltipLabel}
        shortcut={
          state === 'success'
            ? undefined
            : [...EMAIL_BUTTON_LABELS.KEYBOARD_SHORTCUT]
        }
        disabled={false}
        position="top"
      >
        <span className="relative inline-flex">
          <Button
            variant="primary"
            loading={state === 'loading'}
            onClick={handleEmailClick}
            aria-label={ariaLabel}
            className={className}
          >
            <span
              className={`relative flex items-center justify-center ${SVG_SIZES.MD}`}
            >
              <svg
                className={`absolute inset-0 ${SVG_SIZES.MD} ${iconTransition} ${
                  state === 'success'
                    ? 'opacity-0 scale-75'
                    : 'opacity-100 scale-100'
                }`}
                fill="none"
                viewBox={SVG_VIEWBOX.STANDARD}
                stroke="currentColor"
                strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>

              <svg
                className={`absolute inset-0 ${SVG_SIZES.MD} text-green-700 ${iconTransition} ${
                  state === 'success'
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-50'
                }`}
                fill="none"
                viewBox={SVG_VIEWBOX.STANDARD}
                stroke="currentColor"
                strokeWidth={SVG_STROKE_WIDTHS.EXTRA_THICK}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </span>

            <span
              className={`${iconTransition} ${
                state === 'success' ? 'text-green-100' : ''
              }`}
            >
              {state === 'success' ? successLabel : label}
            </span>
          </Button>
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

/**
 * Build email body with blueprint content
 */
function buildEmailBody(
  title: string,
  content: string,
  answers: Record<string, string>
): string {
  let body = `${EMAIL_BUTTON_LABELS.BODY_HEADER} ${APP_CONFIG.NAME}\n`;
  body += `${EMAIL_BUTTON_LABELS.BODY_SEPARATOR}\n\n`;
  body += `${EMAIL_BUTTON_LABELS.BODY_TITLE_LABEL} ${title}\n\n`;
  body += `${EMAIL_BUTTON_LABELS.BODY_SUMMARY_LABEL}\n${content}\n\n`;

  // Add answers if available
  if (Object.keys(answers).length > 0) {
    body += `${EMAIL_BUTTON_LABELS.BODY_DETAILS_LABEL}\n`;
    for (const [key, value] of Object.entries(answers)) {
      // Format key as readable text
      const formattedKey = key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      body += `- ${formattedKey}: ${value}\n`;
    }
    body += `\n`;
  }

  body += `---\n`;
  body += `${EMAIL_BUTTON_LABELS.BODY_FOOTER} ${APP_CONFIG.NAME} - ${APP_CONFIG.TAGLINE}\n`;
  body += `${APP_CONFIG.URLS.BASE}`;

  return body;
}

EmailButtonComponent.displayName = 'EmailButton';

export default React.memo(EmailButtonComponent);
