'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { supabaseClient } from '@/lib/db';
import { useCapsLock } from '@/hooks/useCapsLock';
import {
  OAUTH_PROVIDER_COLORS,
  LOCAL_STORAGE_KEYS,
  API_ERROR_MESSAGES,
  ROUTES,
  LOGIN_PAGE_CONTENT,
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  LOGIN_ERROR_PATTERNS,
  matchesPattern,
  PASSWORD_VALIDATION_CONFIG,
  PAGE_LAYOUT_CLASSES,
  CONTAINER_WIDTHS,
  TEXT_COLOR_CLASSES,
  TYPOGRAPHY_CLASSES,
  SPACING_CLASSES,
  LAYOUT_CLASSES,
  LOGIN_PAGE_CONFIG,
  UI_CONFIG,
  VALIDATION_CONFIG,
  DURATION_TAILWIND,
  FORM_OVERLAY_STYLES,
  FORM_ARIA_LABELS,
  DRAW_CHECK,
  FORM_PATTERNS,
  GRAY_CLASSES,
  ICON_SIZES,
  DASHBOARD_PATTERNS,
  KBD_HINT_STYLE,
  SPACE_Y_PATTERNS,
  GAP_CLASSES,
  HERO_ENTRANCE,
  REMAINING_PATTERNS,
  RESPONSIVE_FLEX_PATTERNS,
} from '@/lib/config';
import { AUTH_ELEMENT_IDS } from '@/lib/config/element-ids';
import {
  RELATIVE,
  PEER_SR_ONLY,
  JUSTIFY_CENTER,
  DISABLED_CURSOR,
} from '@/lib/config/remaining-hardcoded-patterns';
import { triggerHapticFeedback } from '@/lib/utils';
import { useScrollToError } from '@/hooks/useScrollToError';
import { isFocusedOnInput, PLATFORM } from '@/lib/dom-utils';
import { useKeyboardShortcuts } from '@/components/KeyboardShortcutsProvider';

// Dynamic imports for code splitting - reduce initial bundle size
// SSR enabled to prevent CLS (Cumulative Layout Shift) - components render on server
const Button = dynamic(() => import('@/components/Button'));
const InputWithValidation = dynamic(
  () => import('@/components/InputWithValidation')
);
const Alert = dynamic(() => import('@/components/Alert'));
const CapsLockWarning = dynamic(() =>
  import('@/components/CapsLockWarning').then((mod) => mod.CapsLockWarning)
);

