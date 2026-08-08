'use client';

import {
  ButtonHTMLAttributes,
  forwardRef,
  memo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  RIPPLE_CONFIG,
  BUTTON_STYLES,
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  SVG_NAMESPACE,
  COMPONENT_CONFIG,
  BUTTON_RIPPLE,
  SVG_CIRCLE,
} from '@/lib/config';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { PLATFORM } from '@/lib/dom-utils';
import Tooltip from './Tooltip';

/**
 * Module-level auto-incrementing counter for generating high-performance unique
 * IDs for transient button ripple visual effects without the heavy CPU/entropy
 * overhead of cryptographically secure ID generation (such as `generateId()`).
 */
let rippleIdCounter = 0;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  attention?: boolean;
  /** Shows a subtle animation when button transitions from disabled to enabled */
  enableTransition?: boolean;
  /** Optional loading message to display next to the spinner (e.g., "Saving...", "Submitting...") */
  loadingText?: string;
  /**
   * Micro-UX: Delay before showing the loading spinner (in ms).
   * Prevents visual flickering for fast-loading operations (< 300ms).
   * If the loading state completes before this delay, no spinner is shown at all.
   * @default 0
   */
  showDelay?: number;
  /** Optional tooltip text to display when button is disabled, explaining why it's disabled */
  disabledTooltip?: string;
  /** Optional keyboard shortcut keys to display in tooltip (e.g. ['⌘', 'S']) */
  shortcut?: string[];
  children: React.ReactNode;
}

interface Ripple {
  id: string;
  x: number;
  y: number;
  size: number;
}

const ButtonComponent = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      attention = false,
      enableTransition = false,
      loadingText,
      showDelay = 0,
      disabledTooltip,
      shortcut,
      disabled,
      children,
      className = '',
      onClick,
      onKeyDown,
      ...restProps
    },
    ref
  ) => {
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const [justEnabled, setJustEnabled] = useState(false);
    const [isMac, setIsMac] = useState(false);
    const [shouldShowSpinner, setShouldShowSpinner] = useState(showDelay === 0);
    const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
    const wasDisabledRef = useRef(disabled || loading);
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
      setIsMac(PLATFORM.isMac());
    }, []);

    useEffect(() => {
      return () => {
        timeoutRefs.current.forEach((timeoutId) => clearTimeout(timeoutId));
        timeoutRefs.current = [];
      };
    }, []);

    useEffect(() => {
      const isCurrentlyDisabled = disabled || loading;
      const wasDisabled = wasDisabledRef.current;

      if (wasDisabled && !isCurrentlyDisabled && enableTransition) {
        setJustEnabled(true);
        const timeoutId = setTimeout(() => {
          setJustEnabled(false);
        }, COMPONENT_CONFIG.BUTTON.ANIMATION.ENABLE_TRANSITION_DURATION_MS);
        timeoutRefs.current.push(timeoutId);
      }

      wasDisabledRef.current = isCurrentlyDisabled;
    }, [disabled, loading, enableTransition]);

    useEffect(() => {
      if (showDelay <= 0 || !loading) {
        setShouldShowSpinner(showDelay === 0);
        return;
      }

      const timer = setTimeout(() => {
        setShouldShowSpinner(true);
      }, showDelay);

      return () => clearTimeout(timer);
    }, [loading, showDelay]);

    const createRipple = useCallback(
      (
        event:
          | React.MouseEvent<HTMLButtonElement>
          | React.KeyboardEvent<HTMLButtonElement>
      ) => {
        const isKeyboardEvent = event.type === 'keydown';

        if (isKeyboardEvent) {
          const keyboardEvent = event as React.KeyboardEvent<HTMLButtonElement>;
          if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
            keyboardEvent.preventDefault();
            onClick?.(
              keyboardEvent as unknown as React.MouseEvent<HTMLButtonElement>
            );
          } else {
            return;
          }
        } else {
          onClick?.(event as React.MouseEvent<HTMLButtonElement>);
        }

        if (disabled || loading || prefersReducedMotion) return;

        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);

        let x: number, y: number;
        if (isKeyboardEvent) {
          x = rect.width / 2 - size / 2;
          y = rect.height / 2 - size / 2;
        } else {
          const mouseEvent = event as React.MouseEvent<HTMLButtonElement>;
          x = mouseEvent.clientX - rect.left - size / 2;
          y = mouseEvent.clientY - rect.top - size / 2;
        }

        // PERFORMANCE (⚡ Bolt): Use an incrementing counter instead of `generateId()`
        // to avoid expensive cryptographic random UUID generation overhead during user click events.
        const rippleId = `ripple-${Date.now()}-${rippleIdCounter++}`;
        const newRipple: Ripple = {
          id: rippleId,
          x,
          y,
          size,
        };

        setRipples((prev) => [...prev, newRipple]);

        const timeoutId = setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== rippleId));
          timeoutRefs.current = timeoutRefs.current.filter(
            (id) => id !== timeoutId
          );
        }, RIPPLE_CONFIG.DURATION_MS);
        timeoutRefs.current.push(timeoutId);
      },
      [disabled, loading, onClick, prefersReducedMotion]
    );

    // Handle keyboard activation for ripple effect
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
          createRipple(event);
        }
        onKeyDown?.(event);
      },
      [createRipple, onKeyDown]
    );

    const stateClasses =
      disabled || loading
        ? BUTTON_STYLES.STATES.disabled
        : BUTTON_STYLES.STATES.enabled;

    const buttonElement = (
      <button
        ref={ref}
        disabled={disabled || loading}
        onClick={createRipple}
        onKeyDown={handleKeyDown}
        className={`
          ${BUTTON_STYLES.VARIANTS[variant]}
          ${BUTTON_STYLES.SIZES[size]}
          ${fullWidth ? 'w-full' : ''}
          ${stateClasses}
          ${BUTTON_STYLES.BASE} ${BUTTON_STYLES.FOCUS_RINGS[variant]}
          ${attention && !disabled && !loading ? 'btn-attention-pulse' : ''}
          ${justEnabled && !prefersReducedMotion ? 'animate-enable-feedback' : ''}
          ${className}
        `}
        aria-busy={loading}
        {...restProps}
      >
        {loading && shouldShowSpinner && (
          <svg
            className={`${prefersReducedMotion ? '' : 'animate-spin'} -ml-1 mr-2 h-4 w-4 inline-block`}
            xmlns={SVG_NAMESPACE.SVG}
            fill="none"
            viewBox={SVG_VIEWBOX.STANDARD}
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx={SVG_CIRCLE.CX_24}
              cy={SVG_CIRCLE.CY_24}
              r={SVG_CIRCLE.R_10}
              stroke="currentColor"
              strokeWidth={SVG_STROKE_WIDTHS.SPINNER}
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {loading && shouldShowSpinner && loadingText ? loadingText : children}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className={BUTTON_RIPPLE}
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
            aria-hidden="true"
          />
        ))}
      </button>
    );

    const displayShortcut = shortcut?.map((key) => {
      if (key === '⌘') return isMac ? '⌘' : 'Ctrl';
      return key;
    });

    if (disabled && disabledTooltip) {
      return (
        <Tooltip content={disabledTooltip} position="top">
          {buttonElement}
        </Tooltip>
      );
    }

    if (displayShortcut && displayShortcut.length > 0) {
      return (
        <Tooltip content="" shortcut={displayShortcut} position="top">
          {buttonElement}
        </Tooltip>
      );
    }

    return buttonElement;
  }
);

ButtonComponent.displayName = 'Button';

const Button = memo(ButtonComponent);

export default Button;
