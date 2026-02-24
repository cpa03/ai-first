'use client';

import React, { forwardRef, useState, useEffect, useCallback, memo } from 'react';
import { cn } from '@/lib/utils';
import {
  INPUT_STYLES,
  TEXT_COLORS,
  BG_COLORS,
  SIZES,
  SVG_ANIMATION,
  ANIMATION_DELAYS,
} from '@/lib/config';
import { UI_LEGACY_CONFIG as UI_CONFIG } from '@/lib/config/constants';

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
      className = '',
      value = '',
      onChange,
      ...props
    },
    ref
  ) => {
    const [touched, setTouched] = useState(false);
    const [errorAnnounced, setErrorAnnounced] = useState(false);
    const [shouldShake, setShouldShake] = useState(false);
    const internalTextareaRef = React.useRef<HTMLTextAreaElement>(null);
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
    }, []);

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

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange?.(e);
      },
      [onChange]
    );

    const handleClear = useCallback(() => {
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
      className
    );

    const errorAnnouncedRef = React.useRef(errorAnnounced);

    useEffect(() => {
      errorAnnouncedRef.current = errorAnnounced;
    }, [errorAnnounced]);

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
              className={`${baseInputClasses} ${textareaResizeClass} min-h-[100px] overflow-hidden`}
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
              className={baseInputClasses}
              type={props.type || 'text'}
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
              <svg
                className="w-5 h-5 text-green-500 animate-in fade-in duration-200 animate-draw-check"
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
          )}

          {isInvalid && (
            <div
              className={`absolute right-3 ${multiline ? 'top-3' : 'top-1/2 -translate-y-1/2'} pointer-events-none`}
            >
              <svg
                className="w-5 h-5 text-red-500 animate-in fade-in duration-200"
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
          )}

          {showClearButton && (
            <button
              type="button"
              onClick={handleClear}
              className={`
                absolute ${multiline ? 'top-3' : 'top-1/2 -translate-y-1/2'}
                w-5 h-5 flex items-center justify-center
                text-gray-400 hover:text-gray-600
                rounded-full hover:bg-gray-100
                transition-all duration-200 ease-out
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
                animate-in fade-in zoom-in duration-200
                disabled:opacity-0
                ${hasIcon ? 'right-10' : 'right-3'}
              `}
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
          )}
        </div>

        <div className="flex justify-between items-start">
          <div>
            {helpText && !isInvalid && (
              <p id={`${props.id}-help`} className="text-sm text-gray-600">
                {helpText}
              </p>
            )}
            {isInvalid && (
              <div role="alert" aria-live="assertive">
                <p id={`${props.id}-error`} className="text-sm text-red-600">
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