export default function LoginPage() {
  const { scrollToError } = useScrollToError();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState<string | undefined>(
    undefined
  );
  const [isMac, setIsMac] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Micro-UX: Keyboard shortcuts help
  const { openHelp } = useKeyboardShortcuts();

  // Micro-UX: Detect platform for keyboard shortcut display
  useEffect(() => {
    setIsMac(PLATFORM.isMac());
  }, []);
  const {
    isCapsLockOn: isPasswordCapsLockOn,
    handleKeyDown: handlePasswordKeyDown,
    handleKeyUp: handlePasswordKeyUp,
    handleBlur: handlePasswordBlur,
  } = useCapsLock();

  // Micro-UX: Compute form validity for submit button attention pulse
  // Shows a subtle animation when form is valid and ready to submit, guiding users to the CTA
  const isFormValid = useMemo(() => {
    const trimmedEmail = email.trim();
    return (
      trimmedEmail.length > 0 &&
      VALIDATION_CONFIG.COMMON_REGEX.EMAIL.test(trimmedEmail) &&
      password.length >= PASSWORD_VALIDATION_CONFIG.MIN_LENGTH
    );
  }, [email, password]);

  useEffect(() => {
    const savedEmail = localStorage.getItem(
      LOCAL_STORAGE_KEYS.REMEMBERED_EMAIL
    );
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (emailError) {
      emailInputRef.current?.focus();
    } else if (passwordError) {
      passwordInputRef.current?.focus();
    }
  }, [emailError, passwordError]);

  const validateForm = useCallback((): boolean => {
    setEmailError(undefined);
    setPasswordError(undefined);
    setError(null);

    const trimmedEmail = email.trim();

    if (
      !trimmedEmail ||
      !VALIDATION_CONFIG.COMMON_REGEX.EMAIL.test(trimmedEmail)
    ) {
      setEmailError(LOGIN_PAGE_CONTENT.ERRORS.INVALID_EMAIL);
      requestAnimationFrame(() => scrollToError());
      return false;
    }

    if (password.length < PASSWORD_VALIDATION_CONFIG.MIN_LENGTH) {
      setPasswordError(LOGIN_PAGE_CONTENT.ERRORS.PASSWORD_TOO_SHORT);
      requestAnimationFrame(() => scrollToError());
      return false;
    }

    return true;
  }, [email, password, scrollToError]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) return;

      setIsLoading(true);
      setError(null);

      try {
        if (!supabaseClient) {
          throw new Error(API_ERROR_MESSAGES.PAGE.AUTH_SERVICE_UNAVAILABLE);
        }

        const { error: signInError } =
          await supabaseClient.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (signInError) {
          throw signInError;
        }

        if (rememberMe) {
          localStorage.setItem(
            LOCAL_STORAGE_KEYS.REMEMBERED_EMAIL,
            email.trim()
          );
        } else {
          localStorage.removeItem(LOCAL_STORAGE_KEYS.REMEMBERED_EMAIL);
        }

        router.push(ROUTES.DASHBOARD);
        router.refresh();
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : LOGIN_PAGE_CONTENT.ERRORS.SIGN_IN_FAILED;

        if (
          matchesPattern(errorMessage, LOGIN_ERROR_PATTERNS.INVALID) ||
          errorMessage.toLowerCase().includes('credentials')
        ) {
          setError(LOGIN_PAGE_CONTENT.ERRORS.INVALID_CREDENTIALS);
        } else {
          setError(errorMessage || LOGIN_PAGE_CONTENT.ERRORS.SIGN_IN_FAILED);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [validateForm, router, email, password, rememberMe]
  );

  const submitForm = useCallback(async () => {
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    await handleSubmit(fakeEvent);
  }, [handleSubmit]);

  const handleOAuthSignIn = useCallback(
    async (provider: 'google' | 'github') => {
      setOauthLoading(provider);
      setError(null);

      try {
        if (!supabaseClient) {
          throw new Error(API_ERROR_MESSAGES.PAGE.AUTH_SERVICE_UNAVAILABLE);
        }

        const { error: oauthError } = await supabaseClient.auth.signInWithOAuth(
          {
            provider,
            options: {
              redirectTo: `${window.location.origin}${ROUTES.AUTH_CALLBACK}`,
            },
          }
        );

        if (oauthError) {
          throw oauthError;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : `${LOGIN_PAGE_CONTENT.ERRORS.OAUTH_FAILED_PREFIX} ${provider}`;
        setError(
          errorMessage ||
            `${LOGIN_PAGE_CONTENT.ERRORS.OAUTH_FAILED_PREFIX} ${provider}${LOGIN_PAGE_CONTENT.ERRORS.OAUTH_FAILED_SUFFIX}`
        );
        setOauthLoading(null);
      }
    },
    []
  );

  // Micro-UX: Cmd/Ctrl+Enter keyboard shortcut for form submission
  // Matches the pattern of IdeaInput (⌘Enter) and ClarificationFlow (⌘Enter)
  // Provides quick keyboard access for power users without needing to click the submit button
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (
          !isFocusedOnInput(e.target) ||
          e.target === emailInputRef.current ||
          e.target === passwordInputRef.current
        ) {
          e.preventDefault();
          triggerHapticFeedback();
          submitForm();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [submitForm]);

  return (
    <div className={PAGE_LAYOUT_CLASSES.AUTH_CONTAINER}>
      {/* Micro-UX: Skip to content link for keyboard users - improves accessibility */}
      <a
        href="#login-form"
        className={`${UI_CONFIG.ACCESSIBILITY.SKIP_LINK.BASE} ${UI_CONFIG.ACCESSIBILITY.SKIP_LINK.COLORS.BG} ${UI_CONFIG.ACCESSIBILITY.SKIP_LINK.COLORS.TEXT}`}
      >
        Skip to login form
      </a>

      <div
        className={`${CONTAINER_WIDTHS.XS} w-full ${SPACE_Y_PATTERNS.XXL} relative`}
      >
        {/* Micro-UX: Submitting overlay prevents double-clicks and provides clear visual feedback */}
        {/* Shows subtle overlay with spinner when form is being submitted */}
        {isLoading && (
          <div
            className={FORM_OVERLAY_STYLES.CONTAINER}
            aria-live="assertive"
            aria-label={FORM_ARIA_LABELS.LOGIN_SUBMITTING}
          >
            <div className={FORM_OVERLAY_STYLES.SPINNER_CONTAINER}>
              <div className={FORM_OVERLAY_STYLES.SPINNER} />
              <span className={FORM_OVERLAY_STYLES.LOADING_TEXT}>
                Signing in...
              </span>
            </div>
          </div>
        )}
        <div className={`${LAYOUT_CLASSES.TEXT_CENTER} ${HERO_ENTRANCE}`}>
          <h1
            className={`${TYPOGRAPHY_CLASSES.PAGE_HEADING} ${TEXT_COLOR_CLASSES.HEADING}`}
          >
            {LOGIN_PAGE_CONTENT.HEADING}
          </h1>
          <p
            className={`${SPACING_CLASSES.TOP_SMALL} ${TYPOGRAPHY_CLASSES.SMALL} ${TEXT_COLOR_CLASSES.BODY} ${HERO_ENTRANCE} ${LOGIN_PAGE_CONFIG.HERO_ANIMATION_DELAYS.STEP_1}`}
          >
            {LOGIN_PAGE_CONTENT.SUBHEADING}
          </p>
        </div>

        <form
          id={AUTH_ELEMENT_IDS.LOGIN_FORM}
          className={`mt-8 ${SPACE_Y_PATTERNS.XL} ${HERO_ENTRANCE} ${LOGIN_PAGE_CONFIG.HERO_ANIMATION_DELAYS.STEP_2}`}
          onSubmit={handleSubmit}
        >
          {error && (
            <Alert type="error" title={LOGIN_PAGE_CONTENT.ERRORS.TITLE}>
              {error}
            </Alert>
          )}

          <div className={SPACE_Y_PATTERNS.LG}>
            <InputWithValidation
              ref={emailInputRef}
              id="email"
              name="email"
              type="email"
              label={LOGIN_PAGE_CONTENT.FORM.EMAIL_LABEL}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
              disabled={isLoading}
              required
              autoComplete="email"
              onEnterPress={submitForm}
              autoFocus
            />

            <div className={SPACE_Y_PATTERNS.SM_MD}>
              <InputWithValidation
                ref={passwordInputRef}
                id="password"
                name="password"
                type="password"
                label={LOGIN_PAGE_CONTENT.FORM.PASSWORD_LABEL}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handlePasswordKeyDown}
                onKeyUp={handlePasswordKeyUp}
                onBlur={handlePasswordBlur}
                error={passwordError}
                disabled={isLoading}
                required
                autoComplete="current-password"
                placeholder={LOGIN_PAGE_CONTENT.FORM.PASSWORD_PLACEHOLDER}
                showPasswordToggle
                onEnterPress={submitForm}
              />
              <CapsLockWarning isOn={isPasswordCapsLockOn} />
            </div>
          </div>

          <div className={RESPONSIVE_FLEX_PATTERNS.BETWEEN}>
            <div className={RESPONSIVE_FLEX_PATTERNS.BETWEEN}>
              <label
                htmlFor={AUTH_ELEMENT_IDS.REMEMBER_ME}
                className={`flex items-center ${GAP_CLASSES.MD_LG} cursor-pointer group`}
              >
                <span className={RELATIVE}>
                  <input
                    id={AUTH_ELEMENT_IDS.REMEMBER_ME}
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => {
                      setRememberMe(e.target.checked);
                      if (e.target.checked) {
                        triggerHapticFeedback();
                      }
                    }}
                    className={PEER_SR_ONLY}
                    disabled={isLoading}
                  />
                  <span
                    className={`
                      ${FORM_PATTERNS.CHECKBOX_BASE}
                      ${rememberMe ? FORM_PATTERNS.CHECKBOX_CHECKED : FORM_PATTERNS.CHECKBOX_UNCHECKED}
                      ${isLoading ? DISABLED_CURSOR : ''}
                    `}
                    aria-hidden="true"
                  >
                    {rememberMe && (
                      <svg
                        className={`${ICON_SIZES.MD_SM} text-white ${DRAW_CHECK}`}
                        fill="none"
                        viewBox={SVG_VIEWBOX.STANDARD}
                        stroke="currentColor"
                        strokeWidth={SVG_STROKE_WIDTHS.THICK}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </span>
                </span>
                <span
                  className={`text-sm transition-colors ${DURATION_TAILWIND[200]} ${rememberMe ? FORM_PATTERNS.REMEMBER_ME_ACTIVE : FORM_PATTERNS.REMEMBER_ME_INACTIVE}`}
                >
                  {LOGIN_PAGE_CONTENT.FORM.REMEMBER_ME}
                </span>
              </label>
            </div>
            <div className={REMAINING_PATTERNS.FORM_TEXT_SIZES.SM}>
              <Link
                href={ROUTES.FORGOT_PASSWORD}
                className={FORM_PATTERNS.AUTH_LINK}
              >
                {LOGIN_PAGE_CONTENT.FORM.FORGOT_PASSWORD}
              </Link>
            </div>
          </div>

          <div className={SPACE_Y_PATTERNS.SM}>
            <Button
              type="submit"
              disabled={isLoading}
              className={REMAINING_PATTERNS.FORM_WIDTH.FULL}
              size="lg"
              enableTransition
              attention={isFormValid && !isLoading}
              shortcut={isMac ? ['⌘', 'Enter'] : ['Ctrl', 'Enter']}
            >
              {isLoading
                ? LOGIN_PAGE_CONTENT.FORM.SUBMIT_LOADING
                : LOGIN_PAGE_CONTENT.FORM.SUBMIT_BUTTON}
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

        <div
          className={`relative ${HERO_ENTRANCE} ${LOGIN_PAGE_CONFIG.HERO_ANIMATION_DELAYS.STEP_3}`}
        >
          <div className={RESPONSIVE_FLEX_PATTERNS.CENTER}>
            <div className={FORM_PATTERNS.OAUTH_SEPARATOR_LINE} />
          </div>
          <div
            className={`relative ${RESPONSIVE_FLEX_PATTERNS.JUSTIFY_CENTER} text-sm`}
          >
            <span className={FORM_PATTERNS.OAUTH_SEPARATOR_TEXT}>
              {LOGIN_PAGE_CONTENT.OAUTH.SEPARATOR}
            </span>
          </div>
        </div>

        <div
          className={`grid grid-cols-2 gap-3 ${HERO_ENTRANCE} ${LOGIN_PAGE_CONFIG.HERO_ANIMATION_DELAYS.STEP_4}`}
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthSignIn('google')}
            disabled={oauthLoading !== null}
            loading={oauthLoading === 'google'}
            loadingText={LOGIN_PAGE_CONTENT.OAUTH.GOOGLE_LOADING}
            enableTransition
            className={JUSTIFY_CENTER}
          >
            {oauthLoading !== 'google' && (
              <svg
                className={`${ICON_SIZES.LG} mr-2`}
                viewBox={SVG_VIEWBOX.STANDARD}
              >
                <path
                  fill={OAUTH_PROVIDER_COLORS.GOOGLE.BLUE}
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill={OAUTH_PROVIDER_COLORS.GOOGLE.GREEN}
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill={OAUTH_PROVIDER_COLORS.GOOGLE.YELLOW}
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill={OAUTH_PROVIDER_COLORS.GOOGLE.RED}
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {LOGIN_PAGE_CONTENT.OAUTH.GOOGLE_ARIA_LABEL}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthSignIn('github')}
            disabled={oauthLoading !== null}
            loading={oauthLoading === 'github'}
            loadingText={LOGIN_PAGE_CONTENT.OAUTH.GITHUB_LOADING}
            enableTransition
            className={JUSTIFY_CENTER}
          >
            {oauthLoading !== 'github' && (
              <svg
                className={`${ICON_SIZES.LG} mr-2`}
                fill="currentColor"
                viewBox={SVG_VIEWBOX.SMALL}
              >
                <path
                  fillRule="evenodd"
                  d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {LOGIN_PAGE_CONTENT.OAUTH.GITHUB_ARIA_LABEL}
          </Button>
        </div>

        <p
          className={`${FORM_PATTERNS.AUTH_FOOTER_TEXT} ${HERO_ENTRANCE} ${LOGIN_PAGE_CONFIG.HERO_ANIMATION_DELAYS.STEP_5}`}
        >
          {LOGIN_PAGE_CONTENT.FOOTER.NO_ACCOUNT}{' '}
          <Link href={ROUTES.SIGNUP} className={FORM_PATTERNS.AUTH_LINK}>
            {LOGIN_PAGE_CONTENT.FOOTER.SIGN_UP}
          </Link>
        </p>

        <div className={DASHBOARD_PATTERNS.KEYBOARD_HINTS_BAR}>
          <div className={DASHBOARD_PATTERNS.KEYBOARD_HINTS_GROUP}>
            <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_ITEM}>
              <kbd className={KBD_HINT_STYLE}>?</kbd>
              <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_LABEL}>
                Shortcuts
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={openHelp}
            className={DASHBOARD_PATTERNS.VIEW_SHORTCUTS_BTN}
          >
            View all
          </button>
        </div>
      </div>
    </div>
  );
}
