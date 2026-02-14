'use client';

import { ButtonHTMLAttributes, forwardRef, useState, useCallback } from 'react';

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

const variantClasses = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
  outline:
    'border border-gray-700 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
  ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
};

const focusRingClasses = {
  primary: 'focus-visible:ring-primary-500',
  secondary: 'focus-visible:ring-gray-500',
  outline: 'focus-visible:ring-gray-500',
  ghost: 'focus-visible:ring-gray-500',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm min-h-[36px]',
  md: 'px-4 py-2 text-base min-h-[44px]',
  lg: 'px-6 py-3 text-lg min-h-[48px]',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
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

        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
        }, 600);

        onClick?.(event);
      },
      [disabled, loading, onClick, rippleIdCounter]
    );

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        onClick={createRipple}
        className={`
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          rounded-md font-medium transition-all duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${focusRingClasses[variant]} focus-visible:ring-offset-white
          motion-reduce:hover:scale-100 motion-reduce:active:scale-100 hover:scale-[1.02] active:scale-[0.98]
          relative overflow-hidden
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

Button.displayName = 'Button';

export default Button;
