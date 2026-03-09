'use client';

import {
  ButtonHTMLAttributes,
  forwardRef,
  memo,
  useState,
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
} from 'react';
import { RIPPLE_CONFIG, BUTTON_STYLES } from '@/lib/config';

// Custom hook to subscribe to prefers-reduced-motion media query
// This properly updates when OS accessibility settings change during runtime
const subscribeToMotionPreference = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
};

const getMotionSnapshot = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const getServerMotionSnapshot = () => false;

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToMotionPreference,
    getMotionSnapshot,
    getServerMotionSnapshot
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  attention?: boolean;
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
      disabled,
      children,
      className = '',
      onClick,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
      const timeouts = timeoutRefs.current;
      return () => {
        timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      };
    }, []);

    const createRipple = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);

        if (disabled || loading || prefersReducedMotion) return;

        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        // Generate unique ID for ripple - prevents unbounded counter growth
        // Using timestamp + random string ensures uniqueness without state
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
          ${attention && !disabled && !loading ? 'btn-attention-pulse' : ''}
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
