'use client';

import React, { useCallback } from 'react';
import Button from './Button';
import { createLogger } from '@/lib/logger';
import { triggerHapticFeedback } from '@/lib/utils';

export interface EmailButtonProps {
  ideaTitle: string;
  ideaContent: string;
  sessionAnswers?: Record<string, string>;
  label?: string;
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
 * Growth: Enables user retention and accessibility - users can easily
 * save their blueprint to their email for offline access.
 */
const EmailButtonComponent = function EmailButton({
  ideaTitle,
  ideaContent,
  sessionAnswers = {},
  label = 'Email to Self',
  ariaLabel = 'Email blueprint to yourself',
  className = '',
  onEmailSent,
}: EmailButtonProps) {
  const handleEmailClick = useCallback(() => {
    try {
      triggerHapticFeedback();

      // Build the email body
      const emailBody = buildEmailBody(ideaTitle, ideaContent, sessionAnswers);

      // Create mailto link
      const subject = encodeURIComponent(`My IdeaFlow Blueprint: ${ideaTitle}`);
      const body = encodeURIComponent(emailBody);
      const mailtoLink = `mailto:?subject=${subject}&body=${body}`;

      // Open email client
      window.open(mailtoLink, '_blank');

      logger.debug('Opened email client for blueprint', {
        ideaTitle,
        hasAnswers: Object.keys(sessionAnswers).length > 0,
      });

      // Fire callback for analytics
      if (onEmailSent) {
        onEmailSent();
      }
    } catch (error) {
      logger.error('Failed to open email client', error);
    }
  }, [ideaTitle, ideaContent, sessionAnswers, onEmailSent]);

  return (
    <Button
      variant="primary"
      onClick={handleEmailClick}
      aria-label={ariaLabel}
      className={className}
    >
      {label}
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
  let body = `My Project Blueprint from IdeaFlow\n`;
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
  body += `Created with IdeaFlow - Turn ideas into actionable plans\n`;
  body += `https://ideaflow.ai`;

  return body;
}

EmailButtonComponent.displayName = 'EmailButton';

export default React.memo(EmailButtonComponent);
