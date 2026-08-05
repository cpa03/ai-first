'use client';

import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { PLATFORM } from '@/lib/dom-utils';
import { triggerHapticFeedback } from '@/lib/utils';
import {
  TRANSITION_CLASSES,
  Z_INDEX_LAYERS,
  BG_COLORS,
  TEXT_COLORS,
  BORDER_COLORS,
  SHADOW_CLASSES,
  UI_CONFIG,
  KEYBOARD_SHORTCUT_HINT_LABELS,
  ICON_SIZES,
  LOCAL_STORAGE_KEYS,
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
} from '@/lib/config';

interface KeyboardShortcutHintProps {
  storageKey?: string;
  displayDuration?: number;
}

function KeyboardShortcutHintComponent({
  storageKey = LOCAL_STORAGE_KEYS.DASHBOARD_KEYBOARD_HINT_SHOWN,
  displayDuration = UI_CONFIG.KEYBOARD_HINT_DISPLAY_DURATION,
}: KeyboardShortcutHintProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const exitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMac = typeof window !== 'undefined' ? PLATFORM.isMac() : false;

  useEffect(() => {
    try {
      const hasSeenHint = localStorage.getItem(storageKey);
      if (hasSeenHint) return;
    } catch {
      // localStorage not available
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, UI_CONFIG.KEYBOARD_HINT_DELAY);

    return () => clearTimeout(timer);
  }, [storageKey]);

  const dismiss = useCallback(() => {
    triggerHapticFeedback();
    setIsExiting(true);
    try {
      localStorage.setItem(storageKey, 'true');
    } catch {
      // localStorage not available
    }
    exitTimeoutRef.current = setTimeout(
      () => {
        setIsVisible(false);
        setIsExiting(false);
      },
      prefersReducedMotion ? 0 : UI_CONFIG.KEYBOARD_HINT_EXIT_ANIMATION
    );
  }, [storageKey, prefersReducedMotion]);

  useEffect(() => {
    if (isVisible && !isExiting) {
      timeoutRef.current = setTimeout(() => {
        dismiss();
      }, displayDuration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisible, isExiting, displayDuration, dismiss]);

  useEffect(() => {
    return () => {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
      }
    };
  }, []);

  if (!isVisible) return null;

  const modifierKey = isMac ? '⌘' : 'Ctrl';

  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[${Z_INDEX_LAYERS.TOAST}] max-w-sm w-full mx-4`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={`
          ${BG_COLORS.DEFAULT} ${SHADOW_CLASSES.LARGE} rounded-xl
          border ${BORDER_COLORS.LIGHT}
          p-4 transition-opacity transition-transform will-change-transform
          ${isExiting ? 'opacity-0 translate-y-2 scale-95' : 'opacity-100 translate-y-0 scale-100'}
        `}
        style={{
          transitionDuration: prefersReducedMotion
            ? '0ms'
            : `${UI_CONFIG.KEYBOARD_HINT_EXIT_ANIMATION}ms`,
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex-shrink-0 ${ICON_SIZES.XXL} rounded-lg ${BG_COLORS.BRAND_100} flex items-center justify-center`}
          >
            <svg
              className={`${ICON_SIZES.MD} ${TEXT_COLORS.BRAND_600}`}
              fill="none"
              viewBox={SVG_VIEWBOX.STANDARD}
              stroke="currentColor"
              strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${TEXT_COLORS.PRIMARY}`}>
              Keyboard shortcuts available
            </p>
            <p className={`text-xs ${TEXT_COLORS.SECONDARY} mt-1`}>
              Press{' '}
              <kbd
                className={`px-1.5 py-0.5 ${BG_COLORS.LIGHT} rounded text-xs font-mono ${TEXT_COLORS.PRIMARY}`}
              >
                ?
              </kbd>{' '}
              to see all shortcuts, or{' '}
              <kbd
                className={`px-1.5 py-0.5 ${BG_COLORS.LIGHT} rounded text-xs font-mono ${TEXT_COLORS.PRIMARY}`}
              >
                {modifierKey} Enter
              </kbd>{' '}
              to submit.
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className={`flex-shrink-0 p-1 rounded-lg ${TEXT_COLORS.MUTED} hover:${TEXT_COLORS.SECONDARY} hover:${BG_COLORS.LIGHT} ${TRANSITION_CLASSES.COLOR}`}
            aria-label={KEYBOARD_SHORTCUT_HINT_LABELS.DISMISS_ARIA_LABEL}
          >
            <svg
              className={ICON_SIZES.MD}
              fill="none"
              viewBox={SVG_VIEWBOX.STANDARD}
              stroke="currentColor"
              strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

KeyboardShortcutHintComponent.displayName = 'KeyboardShortcutHint';

export default memo(KeyboardShortcutHintComponent);
