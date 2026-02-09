'use client';

import { useEffect, useRef, useState } from 'react';

interface AutoSaveIndicatorProps {
  value: string;
  delay?: number;
  className?: string;
}

type SaveState = 'idle' | 'typing' | 'saved';

export default function AutoSaveIndicator({
  value,
  delay = 1000,
  className = '',
}: AutoSaveIndicatorProps) {
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [showIndicator, setShowIndicator] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const hasValue = value.trim().length > 0;

    if (!hasValue) {
      queueMicrotask(() => {
        setSaveState('idle');
        setShowIndicator(false);
      });
    } else {
      queueMicrotask(() => {
        setSaveState('typing');
        setShowIndicator(true);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        queueMicrotask(() => {
          setSaveState('saved');
        });
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  useEffect(() => {
    if (saveState === 'saved') {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }

      hideTimeoutRef.current = setTimeout(() => {
        queueMicrotask(() => {
          setShowIndicator(false);
        });
      }, 2000);
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [saveState]);

  if (!showIndicator) return null;

  return (
    <div
      className={`flex items-center gap-1.5 text-xs font-medium transition-all duration-300 ${className}`}
      aria-live="polite"
      aria-atomic="true"
    >
      {saveState === 'typing' && (
        <>
          <svg
            className="w-3.5 h-3.5 text-gray-400 animate-spin"
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
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-gray-500">Saving draft...</span>
        </>
      )}
      {saveState === 'saved' && (
        <>
          <svg
            className="w-3.5 h-3.5 text-green-500 animate-in fade-in duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-green-600 animate-in fade-in duration-200">
            Draft saved
          </span>
        </>
      )}
    </div>
  );
}
