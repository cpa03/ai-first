'use client';

import LoadingSpinner from './LoadingSpinner';
import LoadingAnnouncer from './LoadingAnnouncer';

interface LoadingOverlayProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  className?: string;
}

export default function LoadingOverlay({
  message = 'Loading...',
  size = 'lg',
  fullScreen = false,
  className = '',
}: LoadingOverlayProps) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50'
    : 'flex flex-col items-center justify-center py-12';

  return (
    <div className={`${containerClasses} ${className}`} role="status">
      <LoadingAnnouncer message={message} />
      <LoadingSpinner size={size} ariaLabel={message} />
      {message && (
        <p
          className="mt-4 text-gray-600 text-sm sm:text-base"
          aria-live="polite"
        >
          {message}
        </p>
      )}
    </div>
  );
}
