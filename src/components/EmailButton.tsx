'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
import Button from './Button';
import { createLogger } from '@/lib/logger';
import { triggerHapticFeedback } from '@/lib/utils';
import { APP_CONFIG, UI_CONFIG } from '@/lib/config';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export interface EmailButtonProps {
  ideaTitle: string;
  ideaContent: string;
  sessionAnswers?: Record<string, string>;
  label?: string;
  successLabel?: string;
  ariaLabel?: string;
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
  label = 'Email to Self',
  successLabel = 'Email Opened!',
  ariaLabel = 'Email blueprint to yourself',
  className = '',
  onEmailSent,
}: EmailButtonProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'success'>('idle');
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
        `My ${APP_CONFIG.NAME} Blueprint: ${ideaTitle}`
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
  }, [ideaTitle, ideaContent, sessionAnswers, onEmailSent, state]);

  const iconTransition = prefersReducedMotion
    ? ''
    : 'transition-all duration-200';

  return (
    <Button
      variant="primary"
      loading={state === 'loading'}
      onClick={handleEmailClick}
      aria-label={ariaLabel}
      className={className}
    >
      <span className="relative flex items-center justify-center w-4 h-4">
        <svg
          className={`absolute inset-0 w-4 h-4 ${iconTransition} ${
            state === 'success' ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>

        <svg
          className={`absolute inset-0 w-4 h-4 text-green-600 ${iconTransition} ${
            state === 'success' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
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
  let body = `My Project Blueprint from ${APP_CONFIG.NAME}\n`;
  body += `================================\n\n`;
  body += `Title: ${title}\n\n`;
  body += `Summary:\n${content}\n\n`;

  // Add answers if available
  if (Object.keys(answers).length > 0) {
    body += `Details:\n`;
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
  body += `Created with ${APP_CONFIG.NAME} - ${APP_CONFIG.TAGLINE}\n`;
  body += `${APP_CONFIG.URLS.BASE}`;

  return body;
}

EmailButtonComponent.displayName = 'EmailButton';

export default React.memo(EmailButtonComponent);
