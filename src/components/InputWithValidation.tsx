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
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useAnnouncement } from '@/hooks/useAnnouncement';
import {
  INPUT_STYLES,
  TEXT_COLORS,
  TEXT_COLOR_CLASSES,
  BG_COLORS,
  BG_COLOR_CLASSES,
  SIZES,
  SVG_ANIMATION,
  SVG_SIZES,
  ANIMATION_DELAYS,
  STATE_SHADOWS,
  INPUT_VALIDATION_LABELS,
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  INPUT_HEIGHT_CLASSES,
  TRANSITION_CLASSES,
  PROGRESS_BAR_A11Y,
  DURATION_TAILWIND,
  CHAR_COUNT_COLORS,
  DRAW_CHECK,
  COMPONENT_STATE_COLORS,
  ICON_SIZES,
  SPACE_Y_PATTERNS,
  FLEX_PATTERNS,
  PROGRESS_PERCENTAGE,
  TYPOGRAPHY_UTILITY_PATTERNS,
  TYPOGRAPHY_CLASSES,
  SHAKE,
  INPUT_VALID_CELEBRATION,
  PLACEHOLDER_BREATHE,
  FOCUS_RING_GLOW,
  FADE_IN,
  COUNTER_PULSE,
  COUNTER_GLOW,
} from '@/lib/config';
import { FOCUS_RING_OFFSET_PATTERNS } from '@/lib/config/focus-ring-offsets';
import { UI_CONFIG } from '@/lib/config/constants';
import { COMPONENT_CONFIG } from '@/lib/config';
import { RIGHT_CLASSES, TOP_CLASSES } from '@/lib/config/positioning';
import {
  INPUT_BUTTON_SIZES,
  PROGRESS_BAR_SIZES,
} from '@/lib/config/icon-sizes';
import { triggerHapticFeedback } from '@/lib/utils';
import { PLATFORM } from '@/lib/dom-utils';
import {
  PASSWORD_VISIBLE_TINT,
  VALID_CHECKMARK_COLOR,
} from '@/lib/config/remaining-hardcoded-patterns';
import {
  SR_ONLY,
  RELATIVE,
  POINTER_EVENTS_NONE,
} from '@/lib/config/remaining-hardcoded-patterns';
import { useClipboard } from '@/hooks/useClipboard';
import Tooltip from './Tooltip';
import StatusAnnouncer from './StatusAnnouncer';

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

