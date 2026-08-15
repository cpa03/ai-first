'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
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
  FORM_OVERLAY_STYLES,
  FORM_ARIA_LABELS,
  UI_CONFIG,
  GRAY_CLASSES,
} from '@/lib/config';
import { SUCCESS_STATE_COLORS } from '@/lib/config/theme';
import { AUTH_ELEMENT_IDS } from '@/lib/config/element-ids';
import { triggerHapticFeedback } from '@/lib/utils';
import { isFocusedOnInput, PLATFORM } from '@/lib/dom-utils';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMac(PLATFORM.isMac());
  }, []);

  useEffect(() => {
    if (error) {
      emailInputRef.current?.focus();
    }
  }, [error]);

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

  const submitForm = useCallback(async () => {
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    await handleSubmit(fakeEvent);
  }, [handleSubmit]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (!isFocusedOnInput(e.target) || e.target === emailInputRef.current) {
          e.preventDefault();
          triggerHapticFeedback();
          submitForm();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [submitForm]);

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
        className={`${UI_CONFIG.ACCESSIBILITY.SKIP_LINK.BASE} ${UI_CONFIG.ACCESSIBILITY.SKIP_LINK.COLORS.BG} ${UI_CONFIG.ACCESSIBILITY.SKIP_LINK.COLORS.TEXT}`}
      >
        Skip to forgot password form
      </a>

      <div
        className={`${CONTAINER_WIDTHS.XS} w-full ${SPACE_Y_PATTERNS.XL} relative`}
      >
        {isLoading && (
          <div
            className={FORM_OVERLAY_STYLES.CONTAINER}
            aria-live="assertive"
            aria-label={FORM_ARIA_LABELS.FORGOT_PASSWORD_SUBMITTING}
          >
            <div className={FORM_OVERLAY_STYLES.SPINNER_CONTAINER}>
              <div className={FORM_OVERLAY_STYLES.SPINNER} />
              <span className={FORM_OVERLAY_STYLES.LOADING_TEXT}>
                Sending reset link...
              </span>
            </div>
          </div>
        )}
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
          id={AUTH_ELEMENT_IDS.FORGOT_PASSWORD_FORM}
          className={`mt-8 ${SPACE_Y_PATTERNS.LG} ${HERO_ENTRANCE}`}
          onSubmit={handleSubmit}
        >
          {error && (
            <Alert type="error" title="Error">
              {error}
            </Alert>
          )}

          <InputWithValidation
            ref={emailInputRef}
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
            onEnterPress={submitForm}
          />

          <div className={SPACE_Y_PATTERNS.SM}>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="lg"
              enableTransition
              shortcut={isMac ? ['⌘', 'Enter'] : ['Ctrl', 'Enter']}
            >
              {isLoading ? 'Sending...' : 'Send reset link'}
            </Button>
            <p
              className={`text-xs ${TEXT_COLOR_CLASSES.BODY} text-center hidden sm:block`}
              aria-hidden="true"
            >
              Press{' '}
              <kbd
                className={`px-1.5 py-0.5 ${GRAY_CLASSES.BG_100} ${GRAY_CLASSES.TEXT_600} rounded text-xs font-mono`}
              >
                {isMac ? '⌘' : 'Ctrl'}
              </kbd>
              {' + '}
              <kbd
                className={`px-1.5 py-0.5 ${GRAY_CLASSES.BG_100} ${GRAY_CLASSES.TEXT_600} rounded text-xs font-mono`}
              >
                Enter
              </kbd>
              {' to submit'}
            </p>
          </div>
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
