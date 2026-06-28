'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabaseClient } from '@/lib/db';
import Button from '@/components/Button';
import InputWithValidation from '@/components/InputWithValidation';
import Alert from '@/components/Alert';
import { CapsLockWarning } from '@/components/CapsLockWarning';
import { useCapsLock } from '@/hooks/useCapsLock';
import {
  OAUTH_PROVIDER_COLORS,
  PASSWORD_VALIDATION_CONFIG,
  API_ERROR_MESSAGES,
  ROUTES,
  SIGNUP_PAGE_CONTENT,
  SVG_STROKE_WIDTHS,
} from '@/lib/config';

type PasswordStrength = 'empty' | 'weak' | 'medium' | 'strong';
type PasswordMatch = 'empty' | 'match' | 'mismatch';

interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number;
  requirements: {
    hasMinLength: boolean;
    hasUpperLower: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

interface PasswordMatchIndicatorProps {
  password: string;
  confirmPassword: string;
}

function PasswordMatchIndicator({
  password,
  confirmPassword,
}: PasswordMatchIndicatorProps) {
  const matchStatus: PasswordMatch = useMemo(() => {
    if (!confirmPassword) return 'empty';
    return password === confirmPassword ? 'match' : 'mismatch';
  }, [password, confirmPassword]);

  if (matchStatus === 'empty') return null;

  return (
    <div
      className={`flex items-center gap-2 text-sm transition-all duration-200 animate-fade-in ${
        matchStatus === 'match' ? 'text-green-700' : 'text-amber-600'
      }`}
      role="status"
      aria-live="polite"
    >
      {matchStatus === 'match' ? (
        <svg
          className="w-4 h-4 text-green-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )}
      <span className="text-xs font-medium">
        {matchStatus === 'match'
          ? SIGNUP_PAGE_CONTENT.PASSWORD_MATCH.MATCH
          : SIGNUP_PAGE_CONTENT.PASSWORD_MATCH.MISMATCH}
      </span>
    </div>
  );
}

function calculatePasswordStrength(password: string): PasswordStrengthResult {
  const { MIN_LENGTH, STRENGTH_THRESHOLDS } = PASSWORD_VALIDATION_CONFIG;
  const reqs = {
    hasMinLength: password.length >= MIN_LENGTH,
    hasUpperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^a-zA-Z0-9]/.test(password),
  };
  const score = Object.values(reqs).filter(Boolean).length +
    (password.length >= STRENGTH_THRESHOLDS.MEDIUM_LENGTH ? 1 : 0) +
    (password.length >= STRENGTH_THRESHOLDS.STRONG_LENGTH ? 1 : 0);
  let strength: PasswordStrength = 'weak';
  if (password.length === 0) strength = 'empty';
  else if (score >= 5) strength = 'strong';
  else if (score >= 3) strength = 'medium';
  return { strength, score, requirements: reqs };
}

const RequirementItem = ({ met, label }: { met: boolean; label: string }) => (
  <li className={`flex items-center gap-2 text-xs font-medium transition-colors ${met ? 'text-green-700' : 'text-gray-500'}`}>
    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${met ? 'bg-green-100 border-green-500 animate-success-pop' : 'bg-white border-gray-300'}`}>
      {met ? <svg className="w-2.5 h-2.5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={SVG_STROKE_WIDTHS.THICK}><path d="M5 13l4 4L19 7" /></svg> : <div className="w-1 h-1 bg-gray-300 rounded-full" />}
    </div>
    {label}
  </li>
);

function PasswordStrengthIndicator({ password }: { password: string }) {
  const { strength, requirements: reqs } = useMemo(() => calculatePasswordStrength(password), [password]);
  const { STRENGTH_COLORS, STRENGTH_LABELS, STRENGTH_TEXT_COLORS, MESSAGES } = PASSWORD_VALIDATION_CONFIG;
  const config = {
    empty: { label: '', color: 'bg-gray-200', textColor: '' },
    weak: { label: STRENGTH_LABELS.WEAK, color: STRENGTH_COLORS.WEAK, textColor: STRENGTH_TEXT_COLORS.WEAK },
    medium: { label: STRENGTH_LABELS.MEDIUM, color: STRENGTH_COLORS.MEDIUM, textColor: STRENGTH_TEXT_COLORS.MEDIUM },
    strong: { label: STRENGTH_LABELS.STRONG, color: STRENGTH_COLORS.STRONG, textColor: STRENGTH_TEXT_COLORS.STRONG },
  }[strength];
  if (strength === 'empty') return null;
  return (
    <div className="space-y-3 animate-hero-entrance delay-75">
      <div className="space-y-1.5">
        <div className="flex justify-between items-center"><span className="text-[10px] uppercase font-bold text-gray-500">Strength</span><span className={`text-xs font-bold ${config.textColor}`}>{config.label}</span></div>
        <div className="flex gap-1 h-1.5">{[1, 2, 3].map(s => <div key={s} className={`flex-1 rounded-full transition-all duration-500 ${(strength==='weak' && s==1) || (strength==='medium' && s<=2) || strength==='strong' ? config.color : 'bg-gray-200'}`} />)}</div>
      </div>
      <div className="bg-gray-50/50 rounded-lg p-3 border border-gray-100">
        <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Requirements</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2" aria-live="polite">
          <RequirementItem met={reqs.hasMinLength} label={MESSAGES.MIN_LENGTH} />
          <RequirementItem met={reqs.hasUpperLower} label={MESSAGES.UPPERCASE_LOWERCASE} />
          <RequirementItem met={reqs.hasNumber} label={MESSAGES.NUMBER} />
          <RequirementItem met={reqs.hasSpecial} label={MESSAGES.SPECIAL_CHARACTER} />
        </ul>
      </div>
    </div>
  );
}

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState<string | undefined>(
    undefined
  );

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);
  const {
    isCapsLockOn: isPasswordCapsLockOn,
    handleKeyDown: handlePasswordKeyDown,
    handleKeyUp: handlePasswordKeyUp,
    handleBlur: handlePasswordBlur,
  } = useCapsLock();
  const {
    isCapsLockOn: isConfirmPasswordCapsLockOn,
    handleKeyDown: handleConfirmPasswordKeyDown,
    handleKeyUp: handleConfirmPasswordKeyUp,
    handleBlur: handleConfirmPasswordBlur,
  } = useCapsLock();

  useEffect(() => {
    if (emailError) {
      emailInputRef.current?.focus();
    } else if (passwordError) {
      passwordInputRef.current?.focus();
    } else if (error && error.includes('match')) {
      confirmPasswordInputRef.current?.focus();
    }
  }, [emailError, passwordError, error]);

  const validateForm = useCallback((): boolean => {
    setEmailError(undefined);
    setPasswordError(undefined);
    setError(null);

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setEmailError(SIGNUP_PAGE_CONTENT.ERRORS.INVALID_EMAIL);
      return false;
    }

    if (password.length < 8) {
      setPasswordError(SIGNUP_PAGE_CONTENT.ERRORS.PASSWORD_TOO_SHORT);
      return false;
    }

    if (password !== confirmPassword) {
      setError(SIGNUP_PAGE_CONTENT.ERRORS.PASSWORDS_DO_NOT_MATCH);
      return false;
    }

    return true;
  }, [email, password, confirmPassword]);

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

        const { error: signUpError } = await supabaseClient.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${ROUTES.AUTH_CALLBACK}`,
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        setSuccess(true);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : SIGNUP_PAGE_CONTENT.ERRORS.CREATE_ACCOUNT_FAILED;
        setError(
          errorMessage || SIGNUP_PAGE_CONTENT.ERRORS.CREATE_ACCOUNT_FAILED_RETRY
        );
      } finally {
        setIsLoading(false);
      }
    },
    [validateForm, email, password]
  );

  const submitForm = useCallback(async () => {
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    await handleSubmit(fakeEvent);
  }, [handleSubmit]);

  const handleOAuthSignUp = useCallback(
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
            : `${SIGNUP_PAGE_CONTENT.ERRORS.OAUTH_FAILED_PREFIX} ${provider}`;
        setError(
          errorMessage ||
            `${SIGNUP_PAGE_CONTENT.ERRORS.OAUTH_FAILED_PREFIX} ${provider}${SIGNUP_PAGE_CONTENT.ERRORS.OAUTH_FAILED_SUFFIX}`
        );
        setOauthLoading(null);
      }
    },
    []
  );

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {SIGNUP_PAGE_CONTENT.SUCCESS.HEADING}
          </h2>
          <p className="text-gray-600">
            {SIGNUP_PAGE_CONTENT.SUCCESS.MESSAGE_PREFIX}{' '}
            <strong>{email}</strong>.{' '}
            {SIGNUP_PAGE_CONTENT.SUCCESS.MESSAGE_SUFFIX}
          </p>
          <Link
            href={ROUTES.LOGIN}
            className="inline-block font-medium text-primary-600 hover:text-primary-500"
          >
            {SIGNUP_PAGE_CONTENT.SUCCESS.RETURN_LINK}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center animate-hero-entrance">
          <h1 className="text-3xl font-bold text-gray-900">
            {SIGNUP_PAGE_CONTENT.HEADING}
          </h1>
          <p className="mt-2 text-sm text-gray-600 animate-hero-entrance delay-75">
            {SIGNUP_PAGE_CONTENT.SUBHEADING}
          </p>
        </div>

        <form
          className="mt-8 space-y-6 animate-hero-entrance delay-150"
          onSubmit={handleSubmit}
        >
          {error && (
            <Alert type="error" title={SIGNUP_PAGE_CONTENT.ERRORS.TITLE}>
              {error}
            </Alert>
          )}

          <div className="space-y-4">
            <InputWithValidation
              ref={emailInputRef}
              id="email"
              name="email"
              type="email"
              label={SIGNUP_PAGE_CONTENT.FORM.EMAIL_LABEL}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
              disabled={isLoading}
              required
              autoComplete="email"
              onEnterPress={submitForm}
              autoFocus
            />

            <InputWithValidation
              ref={passwordInputRef}
              id="password"
              name="password"
              type="password"
              label={SIGNUP_PAGE_CONTENT.FORM.PASSWORD_LABEL}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handlePasswordKeyDown}
              onKeyUp={handlePasswordKeyUp}
              onBlur={handlePasswordBlur}
              error={passwordError}
              disabled={isLoading}
              required
              autoComplete="new-password"
              helpText={SIGNUP_PAGE_CONTENT.FORM.PASSWORD_HELP_TEXT}
              showPasswordToggle
              onEnterPress={submitForm}
            />

            <CapsLockWarning isOn={isPasswordCapsLockOn} />

            {password && <PasswordStrengthIndicator password={password} />}

            <InputWithValidation
              ref={confirmPasswordInputRef}
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label={SIGNUP_PAGE_CONTENT.FORM.CONFIRM_PASSWORD_LABEL}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={handleConfirmPasswordKeyDown}
              onKeyUp={handleConfirmPasswordKeyUp}
              onBlur={handleConfirmPasswordBlur}
              disabled={isLoading}
              required
              autoComplete="new-password"
              placeholder={
                SIGNUP_PAGE_CONTENT.FORM.CONFIRM_PASSWORD_PLACEHOLDER
              }
              showPasswordToggle
              onEnterPress={submitForm}
            />

            <CapsLockWarning isOn={isConfirmPasswordCapsLockOn} />

            <PasswordMatchIndicator
              password={password}
              confirmPassword={confirmPassword}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading
              ? SIGNUP_PAGE_CONTENT.FORM.SUBMIT_LOADING
              : SIGNUP_PAGE_CONTENT.FORM.SUBMIT_BUTTON}
          </Button>
        </form>

        <div className="relative animate-hero-entrance delay-200">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-600">
              {SIGNUP_PAGE_CONTENT.OAUTH.SEPARATOR}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 animate-hero-entrance delay-250">
          <button
            onClick={() => handleOAuthSignUp('google')}
            disabled={oauthLoading !== null}
            aria-label={
              oauthLoading === 'google'
                ? SIGNUP_PAGE_CONTENT.OAUTH.GOOGLE_LOADING_ARIA_LABEL
                : SIGNUP_PAGE_CONTENT.OAUTH.GOOGLE_ARIA_LABEL
            }
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden transition-all duration-200"
          >
            {oauthLoading === 'google' && (
              <span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"
                aria-hidden="true"
              />
            )}
            {oauthLoading === 'google' ? (
              <svg
                className="h-5 w-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth={SVG_STROKE_WIDTHS.SPINNER}
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
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
            {oauthLoading === 'google'
              ? SIGNUP_PAGE_CONTENT.OAUTH.GOOGLE_LOADING
              : SIGNUP_PAGE_CONTENT.OAUTH.GOOGLE}
          </button>

          <button
            onClick={() => handleOAuthSignUp('github')}
            disabled={oauthLoading !== null}
            aria-label={
              oauthLoading === 'github'
                ? SIGNUP_PAGE_CONTENT.OAUTH.GITHUB_LOADING_ARIA_LABEL
                : SIGNUP_PAGE_CONTENT.OAUTH.GITHUB_ARIA_LABEL
            }
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden transition-all duration-200"
          >
            {oauthLoading === 'github' && (
              <span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"
                aria-hidden="true"
              />
            )}
            {oauthLoading === 'github' ? (
              <svg
                className="h-5 w-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth={SVG_STROKE_WIDTHS.SPINNER}
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {oauthLoading === 'github'
              ? SIGNUP_PAGE_CONTENT.OAUTH.GITHUB_LOADING
              : SIGNUP_PAGE_CONTENT.OAUTH.GITHUB}
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 animate-hero-entrance delay-300">
          {SIGNUP_PAGE_CONTENT.FOOTER.HAS_ACCOUNT}{' '}
          <Link
            href={ROUTES.LOGIN}
            className="font-medium text-primary-600 hover:text-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded"
          >
            {SIGNUP_PAGE_CONTENT.FOOTER.SIGN_IN}
          </Link>
        </p>
      </div>
    </div>
  );
}