function getCharCountColor(count: number, max: number): string {
  const ratio = Math.min(count / max, 1.2);
  const { THRESHOLDS } = CHAR_COUNT_COLORS;
  if (ratio > 1) return CHAR_COUNT_COLORS.OVER_LIMIT;
  if (ratio >= THRESHOLDS.WARNING_START) {
    const t = (ratio - THRESHOLDS.WARNING_START) / THRESHOLDS.WARNING_RANGE;
    const r = Math.round(
      CHAR_COUNT_COLORS.WARNING_START.r +
        t *
          (CHAR_COUNT_COLORS.WARNING_END.r - CHAR_COUNT_COLORS.WARNING_START.r)
    );
    const g = Math.round(
      CHAR_COUNT_COLORS.WARNING_START.g -
        t *
          (CHAR_COUNT_COLORS.WARNING_START.g - CHAR_COUNT_COLORS.WARNING_END.g)
    );
    const b = Math.round(
      CHAR_COUNT_COLORS.WARNING_START.b -
        t *
          (CHAR_COUNT_COLORS.WARNING_START.b - CHAR_COUNT_COLORS.WARNING_END.b)
    );
    return `rgb(${r}, ${g}, ${b})`;
  }
  if (ratio >= THRESHOLDS.SUCCESS_START) {
    const t = (ratio - THRESHOLDS.SUCCESS_START) / THRESHOLDS.SUCCESS_RANGE;
    const r = Math.round(
      CHAR_COUNT_COLORS.SUCCESS_START.r +
        t *
          (CHAR_COUNT_COLORS.WARNING_START.r -
            CHAR_COUNT_COLORS.SUCCESS_START.r)
    );
    const g = Math.round(
      CHAR_COUNT_COLORS.SUCCESS_START.g -
        t *
          (CHAR_COUNT_COLORS.SUCCESS_START.g -
            CHAR_COUNT_COLORS.WARNING_START.g)
    );
    const b = Math.round(
      CHAR_COUNT_COLORS.SUCCESS_START.b -
        t *
          (CHAR_COUNT_COLORS.SUCCESS_START.b -
            CHAR_COUNT_COLORS.WARNING_START.b)
    );
    return `rgb(${r}, ${g}, ${b})`;
  }
  if (count > 0) return CHAR_COUNT_COLORS.NORMAL;
  return CHAR_COUNT_COLORS.EMPTY;
}

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
    const [shouldShake, setShouldShake] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [passwordCopied, setPasswordCopied] = useState(false);
    const [showSuccessFlash, setShowSuccessFlash] = useState(false);
    const [showValidCelebration, setShowValidCelebration] = useState(false);
    const [isMac, setIsMac] = useState(false);
    const internalTextareaRef = useRef<HTMLTextAreaElement>(null);
    const prevValidRef = useRef(false);
    const prefersReducedMotion = usePrefersReducedMotion();
    const currentValue = typeof value === 'string' ? value : '';
    const charCount = currentValue.length;
    const isValid = !error && touched;
    const isInvalid = !!error && touched;

    const { announced: errorAnnounced } = useAnnouncement(isInvalid, {
      useMicrotask: true,
    });
    const { announced: successAnnounced } = useAnnouncement(
      isValid && charCount > 0,
      { useMicrotask: true }
    );

    const handlePasswordCopied = useCallback(() => {
      setPasswordCopied(true);
    }, []);

    const { copy: copyPassword } = useClipboard({
      onCopy: handlePasswordCopied,
    });

    // Micro-UX: Detect platform for keyboard shortcut display
    useEffect(() => {
      setIsMac(PLATFORM.isMac());
    }, []);

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

    const {
      onBlur: propOnBlur,
      onFocus: propOnFocus,
      onKeyDown: propOnKeyDown,
    } = props;

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setTouched(true);
        setIsFocused(false);
        if (propOnBlur) {
          propOnBlur(
            e as React.FocusEvent<HTMLInputElement & HTMLTextAreaElement>
          );
        }
      },
      [propOnBlur]
    );

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setIsFocused(true);
        if (propOnFocus) {
          propOnFocus(
            e as React.FocusEvent<HTMLInputElement & HTMLTextAreaElement>
          );
        }
      },
      [propOnFocus]
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

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && onEnterPress) {
          e.preventDefault();
          onEnterPress();
        }
        if (
          e.key === 'Escape' &&
          clearable &&
          charCount > 0 &&
          !props.disabled
        ) {
          e.preventDefault();
          handleClear();
        }
        if (
          showPasswordToggle &&
          (e.metaKey || e.ctrlKey) &&
          e.shiftKey &&
          e.key === 'P'
        ) {
          e.preventDefault();
          triggerHapticFeedback();
          setPasswordVisible((prev) => !prev);
        }
        if (propOnKeyDown) {
          propOnKeyDown(
            e as React.KeyboardEvent<HTMLInputElement & HTMLTextAreaElement>
          );
        }
      },
      [
        onEnterPress,
        showPasswordToggle,
        clearable,
        charCount,
        props.disabled,
        handleClear,
        propOnKeyDown,
      ]
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
        }, COMPONENT_CONFIG.INPUT_VALIDATION.SUCCESS_FLASH_DURATION_MS);
        return () => clearTimeout(timeout);
      }
    }, [isValid, charCount]);

    useEffect(() => {
      if (
        isValid &&
        !prevValidRef.current &&
        charCount > 0 &&
        !prefersReducedMotion
      ) {
        setShowValidCelebration(true);
        const timeout = setTimeout(() => {
          setShowValidCelebration(false);
        }, COMPONENT_CONFIG.INPUT_VALIDATION.CELEBRATION_HIDE_MS);
        return () => clearTimeout(timeout);
      }
      prevValidRef.current = isValid && charCount > 0;
    }, [isValid, charCount, prefersReducedMotion]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (isInvalid) {
          setTouched(false);
        }
        onChange?.(e);
      },
      [onChange, isInvalid]
    );

    const showClearButton = clearable && charCount > 0 && !props.disabled;

    const hasIcon = (isValid && charCount > 0) || isInvalid;

    const paddingClass =
      hasIcon && showClearButton
        ? INPUT_STYLES.ICON_PADDING.DOUBLE
        : hasIcon || showClearButton
          ? INPUT_STYLES.ICON_PADDING.SINGLE
          : INPUT_STYLES.ICON_PADDING.NONE;

    const baseInputClasses = cn(
      INPUT_STYLES.BASE,
      isInvalid ? INPUT_STYLES.ERROR : INPUT_STYLES.NORMAL,
      paddingClass,
      shouldShake && SHAKE,
      showSuccessFlash &&
        `${COMPONENT_STATE_COLORS.INPUT_SUCCESS.FLASH} ${STATE_SHADOWS.SUCCESS}`,
      showValidCelebration && INPUT_VALID_CELEBRATION,
      isFocused && !currentValue.trim() && PLACEHOLDER_BREATHE,
      // Micro-UX: Subtle amber background tint when password is visible
      // Provides clear visual feedback that password text is exposed
      passwordVisible &&
        showPasswordToggle &&
        inputType === 'password' &&
        `${PASSWORD_VISIBLE_TINT} transition-colors ${DURATION_TAILWIND[300]}`,
      className
    );

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
      <div className={SPACE_Y_PATTERNS.SM}>
        <label
          htmlFor={props.id}
          className={`block ${TYPOGRAPHY_CLASSES.SM_MEDIUM} ${TEXT_COLOR_CLASSES.HEADING} cursor-pointer`}
        >
          {label}
          {props.required && (
            <span className={`${TEXT_COLORS.ERROR} ml-1`} aria-hidden="true">
              *
            </span>
          )}
        </label>

        <div className={RELATIVE}>
          {multiline ? (
            <textarea
              ref={setTextareaRef}
              id={props.id}
              value={value}
              onChange={handleChange}
              className={`${baseInputClasses} ${isFocused ? FOCUS_RING_GLOW : ''} ${textareaResizeClass} ${INPUT_HEIGHT_CLASSES.TEXTAREA} overflow-hidden`}
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
              onBlur={handleBlur}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              id={props.id}
              value={value}
              onChange={handleChange}
              className={`${baseInputClasses} ${isFocused ? FOCUS_RING_GLOW : ''}`}
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
              onBlur={handleBlur}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
            />
          )}

          {isValid && charCount > 0 && (
            <div
              className={`absolute ${RIGHT_CLASSES.LG} ${multiline ? TOP_CLASSES.LG : 'top-1/2 -translate-y-1/2'} pointer-events-none`}
            >
              <Tooltip
                content={`${label} is valid`}
                position="top"
                disabled={false}
              >
                <div className={POINTER_EVENTS_NONE}>
                  <svg
                    className={`${ICON_SIZES.LG} ${VALID_CHECKMARK_COLOR} animate-in ${FADE_IN} ${TRANSITION_CLASSES.DEFAULT} ${DRAW_CHECK}`}
                    fill="none"
                    viewBox={SVG_VIEWBOX.STANDARD}
                    stroke="currentColor"
                    strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
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
              className={`absolute ${RIGHT_CLASSES.LG} ${multiline ? TOP_CLASSES.LG : 'top-1/2 -translate-y-1/2'} pointer-events-none`}
            >
              <Tooltip
                content={INPUT_VALIDATION_LABELS.FIX_ERROR_TOOLTIP}
                position="top"
                disabled={false}
              >
                <div className={POINTER_EVENTS_NONE}>
                  <svg
                    className={`${ICON_SIZES.LG} ${TEXT_COLORS.ERROR} animate-in ${FADE_IN} ${TRANSITION_CLASSES.DEFAULT}`}
                    fill="none"
                    viewBox={SVG_VIEWBOX.STANDARD}
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
                </div>
              </Tooltip>
            </div>
          )}

          {showClearButton && (
            <div
              className={`absolute ${multiline ? TOP_CLASSES.LG : 'top-1/2 -translate-y-1/2'} ${hasIcon || showPasswordToggle ? RIGHT_CLASSES.XXXXL : RIGHT_CLASSES.LG}`}
            >
              <Tooltip
                content={`Clear ${label}`}
                shortcut={['Esc']}
                position="top"
              >
                <button
                  type="button"
                  onClick={handleClear}
                  className={`${INPUT_BUTTON_SIZES.CLEAR_BUTTON} flex items-center justify-center ${TEXT_COLOR_CLASSES.MUTED} ${TEXT_COLOR_CLASSES.HOVER_MUTED} rounded-full ${BG_COLOR_CLASSES.HOVER_SUBTLE} ${TRANSITION_CLASSES.DEFAULT_EASE_OUT} ${FOCUS_RING_OFFSET_PATTERNS.DEFAULT} animate-in ${FADE_IN} zoom-in ${TRANSITION_CLASSES.DEFAULT} disabled:opacity-0`}
                  aria-label={`Clear ${label}`}
                >
                  <svg
                    className={SVG_SIZES.SMD}
                    fill="none"
                    viewBox={SVG_VIEWBOX.STANDARD}
                    stroke="currentColor"
                    strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
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
            <>
              <StatusAnnouncer
                message={INPUT_VALIDATION_LABELS.COPY_PASSWORD_TOAST}
                triggered={passwordCopied}
              />
              {passwordVisible && currentValue && (
                <div
                  className={`absolute ${multiline ? TOP_CLASSES.LG : 'top-1/2 -translate-y-1/2'} ${hasIcon || showClearButton ? RIGHT_CLASSES.XXXXXL_XL : RIGHT_CLASSES.XXXXXL_LG}`}
                >
                  <Tooltip
                    content={INPUT_VALIDATION_LABELS.COPY_PASSWORD_TOOLTIP}
                    shortcut={isMac ? ['⌘', 'C'] : ['Ctrl', 'C']}
                    position="top"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        triggerHapticFeedback();
                        copyPassword(currentValue);
                      }}
                      className={`flex items-center gap-1.5 px-2 py-1.5 ${TEXT_COLOR_CLASSES.BODY} ${TEXT_COLOR_CLASSES.HOVER_HEADING} rounded-md ${BG_COLOR_CLASSES.HOVER_SUBTLE} ${TRANSITION_CLASSES.DEFAULT_EASE_OUT} ${FOCUS_RING_OFFSET_PATTERNS.DEFAULT} animate-in ${FADE_IN} zoom-in ${TRANSITION_CLASSES.DEFAULT}`}
                      aria-label={INPUT_VALIDATION_LABELS.COPY_PASSWORD_ARIA}
                    >
                      <span
                        className={
                          TYPOGRAPHY_UTILITY_PATTERNS.XS_MEDIUM_TABULAR
                        }
                      >
                        {passwordCopied
                          ? INPUT_VALIDATION_LABELS.COPY_PASSWORD_SUCCESS
                          : INPUT_VALIDATION_LABELS.COPY_PASSWORD}
                      </span>
                      <span className={`relative inline-flex ${SVG_SIZES.SMD}`}>
                        <svg
                          className={`${SVG_SIZES.SMD} ${TRANSITION_CLASSES.DEFAULT} ${passwordCopied ? TEXT_COLORS.SUCCESS_DARK : ''}`}
                          fill="none"
                          viewBox={SVG_VIEWBOX.STANDARD}
                          stroke="currentColor"
                          strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                          aria-hidden="true"
                        >
                          {passwordCopied ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          ) : (
                            <>
                              <rect
                                x="9"
                                y="9"
                                width="13"
                                height="13"
                                rx="2"
                                ry="2"
                              />
                              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                            </>
                          )}
                        </svg>
                      </span>
                    </button>
                  </Tooltip>
                </div>
              )}
              <div
                className={`absolute ${multiline ? TOP_CLASSES.LG : 'top-1/2 -translate-y-1/2'} ${hasIcon || showClearButton ? RIGHT_CLASSES.XXXXXL_MD : RIGHT_CLASSES.XXXXL_SM}`}
              >
                <Tooltip
                  content={
                    passwordVisible
                      ? INPUT_VALIDATION_LABELS.HIDE_PASSWORD_ARIA
                      : INPUT_VALIDATION_LABELS.SHOW_PASSWORD_ARIA
                  }
                  shortcut={INPUT_VALIDATION_LABELS.TOGGLE_PASSWORD_SHORTCUT(
                    isMac
                  )}
                  position="top"
                >
                  <button
                    type="button"
                    onClick={() => {
                      triggerHapticFeedback();
                      setPasswordVisible(!passwordVisible);
                    }}
                    className={`flex items-center gap-1.5 px-2 py-1.5 ${TEXT_COLOR_CLASSES.BODY} ${TEXT_COLOR_CLASSES.HOVER_HEADING} rounded-md ${BG_COLOR_CLASSES.HOVER_SUBTLE} ${TRANSITION_CLASSES.DEFAULT_EASE_OUT} ${FOCUS_RING_OFFSET_PATTERNS.DEFAULT} animate-in ${FADE_IN} zoom-in ${TRANSITION_CLASSES.DEFAULT}`}
                    aria-label={
                      passwordVisible
                        ? INPUT_VALIDATION_LABELS.HIDE_PASSWORD_ARIA
                        : INPUT_VALIDATION_LABELS.SHOW_PASSWORD_ARIA
                    }
                  >
                    <span
                      className={TYPOGRAPHY_UTILITY_PATTERNS.XS_MEDIUM_TABULAR}
                    >
                      {passwordVisible
                        ? INPUT_VALIDATION_LABELS.HIDE_PASSWORD
                        : INPUT_VALIDATION_LABELS.SHOW_PASSWORD}
                    </span>
                    <span className={`relative inline-flex ${SVG_SIZES.SMD}`}>
                      {/* Eye icon (show state) - fades/slides out when toggling to hidden */}
                      <svg
                        className={`absolute inset-0 ${SVG_SIZES.SMD} ${TRANSITION_CLASSES.SLOW_EASE_OUT} ${
                          passwordVisible
                            ? 'opacity-100 scale-100 rotate-0'
                            : 'opacity-0 scale-75 -rotate-45'
                        }`}
                        fill="none"
                        viewBox={SVG_VIEWBOX.STANDARD}
                        stroke="currentColor"
                        strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
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
                      {/* Eye-slash icon (hide state) - fades/slides in when toggling to visible */}
                      <svg
                        className={`absolute inset-0 ${SVG_SIZES.SMD} ${TRANSITION_CLASSES.SLOW_EASE_OUT} ${
                          passwordVisible
                            ? 'opacity-0 scale-75 rotate-45'
                            : 'opacity-100 scale-100 rotate-0'
                        }`}
                        fill="none"
                        viewBox={SVG_VIEWBOX.STANDARD}
                        stroke="currentColor"
                        strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    </span>
                  </button>
                </Tooltip>
              </div>
            </>
          )}
        </div>

        <div className={FLEX_PATTERNS.BETWEEN_START}>
          <div>
            {helpText && !isInvalid && (
              <p
                id={`${props.id}-help`}
                className={`text-sm ${TEXT_COLOR_CLASSES.BODY}`}
              >
                {helpText}
              </p>
            )}
            {isValid && successAnnounced && charCount > 0 && (
              <div role="status" aria-live="polite">
                <p id={`${props.id}-success`} className={SR_ONLY}>
                  {label} is valid
                </p>
              </div>
            )}
            {isInvalid && errorAnnounced && (
              <div role="alert" aria-live="assertive">
                <p
                  id={`${props.id}-error`}
                  className={`text-sm ${TEXT_COLORS.ERROR}`}
                >
                  {error}
                </p>
              </div>
            )}
          </div>

          {showCharCount && (
            <div className={FLEX_PATTERNS.GAP_MD}>
              {maxLength && (
                <div
                  className={`${PROGRESS_BAR_SIZES.INPUT_VALIDATION} ${BG_COLORS.PROGRESS_NEUTRAL} rounded-full overflow-hidden relative`}
                  role="progressbar"
                  aria-valuenow={charCount}
                  aria-valuemin={PROGRESS_BAR_A11Y.VALUE_MIN}
                  aria-valuemax={maxLength}
                  aria-label={INPUT_VALIDATION_LABELS.CHAR_LIMIT_PROGRESS_ARIA}
                >
                  <div
                    className={`h-full ${TRANSITION_CLASSES.SLOW} rounded-full ${
                      charCount > maxLength
                        ? `${BG_COLORS.ERROR} ${COUNTER_PULSE}`
                        : charCount >=
                            maxLength * UI_CONFIG.CHAR_COUNT_WARNING_THRESHOLD
                          ? `${BG_COLORS.WARNING} ${COUNTER_GLOW}`
                          : charCount >=
                              maxLength *
                                (UI_CONFIG.CHAR_COUNT_WARNING_THRESHOLD * 0.7)
                            ? BG_COLORS.WARNING
                            : BG_COLORS.SUCCESS
                    }`}
                    style={{
                      width: `${Math.min((charCount / maxLength) * PROGRESS_PERCENTAGE.MAX, PROGRESS_PERCENTAGE.MAX)}%`,
                    }}
                  />
                </div>
              )}
              <span
                className={`${TYPOGRAPHY_CLASSES.SM_MEDIUM} transition-colors ${DURATION_TAILWIND[300]} ease-out ${
                  maxLength && charCount > maxLength ? COUNTER_PULSE : ''
                }`}
                style={
                  maxLength
                    ? {
                        color: getCharCountColor(charCount, maxLength),
                      }
                    : undefined
                }
                aria-live="polite"
                aria-atomic="true"
              >
                {charCount}
                {maxLength && ` / ${maxLength}`}
              </span>
            </div>
          )}
          {showCharCount && maxLength && charCount > 0 && (
            <div
              className={`text-xs transition-all ${DURATION_TAILWIND[300]} ease-out ${
                maxLength - charCount <= maxLength * 0.1
                  ? `${TEXT_COLORS.ERROR} font-medium`
                  : maxLength - charCount <= maxLength * 0.2
                    ? `${TEXT_COLORS.WARNING} font-medium`
                    : TEXT_COLOR_CLASSES.MUTED
              }`}
              aria-live="polite"
              aria-atomic="true"
            >
              {maxLength - charCount <= maxLength * 0.1
                ? INPUT_VALIDATION_LABELS.CHAR_LIMIT_WARNING(
                    maxLength - charCount
                  )
                : maxLength - charCount <= maxLength * 0.2
                  ? INPUT_VALIDATION_LABELS.CHAR_LIMIT_WARNING(
                      maxLength - charCount
                    )
                  : null}
            </div>
          )}
        </div>
      </div>
    );
  }
);

InputWithValidationComponent.displayName = 'InputWithValidation';

export default memo(InputWithValidationComponent);
