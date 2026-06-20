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
import { RIPPLE_CONFIG, BUTTON_STYLES } from '@/lib/config';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  attention?: boolean;
  /** Shows a subtle animation when button transitions from disabled to enabled */
  enableTransition?: boolean;
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
    const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
    const wasDisabledRef = useRef(disabled || loading);
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
      const timeouts = timeoutRefs.current;
      return () => {
        timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      };
    }, []);

    useEffect(() => {
      const isCurrentlyDisabled = disabled || loading;
      const wasDisabled = wasDisabledRef.current;

      if (wasDisabled && !isCurrentlyDisabled && enableTransition) {
        setJustEnabled(true);
        const timeoutId = setTimeout(() => {
          setJustEnabled(false);
        }, 600);
        timeoutRefs.current.push(timeoutId);
      }

      wasDisabledRef.current = isCurrentlyDisabled;
    }, [disabled, loading, enableTransition]);

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

        const rippleId = `ripple-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const newRipple: Ripple = {
          id: rippleId,
          x,
          y,
          size,
        };

        setRipples((prev) => [...prev, newRipple]);

        const timeoutId = setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== rippleId));
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

    return (
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
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 inline-block"
            xmlns="http://www.w3.org/2000/svg"
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
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
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
  }
);

ButtonComponent.displayName = 'Button';

const Button = memo(ButtonComponent);

export default Button;
