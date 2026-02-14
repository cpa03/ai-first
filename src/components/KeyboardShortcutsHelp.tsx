'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ANIMATION_CONFIG } from '@/lib/config/constants';

export interface KeyboardShortcut {
  keys: string[];
  description: string;
  context: 'global' | 'form' | 'navigation' | 'modal';
}

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const keyboardShortcuts: KeyboardShortcut[] = [
  {
    keys: ['⌘', 'K'],
    description: 'Open keyboard shortcuts help',
    context: 'global',
  },
  {
    keys: ['⌘', 'Enter'],
    description: 'Submit form',
    context: 'form',
  },
  {
    keys: ['Esc'],
    description: 'Close modal or menu',
    context: 'global',
  },
  {
    keys: ['Tab'],
    description: 'Navigate to next focusable element',
    context: 'global',
  },
  {
    keys: ['Shift', 'Tab'],
    description: 'Navigate to previous focusable element',
    context: 'global',
  },
  {
    keys: ['Enter'],
    description: 'Activate button or link',
    context: 'global',
  },
  {
    keys: ['Space'],
    description: 'Activate button or toggle checkbox',
    context: 'global',
  },
  {
    keys: ['↑', '↓'],
    description: 'Navigate menu items',
    context: 'navigation',
  },
  {
    keys: ['←', '→'],
    description: 'Navigate stepper or tabs',
    context: 'navigation',
  },
];

const contextLabels: Record<KeyboardShortcut['context'], string> = {
  global: 'Global',
  form: 'Forms',
  navigation: 'Navigation',
  modal: 'Modals',
};

const contextOrder: KeyboardShortcut['context'][] = [
  'global',
  'navigation',
  'form',
  'modal',
];

export function useKeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const openHelp = useCallback(() => setIsOpen(true), []);
  const closeHelp = useCallback(() => setIsOpen(false), []);
  const toggleHelp = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleHelp();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleHelp]);

  return { isOpen, openHelp, closeHelp, toggleHelp };
}

function KeyboardKey({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-gray-100 border border-gray-300 rounded text-xs font-sans font-medium text-gray-800 shadow-sm">
      {children}
    </kbd>
  );
}

function ShortcutRow({ shortcut }: { shortcut: KeyboardShortcut }) {
  const isMac =
    typeof navigator !== 'undefined' && navigator.platform.includes('Mac');

  const displayKeys = shortcut.keys.map((key) => {
    if (key === '⌘') return isMac ? '⌘' : 'Ctrl';
    if (key === '⌥') return isMac ? '⌥' : 'Alt';
    return key;
  });

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-700">{shortcut.description}</span>
      <div className="flex items-center gap-1.5 flex-shrink-0 ml-4">
        {displayKeys.map((key, index) => (
          <React.Fragment key={index}>
            <KeyboardKey>{key}</KeyboardKey>
            {index < displayKeys.length - 1 && (
              <span className="text-gray-400 text-xs">+</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default function KeyboardShortcutsHelp({
  isOpen,
  onClose,
}: KeyboardShortcutsHelpProps) {
  const [isLeaving, setIsLeaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsLeaving(false);
      setIsMounted(false);
      onClose();
    }, ANIMATION_CONFIG.STANDARD);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClose]);

  if (!isOpen && !isMounted) return null;

  const groupedShortcuts = contextOrder.reduce(
    (acc, context) => {
      const shortcuts = keyboardShortcuts.filter((s) => s.context === context);
      if (shortcuts.length > 0) {
        acc[context] = shortcuts;
      }
      return acc;
    },
    {} as Record<KeyboardShortcut['context'], KeyboardShortcut[]>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-shortcuts-title"
    >
      <div
        className={`
          absolute inset-0 bg-black transition-opacity duration-300
          ${isLeaving ? 'opacity-0' : 'opacity-50'}
        `}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        className={`
          relative bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh]
          overflow-hidden transform transition-all duration-300
          ${isLeaving ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}
        `}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <svg
                className="w-5 h-5 text-primary-600"
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
            </div>
            <div>
              <h2
                id="keyboard-shortcuts-title"
                className="text-lg font-semibold text-gray-900"
              >
                Keyboard Shortcuts
              </h2>
              <p className="text-sm text-gray-600">
                Press <KeyboardKey>Esc</KeyboardKey> to close
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            aria-label="Close keyboard shortcuts help"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh] p-6">
          {Object.entries(groupedShortcuts).map(([context, shortcuts]) => (
            <div key={context} className="mb-6 last:mb-0">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {contextLabels[context as KeyboardShortcut['context']]}
              </h3>
              <div className="space-y-1">
                {shortcuts.map((shortcut, index) => (
                  <ShortcutRow
                    key={`${context}-${index}`}
                    shortcut={shortcut}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Tip: Keyboard shortcuts make navigating IdeaFlow faster and more
            accessible
          </p>
        </div>
      </div>
    </div>
  );
}
