'use client';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
  children: React.ReactNode;
}

export default function LoadingOverlay({
  isLoading,
  message,
  progress,
  children,
}: LoadingOverlayProps) {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-primary-600 mx-auto mb-6"></div>
          {message && (
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {message}
            </h3>
          )}
          {progress !== undefined && (
            <div className="w-full max-w-md mx-auto mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {Math.round(progress)}%
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="opacity-50 pointer-events-none">{children}</div>
    </div>
  );
}
