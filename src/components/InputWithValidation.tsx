'use client';

import React, { forwardRef, useState, useEffect } from 'react';
import { UI_CONFIG } from '@/lib/config/constants';

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
}

const InputWithValidation = forwardRef<
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
      className = '',
      value = '',
      onChange,
      ...props
    },
    ref
  ) => {
    const [touched, setTouched] = useState(false);
    const [errorAnnounced, setErrorAnnounced] = useState(false);
    const currentValue = typeof value === 'string' ? value : '';
    const charCount = currentValue.length;
    const isValid = !error && touched;
    const isInvalid = !!error && touched;

    const handleBlur = () => {
      setTouched(true);
    };

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      onChange?.(e);
    };

    const baseInputClasses = `
      w-full px-4 py-3 border rounded-md shadow-sm
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white
      focus-visible:shadow-[0_0_0_3px_rgba(59,130,246,0.2)]
      transition-all duration-200
      ${
        isInvalid
          ? 'border-red-300 focus-visible:border-red-500 focus-visible:ring-red-500 focus-visible:shadow-[0_0_0_3px_rgba(239,68,68,0.2)]'
          : 'border-gray-300 focus-visible:border-primary-500 focus-visible:ring-primary-500'
      }
      ${className}
    `;

    // Using ref to track error announcement state changes without triggering cascading renders
    const errorAnnouncedRef = React.useRef(errorAnnounced);

    useEffect(() => {
      errorAnnouncedRef.current = errorAnnounced;
    }, [errorAnnounced]);

    useEffect(() => {
      if (isInvalid && !errorAnnouncedRef.current) {
        queueMicrotask(() => setErrorAnnounced(true));
      } else if (!isInvalid && errorAnnouncedRef.current) {
        queueMicrotask(() => setErrorAnnounced(false));
      }
    }, [isInvalid]);

    return (
      <div className="space-y-2">
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-gray-700 cursor-pointer"
        >
          {label}
          {props.required && (
            <span className="text-red-500 ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>

        {multiline ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={props.id}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`${baseInputClasses} resize-y min-h-[100px]`}
            aria-invalid={isInvalid}
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

        <div className="flex justify-between items-start">
          <div>
            {helpText && !isInvalid && (
              <p id={`${props.id}-help`} className="text-sm text-gray-500">
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
                  className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden"
                  aria-hidden="true"
                >
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      charCount > maxLength
                        ? 'bg-red-500'
                        : charCount >=
                            maxLength * UI_CONFIG.CHAR_COUNT_WARNING_THRESHOLD
                          ? 'bg-amber-500'
                          : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min((charCount / maxLength) * 100, 100)}%`,
                    }}
                  />
                </div>
              )}
              <span
                className={`text-sm ${
                  maxLength && charCount > maxLength
                    ? 'text-red-600'
                    : maxLength &&
                        charCount >=
                          maxLength * UI_CONFIG.CHAR_COUNT_WARNING_THRESHOLD
                      ? 'text-amber-600'
                      : isValid && touched
                        ? 'text-green-600'
                        : 'text-gray-500'
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

InputWithValidation.displayName = 'InputWithValidation';

export default InputWithValidation;
