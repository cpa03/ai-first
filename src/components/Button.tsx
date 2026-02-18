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

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

interface Ripple {
  id: number;
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
      disabled,
      children,
      className = '',
      onClick,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const [rippleIdCounter, setRippleIdCounter] = useState(0);
    const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
      const timeouts = timeoutRefs.current;
      return () => {
        timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      };
    }, []);

    const createRipple = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || loading) return;

        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const newRipple: Ripple = {
          id: rippleIdCounter,
          x,
          y,
          size,
        };

        setRipples((prev) => [...prev, newRipple]);
        setRippleIdCounter((prev) => prev + 1);

        const timeoutId = setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
        }, RIPPLE_CONFIG.DURATION_MS);
        timeoutRefs.current.push(timeoutId);

        onClick?.(event);
      },
      [disabled, loading, onClick, rippleIdCounter]
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
        className={`
          ${BUTTON_STYLES.VARIANTS[variant]}
          ${BUTTON_STYLES.SIZES[size]}
          ${fullWidth ? 'w-full' : ''}
          ${stateClasses}
          ${BUTTON_STYLES.BASE} ${BUTTON_STYLES.FOCUS_RINGS[variant]}
          ${className}
        `}
        aria-busy={loading}
        {...props}
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
