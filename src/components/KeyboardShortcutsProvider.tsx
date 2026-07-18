'use client';

import KeyboardShortcutsHelp, {
  useKeyboardShortcutsHelp,
} from '@/components/KeyboardShortcutsHelp';
import Tooltip from '@/components/Tooltip';
import SessionTracker from '@/components/SessionTracker';
import {
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  KEYBOARD_SHORTCUTS_PROVIDER_LABELS,
  COMPONENT_CONFIG,
  GRAY_TEXT_COMBOS,
  FOCUS_RING_PATTERNS,
} from '@/lib/config';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { PLATFORM } from '@/lib/dom-utils';
import {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  memo,
  useState,
  useEffect,
} from 'react';

interface KeyboardShortcutsContextValue {
  openHelp: () => void;
  closeHelp: () => void;
}

const KeyboardShortcutsContext = createContext<
  KeyboardShortcutsContextValue | undefined
>(undefined);

export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error(
      'useKeyboardShortcuts must be used within KeyboardShortcutsProvider'
    );
  }
  return context;
}

interface KeyboardShortcutsProviderProps {
  children: ReactNode;
}

export function KeyboardShortcutsProvider({
  children,
}: KeyboardShortcutsProviderProps) {
  const { isOpen, openHelp, closeHelp } = useKeyboardShortcutsHelp();

  // PERFORMANCE: Memoize context value to prevent unnecessary re-renders of consumers
  // Without this, the context value object is recreated on every render,
  // causing all consumers to re-render even when openHelp/closeHelp haven't changed
  const value = useMemo(() => ({ openHelp, closeHelp }), [openHelp, closeHelp]);

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      <SessionTracker />
      {children}
      <KeyboardShortcutsHelp isOpen={isOpen} onClose={closeHelp} />
    </KeyboardShortcutsContext.Provider>
  );
}

function KeyboardShortcutsButtonComponent() {
  const { openHelp } = useKeyboardShortcuts();
  const [isMac, setIsMac] = useState(false);
  const [showDiscoverPulse, setShowDiscoverPulse] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    setIsMac(PLATFORM.isMac());
  }, []);

  useEffect(() => {
    if (!prefersReducedMotion) {
      const timer = setTimeout(
        () => setShowDiscoverPulse(true),
        COMPONENT_CONFIG.KEYBOARD_SHORTCUTS.DISCOVER_PULSE_DELAY_MS
      );
      return () => clearTimeout(timer);
    }
  }, [prefersReducedMotion]);

  const shortcutKeys = useMemo(() => [isMac ? '⌘' : 'Ctrl', 'K'], [isMac]);

  return (
    <Tooltip
      content={KEYBOARD_SHORTCUTS_PROVIDER_LABELS.TOOLTIP_CONTENT}
      shortcut={shortcutKeys}
      position="bottom"
    >
      <button
        onClick={openHelp}
        className={`p-2 ${GRAY_TEXT_COMBOS.MUTED_HOVER} hover:bg-gray-100 rounded-lg transition-colors ${FOCUS_RING_PATTERNS.DEFAULT} ${showDiscoverPulse ? 'animate-discover-pulse' : ''}`}
        aria-label={KEYBOARD_SHORTCUTS_PROVIDER_LABELS.HELP_BUTTON_ARIA_LABEL}
        type="button"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox={SVG_VIEWBOX.STANDARD}
          stroke="currentColor"
          strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
          />
        </svg>
      </button>
    </Tooltip>
  );
}

// PERFORMANCE: Memoize to prevent re-renders when parent components update
// This component is often used in layout/header and should not re-render unnecessarily
export const KeyboardShortcutsButton = memo(KeyboardShortcutsButtonComponent);
