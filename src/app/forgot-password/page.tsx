'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { supabaseClient } from '@/lib/db';
import Button from '@/components/Button';
import InputWithValidation from '@/components/InputWithValidation';
import Alert from '@/components/Alert';
import { ROUTES } from '@/lib/config';
import {
  PAGE_LAYOUT_CLASSES,
  CONTAINER_WIDTHS,
  TEXT_COLOR_CLASSES,
  TYPOGRAPHY_CLASSES,
  SPACING_CLASSES,
  LAYOUT_CLASSES,
  FORM_PATTERNS,
  HERO_ENTRANCE,
  SPACE_Y_PATTERNS,
  VALIDATION_CONFIG,
} from '@/lib/config';
import { SUCCESS_STATE_COLORS } from '@/lib/config/theme';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateEmail = useCallback((value: string): boolean => {
    return VALIDATION_CONFIG.COMMON_REGEX.EMAIL.test(value);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      const trimmedEmail = email.trim();
      if (!trimmedEmail || !validateEmail(trimmedEmail)) {
        setError('Please enter a valid email address');
        return;
      }

      setIsLoading(true);

      try {
        if (!supabaseClient) {
          throw new Error('Authentication service is unavailable');
        }

        const { error: resetError } =
          await supabaseClient.auth.resetPasswordForEmail(trimmedEmail, {
            redirectTo: `${window.location.origin}${ROUTES.LOGIN}`,
          });

        if (resetError) {
          throw resetError;
        }

        setSuccess(true);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to send reset email. Please try again.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [email, validateEmail]
  );

  if (success) {
    return (
      <div className={PAGE_LAYOUT_CLASSES.AUTH_CONTAINER}>
        <div
          className={`${CONTAINER_WIDTHS.XS} w-full ${SPACE_Y_PATTERNS.XL} relative`}
        >
          <div className={`${LAYOUT_CLASSES.TEXT_CENTER} ${HERO_ENTRANCE}`}>
            <div
              className={`mx-auto ${SPACING_CLASSES.COMPONENT} flex h-12 w-12 items-center justify-center rounded-full ${SUCCESS_STATE_COLORS.ICON_BG}`}
            >
              <svg
                className={`h-6 w-6 ${SUCCESS_STATE_COLORS.ICON_TEXT}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1
              className={`${TYPOGRAPHY_CLASSES.PAGE_HEADING} ${TEXT_COLOR_CLASSES.HEADING}`}
            >
              Check your email
            </h1>
            <p
              className={`${SPACING_CLASSES.TOP_SMALL} ${TYPOGRAPHY_CLASSES.SMALL} ${TEXT_COLOR_CLASSES.BODY}`}
            >
              We&apos;ve sent a password reset link to{' '}
              <span className="font-medium">{email}</span>
            </p>
            <p
              className={`${SPACING_CLASSES.TOP_SMALL} ${TYPOGRAPHY_CLASSES.EXTRA_SMALL} ${TEXT_COLOR_CLASSES.MUTED}`}
            >
              Didn&apos;t receive the email? Check your spam folder or try
              again.
            </p>
            <div className={SPACING_CLASSES.TOP}>
              <Link
                href={ROUTES.LOGIN}
                className={`${FORM_PATTERNS.AUTH_LINK} text-sm`}
              >
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={PAGE_LAYOUT_CLASSES.AUTH_CONTAINER}>
      <a
        href="#forgot-password-form"
        className={`${FORM_PATTERNS.AUTH_LINK} sr-only focus:not-sr-only`}
      >
        Skip to form
      </a>

      <div
        className={`${CONTAINER_WIDTHS.XS} w-full ${SPACE_Y_PATTERNS.XL} relative`}
      >
        <div className={`${LAYOUT_CLASSES.TEXT_CENTER} ${HERO_ENTRANCE}`}>
          <h1
            className={`${TYPOGRAPHY_CLASSES.PAGE_HEADING} ${TEXT_COLOR_CLASSES.HEADING}`}
          >
            Forgot your password?
          </h1>
          <p
            className={`${SPACING_CLASSES.TOP_SMALL} ${TYPOGRAPHY_CLASSES.SMALL} ${TEXT_COLOR_CLASSES.BODY}`}
          >
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </p>
        </div>

        <form
          id="forgot-password-form"
          className={`mt-8 ${SPACE_Y_PATTERNS.LG}`}
          onSubmit={handleSubmit}
        >
          {error && (
            <Alert type="error" title="Error">
              {error}
            </Alert>
          )}

          <InputWithValidation
            id="email"
            name="email"
            type="email"
            label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            autoComplete="email"
            autoFocus
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
            size="lg"
            enableTransition
          >
            {isLoading ? 'Sending...' : 'Send reset link'}
          </Button>
        </form>

        <div className={`${SPACING_CLASSES.TOP} ${LAYOUT_CLASSES.TEXT_CENTER}`}>
          <p className={`text-sm ${TEXT_COLOR_CLASSES.BODY}`}>
            Remember your password?{' '}
            <Link href={ROUTES.LOGIN} className={FORM_PATTERNS.AUTH_LINK}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
