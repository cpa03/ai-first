'use client';

export default function Skeleton({
  className = '',
  variant = 'rect',
}: {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}) {
  const baseClasses = 'animate-pulse bg-gray-200';

  const variantClasses = {
    rect: '',
    circle: 'rounded-full',
    text: 'h-4 rounded',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      aria-hidden="true"
    />
  );
}
