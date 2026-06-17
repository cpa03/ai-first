'use client';

import React, {
  forwardRef,
  useState,
  useEffect,
  useCallback,
  useRef,
  memo,
} from 'react';
import { cn } from '@/lib/utils';
import {
  INPUT_STYLES,
  TEXT_COLORS,
  BG_COLORS,
  SIZES,
  SVG_ANIMATION,
  ANIMATION_DELAYS,
} from '@/lib/config';
import { UI_CONFIG } from '@/lib/config/constants';
import { triggerHapticFeedback } from '@/lib/utils';
import Tooltip from './Tooltip';

export interface InputWithValidationProps extends React.InputHTMLAttributes<
  HTMLInputElement | HTMLTextAreaElement
> {
  label: string;
  error?: string;
  helpText?: string;
  showCharCount?: boolean;
  minLength?: number;
  maxLength?: number;
  multiline?: boolean;
  autoResize?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  /** Shows a toggle button to show/hide password text */
  showPasswordToggle?: boolean;
  /** Callback fired when Enter key is pressed - useful for password fields to enable quick form submission */
  onEnterPress?: () => void;
}

const MIN_TEXTAREA_HEIGHT = SIZES.TEXTAREA.MIN_HEIGHT;

const InputWithValidationComponent = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputWithValidationProps
>(
  (
    {
      label,
      error,
      helpText,
      showCharCount = false,
      minLength: _minLength,
      maxLength,
      multiline = false,
      autoResize = true,
      clearable = false,
      onClear,
      showPasswordToggle = false,
      onEnterPress,
      className = '',
      value = '',
      onChange,
      type: inputType,
      ...props
    },
    ref
  ) => {
    const [touched, setTouched] = useState(false);
    const [errorAnnounced, setErrorAnnounced] = useState(false);
    const [shouldShake, setShouldShake] = useState(false);
    const [successAnnounced, setSuccessAnnounced] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [showSuccessFlash, setShowSuccessFlash] = useState(false);
    const internalTextareaRef = useRef<HTMLTextAreaElement>(null);
    const currentValue = typeof value === 'string' ? value : '';
    const charCount = currentValue.length;
    const isValid = !error && touched;
    const isInvalid = !!error && touched;

    const adjustTextareaHeight = useCallback(() => {
      const textarea = internalTextareaRef.current;
      if (!textarea || !multiline || !autoResize) return;

      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const height = Math.max(scrollHeight, MIN_TEXTAREA_HEIGHT);
      textarea.style.height = `${height}px`;
    }, [multiline, autoResize]);

    useEffect(() => {
      if (multiline && autoResize) {
        requestAnimationFrame(adjustTextareaHeight);
      }
    }, [currentValue, multiline, autoResize, adjustTextareaHeight]);

    const handleBlur = useCallback(() => {
      setTouched(true);
      setIsFocused(false);
    }, []);

    const handleFocus = useCallback(() => {
      setIsFocused(true);
    }, []);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && onEnterPress) {
          e.preventDefault();
          onEnterPress();
        }
      },
      [onEnterPress]
    );

    // Trigger shake animation when validation error appears
    useEffect(() => {
      if (isInvalid) {
        setShouldShake(true);
        const timeout = setTimeout(() => {
          setShouldShake(false);
        }, ANIMATION_DELAYS.SHAKE);
        return () => clearTimeout(timeout);
      }
    }, [isInvalid, error]);

    useEffect(() => {
      if (isValid && charCount > 0) {
        setShowSuccessFlash(true);
        const timeout = setTimeout(() => {
          setShowSuccessFlash(false);
        }, 1500);
        return () => clearTimeout(timeout);
      }
    }, [isValid, charCount]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange?.(e);
      },
      [onChange]
    );

    const handleClear = useCallback(() => {
      triggerHapticFeedback();
      const emptyValueEvent = {
        target: { value: '', name: props.name, id: props.id },
        currentTarget: { value: '', name: props.name, id: props.id },
        preventDefault: () => {},
        stopPropagation: () => {},
      } as React.ChangeEvent<HTMLInputElement>;

      onChange?.(emptyValueEvent);
      onClear?.();

      const focusTarget = multiline
        ? internalTextareaRef.current
        : ref && 'current' in ref
          ? (ref.current as HTMLInputElement)
          : null;
      focusTarget?.focus();
    }, [onChange, onClear, props.name, props.id, multiline, ref]);

    const showClearButton = clearable && charCount > 0 && !props.disabled;

    const hasIcon = (isValid && charCount > 0) || isInvalid;

    // Calculate padding based on which icons are visible
    // Each icon needs ~40px (pr-10), so both need ~80px (pr-20)
    const paddingClass =
      hasIcon && showClearButton
        ? 'pr-20'
        : hasIcon || showClearButton
          ? 'pr-10'
          : '';

    const baseInputClasses = cn(
      INPUT_STYLES.BASE,
      isInvalid ? INPUT_STYLES.ERROR : INPUT_STYLES.NORMAL,
      paddingClass,
      shouldShake && 'animate-shake',
      showSuccessFlash &&
        'border-green-500 ring-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.2)]',
      className
    );

    const errorAnnouncedRef = React.useRef(errorAnnounced);
    const successAnnouncedRef = React.useRef(successAnnounced);

    useEffect(() => {
      errorAnnouncedRef.current = errorAnnounced;
    }, [errorAnnounced]);

    useEffect(() => {
      successAnnouncedRef.current = successAnnounced;
    }, [successAnnounced]);

    useEffect(() => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      if (isInvalid && !errorAnnouncedRef.current) {
        timeoutId = setTimeout(
          () => setErrorAnnounced(true),
          ANIMATION_DELAYS.IMMEDIATE
        );
      } else if (!isInvalid && errorAnnouncedRef.current) {
        timeoutId = setTimeout(
          () => setErrorAnnounced(false),
          ANIMATION_DELAYS.IMMEDIATE
        );
      }

      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }, [isInvalid]);

    useEffect(() => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      if (isValid && !successAnnouncedRef.current && charCount > 0) {
        timeoutId = setTimeout(
          () => setSuccessAnnounced(true),
          ANIMATION_DELAYS.IMMEDIATE
        );
      } else if (!isValid && successAnnouncedRef.current) {
        timeoutId = setTimeout(
          () => setSuccessAnnounced(false),
          ANIMATION_DELAYS.IMMEDIATE
        );
      }

      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }, [isValid, charCount]);

    const setTextareaRef = (element: HTMLTextAreaElement | null) => {
      (
        internalTextareaRef as React.MutableRefObject<HTMLTextAreaElement | null>
      ).current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current =
          element;
      }
    };

    const textareaResizeClass =
      multiline && autoResize ? 'resize-none' : 'resize-y';

    return (
      <div className="space-y-2">
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-gray-900 cursor-pointer"
        >
          {label}
          {props.required && (
            <span className={`${TEXT_COLORS.ERROR} ml-1`} aria-hidden="true">
              *
            </span>
          )}
        </label>

        <div className="relative">
          {multiline ? (
            <textarea
              ref={setTextareaRef}
              id={props.id}
              value={value}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              className={`${baseInputClasses} ${isFocused ? 'animate-focus-ring' : ''} ${textareaResizeClass} min-h-[100px] overflow-hidden`}
              aria-invalid={isInvalid}
              aria-required={props.required}
              aria-describedby={
                error
                  ? `${props.id}-error`
                  : helpText
                    ? `${props.id}-help`
                    : undefined
              }
              {...props}
            />
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              id={props.id}
              value={value}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              className={`${baseInputClasses} ${isFocused ? 'animate-focus-ring' : ''}`}
              type={
                showPasswordToggle && inputType === 'password'
                  ? passwordVisible
                    ? 'text'
                    : 'password'
                  : inputType || 'text'
              }
              aria-invalid={isInvalid}
              aria-required={props.required}
              aria-describedby={
                error
                  ? `${props.id}-error`
                  : helpText
                    ? `${props.id}-help`
                    : undefined
              }
              {...props}
            />
          )}

          {isValid && charCount > 0 && (
            <div
              className={`absolute right-3 ${multiline ? 'top-3' : 'top-1/2 -translate-y-1/2'} pointer-events-none`}
            >
              <Tooltip
                content={`${label} is valid`}
                position="top"
                disabled={false}
              >
                <div className="pointer-events-none">
                  <svg
                    className="w-5 h-5 text-green-800 animate-in fade-in duration-200 animate-draw-check"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                      style={{
                        strokeDasharray: SVG_ANIMATION.DASH_ARRAY.FULL,
                        strokeDashoffset: SVG_ANIMATION.DASH_OFFSET.HIDDEN,
                      }}
                    />
                  </svg>
                </div>
              </Tooltip>
            </div>
          )}

          {isInvalid && (
            <div
              className={`absolute right-3 ${multiline ? 'top-3' : 'top-1/2 -translate-y-1/2'} pointer-events-none`}
            >
              <Tooltip
                content="Please fix this error"
                position="top"
                disabled={false}
              >
                <div className="pointer-events-none">
                  <svg
                    className="w-5 h-5 text-red-700 animate-in fade-in duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </Tooltip>
            </div>
          )}

          {showClearButton && (
            <div
              className={`absolute ${multiline ? 'top-3' : 'top-1/2 -translate-y-1/2'} ${hasIcon || showPasswordToggle ? 'right-12' : 'right-3'}`}
            >
              <Tooltip content={`Clear ${label}`} position="top">
                <button
                  type="button"
                  onClick={handleClear}
                  className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 animate-in fade-in zoom-in duration-200 disabled:opacity-0"
                  aria-label={`Clear ${label}`}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </Tooltip>
            </div>
          )}

          {showPasswordToggle && !multiline && (
            <div
              className={`absolute ${multiline ? 'top-3' : 'top-1/2 -translate-y-1/2'} ${hasIcon || showClearButton ? 'right-20' : 'right-14'}`}
            >
              <Tooltip
                content={passwordVisible ? 'Hide password' : 'Show password'}
                position="top"
              >
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback();
                    setPasswordVisible(!passwordVisible);
                  }}
                  className="flex items-center gap-1.5 px-2 py-1.5 text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 animate-in fade-in zoom-in duration-200"
                  aria-label={
                    passwordVisible ? 'Hide password' : 'Show password'
                  }
                >
                  <span className="text-xs font-medium tabular-nums">
                    {passwordVisible ? 'Hide' : 'Show'}
                  </span>
                  {passwordVisible ? (
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </Tooltip>
            </div>
          )}
        </div>

        <div className="flex justify-between items-start">
          <div>
            {helpText && !isInvalid && (
              <p id={`${props.id}-help`} className="text-sm text-gray-600">
                {helpText}
              </p>
            )}
            {isValid && successAnnounced && charCount > 0 && (
              <div role="status" aria-live="polite">
                <p id={`${props.id}-success`} className="sr-only">
                  {label} is valid
                </p>
              </div>
            )}
            {isInvalid && (
              <div role="alert" aria-live="assertive">
                <p id={`${props.id}-error`} className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            )}
          </div>

          {showCharCount && (
            <div className="flex items-center gap-2">
              {maxLength && (
                <div
                  className={`w-16 h-1.5 ${BG_COLORS.PROGRESS_NEUTRAL} rounded-full overflow-hidden relative`}
                  role="progressbar"
                  aria-valuenow={charCount}
                  aria-valuemin={0}
                  aria-valuemax={maxLength}
                  aria-label="Character limit progress"
                >
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      charCount > maxLength
                        ? `${BG_COLORS.ERROR} animate-counter-pulse`
                        : charCount >=
                            maxLength * UI_CONFIG.CHAR_COUNT_WARNING_THRESHOLD
                          ? `${BG_COLORS.WARNING} animate-counter-glow`
                          : charCount >=
                              maxLength *
                                (UI_CONFIG.CHAR_COUNT_WARNING_THRESHOLD * 0.7)
                            ? BG_COLORS.WARNING
                            : BG_COLORS.SUCCESS
                    }`}
                    style={{
                      width: `${Math.min((charCount / maxLength) * 100, 100)}%`,
                    }}
                  />
                </div>
              )}
              <span
                className={`text-sm font-medium transition-all duration-300 ${
                  maxLength && charCount > maxLength
                    ? `${TEXT_COLORS.ERROR} animate-counter-pulse`
                    : maxLength &&
                        charCount >=
                          maxLength * UI_CONFIG.CHAR_COUNT_WARNING_THRESHOLD
                      ? `${TEXT_COLORS.WARNING} scale-110`
                      : maxLength &&
                          charCount >=
                            maxLength *
                              (UI_CONFIG.CHAR_COUNT_WARNING_THRESHOLD * 0.7)
                        ? TEXT_COLORS.WARNING
                        : isValid && touched
                          ? TEXT_COLORS.SUCCESS
                          : TEXT_COLORS.SECONDARY
                }`}
                aria-live="polite"
                aria-atomic="true"
              >
                {charCount}
                {maxLength && ` / ${maxLength}`}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

InputWithValidationComponent.displayName = 'InputWithValidation';

export default memo(InputWithValidationComponent);
