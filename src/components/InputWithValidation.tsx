'use client';

import { forwardRef, useState } from 'react';

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
      minLength,
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
      w-full px-3 py-2 border rounded-md shadow-sm
      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
      transition-colors
      ${isInvalid ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}
      ${className}
    `;

    return (
      <div className="space-y-2">
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {multiline ? (
          <textarea
            ref={ref as React.RefObject<HTMLTextAreaElement>}
            id={props.id}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`${baseInputClasses} resize-y`}
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
            ref={ref as React.RefObject<HTMLInputElement>}
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
              <p
                id={`${props.id}-error`}
                className="text-sm text-red-600"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>

          {showCharCount && (
            <span
              className={`text-sm ${
                maxLength && charCount > maxLength
                  ? 'text-red-600'
                  : isValid && touched
                    ? 'text-green-600'
                    : 'text-gray-500'
              }`}
              aria-live="polite"
            >
              {charCount}
              {maxLength && ` / ${maxLength}`}
            </span>
          )}
        </div>
      </div>
    );
  }
);

InputWithValidation.displayName = 'InputWithValidation';

export default InputWithValidation;
