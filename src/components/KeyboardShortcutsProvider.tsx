'use client';

import KeyboardShortcutsHelp, {
  useKeyboardShortcutsHelp,
} from '@/components/KeyboardShortcutsHelp';
import Tooltip from '@/components/Tooltip';
import { createContext, useContext, ReactNode } from 'react';

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

  return (
    <KeyboardShortcutsContext.Provider value={{ openHelp, closeHelp }}>
      {children}
      <KeyboardShortcutsHelp isOpen={isOpen} onClose={closeHelp} />
    </KeyboardShortcutsContext.Provider>
  );
}

export function KeyboardShortcutsButton() {
  const { openHelp } = useKeyboardShortcuts();

  return (
    <Tooltip content="Keyboard shortcuts (⌘K)" position="bottom">
      <button
        onClick={openHelp}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        aria-label="Open keyboard shortcuts help"
        type="button"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
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
