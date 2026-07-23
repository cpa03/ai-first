'use client';

import { memo, useEffect, useRef, useState } from 'react';
import {
  COMPONENT_CONFIG,
  ANIMATION_DELAYS,
  DURATION_TAILWIND,
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  AUTO_SAVE_INDICATOR_LABELS,
  TEXT_SIZE_CLASSES,
  OPACITY_CONFIG,
  PROGRESS_PERCENTAGE,
  TIME_CONVERSIONS,
  TYPOGRAPHY_CLASSES,
  TEXT_COLORS,
  BORDER_COLORS,
  PULSE_DOT,
  SVG_CIRCLE,
} from '@/lib/config';
import Tooltip from './Tooltip';

interface AutoSaveIndicatorProps {
  value: string;
  delay?: number;
  className?: string;
}

type SaveState = 'idle' | 'typing' | 'saving' | 'saved';

function AutoSaveIndicatorComponent({
  value,
  delay = COMPONENT_CONFIG.AUTO_SAVE.DELAY_MS,
  className = '',
}: AutoSaveIndicatorProps) {
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [showIndicator, setShowIndicator] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [progress, setProgress] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Start progress animation
      const progressStep =
        PROGRESS_PERCENTAGE.MAX /
        (delay / COMPONENT_CONFIG.AUTO_SAVE.PROGRESS_INTERVAL_MS);
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= PROGRESS_PERCENTAGE.MAX) {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
            }
            return PROGRESS_PERCENTAGE.MAX;
          }
          return prev + progressStep;
        });
      }, COMPONENT_CONFIG.AUTO_SAVE.PROGRESS_INTERVAL_MS);

      timeoutRef.current = setTimeout(() => {
        queueMicrotask(() => {
          setSaveState('saving');
        });

        // Simulate save completion
        saveTimeoutRef.current = setTimeout(() => {
          queueMicrotask(() => {
            setSaveState('saved');
            setLastSaved(new Date());
            setProgress(PROGRESS_PERCENTAGE.MAX);
          });
        }, COMPONENT_CONFIG.AUTO_SAVE.SAVE_DURATION_MS);
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
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
      }, COMPONENT_CONFIG.AUTO_SAVE.HIDE_DELAY_MS);
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
    const seconds = Math.floor(diff / TIME_CONVERSIONS.MS_PER_SECOND);

    if (seconds < 10) return AUTO_SAVE_INDICATOR_LABELS.JUST_NOW;
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatExactTimestamp = (date: Date): string => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (!showIndicator) return null;

  return (
    <div
      className={`flex items-center gap-2 text-xs transition-all ${DURATION_TAILWIND[300]} ${className}`}
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Progress Ring */}
      <div className="relative w-4 h-4">
        {/* Background ring */}
        <svg
          className="w-4 h-4 -rotate-90"
          viewBox={SVG_VIEWBOX.STANDARD}
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx={SVG_CIRCLE.CX_24}
            cy={SVG_CIRCLE.CY_24}
            r={SVG_CIRCLE.R_10}
            stroke="currentColor"
            strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
            className={TEXT_COLORS.MUTED_LIGHT}
          />
          {(saveState === 'typing' || saveState === 'saving') && (
            <circle
              cx={SVG_CIRCLE.CX_24}
              cy={SVG_CIRCLE.CY_24}
              r={SVG_CIRCLE.R_10}
              stroke="currentColor"
              strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
              strokeLinecap="round"
              className={`text-primary-500 transition-all ${DURATION_TAILWIND[100]}`}
              strokeDasharray={`${2 * Math.PI * 10}`}
              strokeDashoffset={`${2 * Math.PI * 10 * (1 - progress / 100)}`}
            />
          )}
        </svg>

        {/* State Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          {saveState === 'typing' && <span className={PULSE_DOT} />}
          {saveState === 'saving' && (
            <svg
              className="w-2.5 h-2.5 text-primary-500 animate-spin"
              fill="none"
              viewBox={SVG_VIEWBOX.STANDARD}
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z"
                opacity={OPACITY_CONFIG.SVG_BACKGROUND}
              />
              <path
                fill="currentColor"
                d="M12 2v2a8 8 0 018 8h2a10 10 0 00-10-10z"
              />
            </svg>
          )}
          {saveState === 'saved' && (
            <svg
              className={`w-2.5 h-2.5 ${TEXT_COLORS.SUCCESS_LIGHT} animate-in zoom-in ${DURATION_TAILWIND[200]}`}
              fill="none"
              viewBox={SVG_VIEWBOX.STANDARD}
              stroke="currentColor"
              strokeWidth={SVG_STROKE_WIDTHS.THICK}
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
        className={`font-medium transition-colors ${DURATION_TAILWIND[200]} ${
          saveState === 'typing'
            ? TEXT_COLORS.MUTED
            : saveState === 'saving'
              ? TEXT_COLORS.BRAND
              : TEXT_COLORS.SUCCESS_DARK
        }`}
      >
        {saveState === 'typing' && AUTO_SAVE_INDICATOR_LABELS.TYPING}
        {saveState === 'saving' && AUTO_SAVE_INDICATOR_LABELS.SAVING}
        {saveState === 'saved' && (
          <span className="flex items-center gap-1">
            <span className={`animate-in fade-in ${DURATION_TAILWIND[200]}`}>
              {AUTO_SAVE_INDICATOR_LABELS.SAVED}
            </span>
            {lastSaved && (
              <Tooltip
                content={
                  <div className="flex flex-col gap-1">
                    <span className={TYPOGRAPHY_CLASSES.MEDIUM}>
                      {AUTO_SAVE_INDICATOR_LABELS.LAST_SAVED}
                    </span>
                    <span
                      className={`${TEXT_SIZE_CLASSES.XS} ${TEXT_COLORS.MUTED} opacity-80`}
                    >
                      {formatExactTimestamp(lastSaved)}
                    </span>
                  </div>
                }
                position="top"
              >
                <span
                  className={`${TEXT_COLORS.MUTED} animate-in fade-in slide-in-from-left-1 ${DURATION_TAILWIND[300]} cursor-help border-b border-dotted ${BORDER_COLORS.MUTED} ${TEXT_COLORS.HOVER_SECONDARY} transition-colors ${DURATION_TAILWIND[200]} ${ANIMATION_DELAYS.TAILWIND[100]}`}
                >
                  • {formatLastSaved(lastSaved)}
                </span>
              </Tooltip>
            )}
          </span>
        )}
      </span>
    </div>
  );
}

// PERFORMANCE: Memoize component to prevent unnecessary re-renders when parent re-renders
// This component manages its own state based on the `value` prop and doesn't need
// to re-render when unrelated parent state changes.
export default memo(AutoSaveIndicatorComponent);
