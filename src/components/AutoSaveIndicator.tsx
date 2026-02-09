'use client';

import { useEffect, useRef, useState } from 'react';

interface AutoSaveIndicatorProps {
  value: string;
  delay?: number;
  className?: string;
}

type SaveState = 'idle' | 'typing' | 'saving' | 'saved';

export default function AutoSaveIndicator({
  value,
  delay = 1000,
  className = '',
}: AutoSaveIndicatorProps) {
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [showIndicator, setShowIndicator] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [progress, setProgress] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const hasValue = value.trim().length > 0;

    if (!hasValue) {
      queueMicrotask(() => {
        setSaveState('idle');
        setShowIndicator(false);
        setProgress(0);
      });
    } else {
      queueMicrotask(() => {
        setSaveState('typing');
        setShowIndicator(true);
        setProgress(0);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      // Start progress animation
      const progressStep = 100 / (delay / 50);
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
            }
            return 100;
          }
          return prev + progressStep;
        });
      }, 50);

      timeoutRef.current = setTimeout(() => {
        queueMicrotask(() => {
          setSaveState('saving');
        });

        // Simulate save completion
        setTimeout(() => {
          queueMicrotask(() => {
            setSaveState('saved');
            setLastSaved(new Date());
            setProgress(100);
          });
        }, 300);
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
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
      }, 3000);
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [saveState]);

  const formatLastSaved = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);

    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!showIndicator) return null;

  return (
    <div
      className={`flex items-center gap-2 text-xs transition-all duration-300 ${className}`}
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Progress Ring */}
      <div className="relative w-4 h-4">
        {/* Background ring */}
        <svg
          className="w-4 h-4 -rotate-90"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-200"
          />
          {(saveState === 'typing' || saveState === 'saving') && (
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-primary-500 transition-all duration-100"
              strokeDasharray={`${2 * Math.PI * 10}`}
              strokeDashoffset={`${2 * Math.PI * 10 * (1 - progress / 100)}`}
            />
          )}
        </svg>

        {/* State Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          {saveState === 'typing' && (
            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
          )}
          {saveState === 'saving' && (
            <svg
              className="w-2.5 h-2.5 text-primary-500 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z"
                opacity="0.3"
              />
              <path
                fill="currentColor"
                d="M12 2v2a8 8 0 018 8h2a10 10 0 00-10-10z"
              />
            </svg>
          )}
          {saveState === 'saved' && (
            <svg
              className="w-2.5 h-2.5 text-green-500 animate-in zoom-in duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Text */}
      <span
        className={`font-medium transition-colors duration-200 ${
          saveState === 'typing'
            ? 'text-gray-500'
            : saveState === 'saving'
              ? 'text-primary-600'
              : 'text-green-600'
        }`}
      >
        {saveState === 'typing' && 'Typing...'}
        {saveState === 'saving' && 'Saving...'}
        {saveState === 'saved' && (
          <span className="flex items-center gap-1">
            <span className="animate-in fade-in duration-200">Saved</span>
            {lastSaved && (
              <span className="text-gray-400 animate-in fade-in slide-in-from-left-1 duration-300 delay-100">
                • {formatLastSaved(lastSaved)}
              </span>
            )}
          </span>
        )}
      </span>
    </div>
  );
}
