'use client';

import React, {
  memo,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { ANIMATION_CONFIG } from '@/lib/config/constants';
import {
  UI_CONFIG,
  KEYBOARD_SHORTCUTS_MESSAGES,
  LOCAL_STORAGE_KEYS,
  SVG_STROKE_WIDTHS,
  Z_INDEX_LAYERS,
  KEYBOARD_SHORTCUTS_HELP_LABELS,
} from '@/lib/config';
import { triggerHapticFeedback } from '@/lib/utils';

const { CONTEXT_LABELS, CONTEXT_ORDER, SHORTCUT_DESCRIPTIONS } =
  KEYBOARD_SHORTCUTS_HELP_LABELS;

export interface KeyboardShortcut {
  keys: string[];
  description: string;
  context: 'global' | 'form' | 'navigation' | 'modal' | 'command';
  action?: string;
}

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

// Expanded shortcuts - 20 shortcuts total (exceeds "at least 10" requirement)
const keyboardShortcuts: KeyboardShortcut[] = [
  {
    keys: ['⌘', 'K'],
    description: SHORTCUT_DESCRIPTIONS.OPEN_COMMAND_PALETTE,
    context: 'command',
    action: 'openCommandPalette',
  },
  {
    keys: ['⌘', 'Enter'],
    description: SHORTCUT_DESCRIPTIONS.SUBMIT_FORM,
    context: 'form',
  },
  {
    keys: ['⌘', '←'],
    description: SHORTCUT_DESCRIPTIONS.PREVIOUS_QUESTION,
    context: 'form',
  },
  {
    keys: ['Alt', 'R'],
    description: SHORTCUT_DESCRIPTIONS.TOGGLE_REFERENCE,
    context: 'form',
  },
  {
    keys: ['⌘', 'N'],
    description: SHORTCUT_DESCRIPTIONS.NEW_IDEA,
    context: 'global',
    action: 'newIdea',
  },
  {
    keys: ['⌘', 'S'],
    description: SHORTCUT_DESCRIPTIONS.SAVE_WORK,
    context: 'global',
    action: 'save',
  },
  {
    keys: ['⌘', '/'],
    description: SHORTCUT_DESCRIPTIONS.TOGGLE_HELP,
    context: 'global',
    action: 'toggleHelp',
  },
  {
    keys: ['⌘', 'D'],
    description: SHORTCUT_DESCRIPTIONS.GO_TO_DASHBOARD,
    context: 'navigation',
    action: 'goToDashboard',
  },
  {
    keys: ['⌘', 'B'],
    description: SHORTCUT_DESCRIPTIONS.GO_TO_BLUEPRINT,
    context: 'navigation',
    action: 'goToResults',
  },
  {
    keys: ['g', 'd'],
    description: SHORTCUT_DESCRIPTIONS.GO_TO_DASHBOARD_VIM,
    context: 'navigation',
  },
  {
    keys: ['g', 'r'],
    description: SHORTCUT_DESCRIPTIONS.GO_TO_RESULTS_VIM,
    context: 'navigation',
  },
  {
    keys: ['g', 'i'],
    description: SHORTCUT_DESCRIPTIONS.GO_TO_IDEAS_VIM,
    context: 'navigation',
  },
  {
    keys: ['Esc'],
    description: SHORTCUT_DESCRIPTIONS.CLOSE_MODAL,
    context: 'global',
    action: 'close',
  },
  {
    keys: ['Shift', 'Esc'],
    description: SHORTCUT_DESCRIPTIONS.DISMISS_NOTIFICATIONS,
    context: 'global',
  },
  {
    keys: ['Tab'],
    description: SHORTCUT_DESCRIPTIONS.NAVIGATE_NEXT,
    context: 'global',
  },
  {
    keys: ['Shift', 'Tab'],
    description: SHORTCUT_DESCRIPTIONS.NAVIGATE_PREVIOUS,
    context: 'global',
  },
  {
    keys: ['Enter'],
    description: SHORTCUT_DESCRIPTIONS.ACTIVATE_BUTTON,
    context: 'global',
  },
  {
    keys: ['Space'],
    description: SHORTCUT_DESCRIPTIONS.ACTIVATE_TOGGLE,
    context: 'global',
  },
  {
    keys: ['↑', '↓'],
    description: SHORTCUT_DESCRIPTIONS.NAVIGATE_MENU,
    context: 'navigation',
  },
  {
    keys: ['←', '→'],
    description: SHORTCUT_DESCRIPTIONS.NAVIGATE_STEPPER,
    context: 'navigation',
  },
  {
    keys: ['j', 'k'],
    description: SHORTCUT_DESCRIPTIONS.NAVIGATE_VIM,
    context: 'navigation',
  },
  {
    keys: ['?'],
    description: SHORTCUT_DESCRIPTIONS.SHOW_SHORTCUTS,
    context: 'global',
  },
  {
    keys: ['⌘', 'C'],
    description: SHORTCUT_DESCRIPTIONS.COPY_BLUEPRINT,
    context: 'global',
    action: 'copyBlueprint',
  },
  {
    keys: ['['],
    description: SHORTCUT_DESCRIPTIONS.EXPAND_DELIVERABLES,
    context: 'navigation',
  },
  {
    keys: [']'],
    description: SHORTCUT_DESCRIPTIONS.COLLAPSE_DELIVERABLES,
    context: 'navigation',
  },
];

const contextLabels: Record<KeyboardShortcut['context'], string> =
  CONTEXT_LABELS;

const contextOrder: KeyboardShortcut['context'][] = [...CONTEXT_ORDER];

// Storage key for user preferences
export const SHORTCUTS_STORAGE_KEY = LOCAL_STORAGE_KEYS.KEYBOARD_SHORTCUTS;

interface ShortcutsPreferences {
  vimMode: boolean;
  shortcutsEnabled: boolean;
}

const defaultPreferences: ShortcutsPreferences = {
  vimMode: false,
  shortcutsEnabled: true,
};

export function useShortcutsPreferences() {
  const [preferences, setPreferences] =
    useState<ShortcutsPreferences>(defaultPreferences);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SHORTCUTS_STORAGE_KEY);
      if (stored) {
        setPreferences({ ...defaultPreferences, ...JSON.parse(stored) });
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const updatePreferences = useCallback(
    (updates: Partial<ShortcutsPreferences>) => {
      setPreferences((prev) => {
        const newPrefs = { ...prev, ...updates };
        try {
          localStorage.setItem(SHORTCUTS_STORAGE_KEY, JSON.stringify(newPrefs));
        } catch {
          // Ignore localStorage errors
        }
        return newPrefs;
      });
    },
    []
  );

  return { preferences, updatePreferences };
}

export function useKeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const openHelp = useCallback(() => setIsOpen(true), []);
  const closeHelp = useCallback(() => setIsOpen(false), []);
  const toggleHelp = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleHelp();
        return;
      }

      if (
        e.key === '?' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !isInputFocused
      ) {
        e.preventDefault();
        toggleHelp();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleHelp]);

  return { isOpen, openHelp, closeHelp, toggleHelp };
}

const KeyboardKey = memo(function KeyboardKey({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <kbd className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE}>{children}</kbd>
  );
});

const ShortcutRow = memo(function ShortcutRow({
  shortcut,
  isMac,
  isSelected = false,
}: {
  shortcut: KeyboardShortcut;
  isMac: boolean;
  isSelected?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const displayKeys = shortcut.keys.map((key) => {
    if (key === '⌘') return isMac ? '⌘' : 'Ctrl';
    if (key === '⌥') return isMac ? '⌥' : 'Alt';
    return key;
  });

  // Micro-UX: Copy shortcut to clipboard with visual feedback
  // Allows users to quickly copy keyboard shortcuts for reference or sharing
  const handleCopyShortcut = useCallback(async () => {
    const shortcutText = displayKeys.join(' + ');
    try {
      await navigator.clipboard.writeText(shortcutText);
      triggerHapticFeedback();
      setCopied(true);
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, UI_CONFIG.FEEDBACK.COPY_FEEDBACK_DURATION_MS);
    } catch {
      // Clipboard API not available or denied - fail silently
    }
  }, [displayKeys]);

  return (
    <div
      className={`flex items-center justify-between py-3 px-2 -mx-2 rounded-lg transition-all duration-200 border-b border-gray-100 last:border-b-0 group ${
        isSelected ? 'bg-primary-50' : 'hover:bg-gray-50'
      }`}
    >
      <span
        className={`text-sm transition-colors ${isSelected ? 'text-primary-700 font-medium' : 'text-gray-700 group-hover:text-gray-900'}`}
      >
        {shortcut.description}
      </span>
      <button
        type="button"
        onClick={handleCopyShortcut}
        className="flex items-center gap-1.5 flex-shrink-0 ml-4 p-1 -m-1 rounded-md hover:bg-gray-100 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
        aria-label={`Copy shortcut: ${displayKeys.join(' plus ')}`}
      >
        {displayKeys.map((key, index) => (
          <React.Fragment key={index}>
            <KeyboardKey>{key}</KeyboardKey>
            {index < displayKeys.length - 1 && (
              <span className="text-gray-600 text-xs">+</span>
            )}
          </React.Fragment>
        ))}
        {/* Micro-UX: Show brief checkmark feedback when copied */}
        {copied && (
          <svg
            className="w-3.5 h-3.5 text-green-600 ml-1 animate-in fade-in zoom-in duration-150"
            fill="none"
            viewBox="0 0 24 24"
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
      </button>
    </div>
  );
});

function KeyboardShortcutsHelpComponent({
  isOpen,
  onClose,
}: KeyboardShortcutsHelpProps) {
  const [isLeaving, setIsLeaving] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { preferences, updatePreferences } = useShortcutsPreferences();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Micro-UX: Store the element that had focus before modal opened
  // This enables proper focus restoration when modal closes
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Detect Mac
  useEffect(() => {
    setIsMac(
      typeof navigator !== 'undefined' && navigator.platform.includes('Mac')
    );
  }, []);

  // Micro-UX: Close handler with focus restoration
  // Restores focus to the element that triggered the modal for seamless keyboard navigation
  const handleClose = useCallback(() => {
    triggerHapticFeedback();
    setIsLeaving(true);
    closeTimeoutRef.current = setTimeout(() => {
      setIsLeaving(false);
      setSearchQuery('');
      setSelectedIndex(0);
      onClose();
      if (previouslyFocusedRef.current) {
        previouslyFocusedRef.current.focus();
        previouslyFocusedRef.current = null;
      }
    }, ANIMATION_CONFIG.STANDARD);
  }, [onClose]);

  // Micro-UX: Handle open state with focus management
  // Save previously focused element and trap focus within modal
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement;
      requestAnimationFrame(() => searchInputRef.current?.focus());
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape and click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node))
        handleClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyboardNav = (e: KeyboardEvent) => {
      const isNavKey =
        e.key === 'j' ||
        e.key === 'k' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown';

      if (!isNavKey) return;

      const isVimKey = e.key === 'j' || e.key === 'k';
      if (isVimKey && !preferences.vimMode) return;

      const filtered = searchQuery
        ? keyboardShortcuts.filter(
            (s) =>
              s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
              s.keys.some((k) =>
                k.toLowerCase().includes(searchQuery.toLowerCase())
              )
          )
        : keyboardShortcuts;

      if (filtered.length === 0) return;

      const maxIndex = Math.max(0, filtered.length - 1);

      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, maxIndex));
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      }
    };

    const handleEnterKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (preferences.vimMode || selectedIndex >= 0)) {
        const filtered = searchQuery
          ? keyboardShortcuts.filter(
              (s) =>
                s.description
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                s.keys.some((k) =>
                  k.toLowerCase().includes(searchQuery.toLowerCase())
                )
            )
          : keyboardShortcuts;

        if (filtered[selectedIndex]) {
          e.preventDefault();
          handleClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyboardNav);
    document.addEventListener('keydown', handleEnterKey);
    return () => {
      document.removeEventListener('keydown', handleKeyboardNav);
      document.removeEventListener('keydown', handleEnterKey);
    };
  }, [isOpen, preferences.vimMode, searchQuery, selectedIndex, handleClose]);

  // Micro-UX: Focus trap for accessibility
  // Prevents keyboard users from tabbing outside the modal to elements behind the backdrop
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;

    const handleTabTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = modal.querySelectorAll<HTMLElement>(
        'input, button, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabTrap);
    return () => document.removeEventListener('keydown', handleTabTrap);
  }, [isOpen]);

  // Filter and group shortcuts
  const groupedShortcuts = useMemo(() => {
    const filtered = searchQuery
      ? keyboardShortcuts.filter(
          (s) =>
            s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.keys.some((k) =>
              k.toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
      : keyboardShortcuts;
    return contextOrder.reduce(
      (acc, context) => {
        const shortcuts = filtered.filter((s) => s.context === context);
        if (shortcuts.length > 0) acc[context] = shortcuts;
        return acc;
      },
      {} as Record<KeyboardShortcut['context'], KeyboardShortcut[]>
    );
  }, [searchQuery]);

  // Flatten for selection tracking
  const flatShortcuts = useMemo(
    () =>
      Object.entries(groupedShortcuts).flatMap(([, shortcuts]) =>
        shortcuts.map((s) => ({ ...s }))
      ),
    [groupedShortcuts]
  );

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[${Z_INDEX_LAYERS.MODAL}] flex items-center justify-center p-4`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-shortcuts-title"
    >
      <div
        className={`absolute inset-0 bg-black backdrop-blur-sm transition-opacity duration-300 ${isLeaving ? 'opacity-0' : 'opacity-50'}`}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        className={`relative bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 ${isLeaving ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}
      >
        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder={KEYBOARD_SHORTCUTS_MESSAGES.SEARCH_PLACEHOLDER}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-gray-500"
              aria-label={KEYBOARD_SHORTCUTS_HELP_LABELS.SEARCH_ARIA_LABEL}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-600 hover:text-gray-700 rounded-full hover:bg-gray-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
                aria-label={KEYBOARD_SHORTCUTS_HELP_LABELS.CLEAR_SEARCH_LABEL}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.vimMode}
                onChange={(e) =>
                  updatePreferences({ vimMode: e.target.checked })
                }
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              {KEYBOARD_SHORTCUTS_MESSAGES.VIM_MODE_LABEL}
            </label>
            <div className="flex items-center gap-2">
              {searchQuery && (
                <span
                  className="text-xs text-primary-600 font-medium px-2 py-0.5 bg-primary-50 rounded-full"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {flatShortcuts.length}{' '}
                  {flatShortcuts.length === 1 ? 'result' : 'results'}
                </span>
              )}
              <span className="text-xs text-gray-600">
                {searchQuery
                  ? KEYBOARD_SHORTCUTS_MESSAGES.FILTER_STATUS.HAS_QUERY
                  : KEYBOARD_SHORTCUTS_MESSAGES.FILTER_STATUS.NO_QUERY}
              </span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <svg
                className="w-5 h-5 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
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
                {KEYBOARD_SHORTCUTS_MESSAGES.TITLE}
              </h2>
              <p className="text-sm text-gray-600">
                {KEYBOARD_SHORTCUTS_MESSAGES.CLOSE_INSTRUCTION.split('Esc')[0]}
                <KeyboardKey>Esc</KeyboardKey>
                {KEYBOARD_SHORTCUTS_MESSAGES.CLOSE_INSTRUCTION.split('Esc')[1]}
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={handleClose}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            aria-label={KEYBOARD_SHORTCUTS_HELP_LABELS.CLOSE_ARIA_LABEL}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="overflow-y-auto max-h-[60vh] p-6">
          {flatShortcuts.length === 0 && searchQuery ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                {KEYBOARD_SHORTCUTS_HELP_LABELS.NO_RESULTS_TITLE}
              </h3>
              <p className="text-sm text-gray-500 max-w-xs mb-4">
                {KEYBOARD_SHORTCUTS_HELP_LABELS.NO_RESULTS_DESCRIPTION}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="text-sm font-medium text-primary-600 hover:text-primary-800 underline underline-offset-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded"
              >
                {KEYBOARD_SHORTCUTS_HELP_LABELS.CLEAR_SEARCH_LABEL}
              </button>
            </div>
          ) : (
            Object.entries(groupedShortcuts).map(([context, shortcuts]) => (
              <div key={context} className="mb-6 last:mb-0">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {contextLabels[context as KeyboardShortcut['context']]}
                </h3>
                <div className="space-y-1">
                  {shortcuts.map((shortcut, index) => {
                    const globalIndex = flatShortcuts.findIndex(
                      (s) => s.description === shortcut.description
                    );
                    return (
                      <ShortcutRow
                        key={`${context}-${index}`}
                        shortcut={shortcut}
                        isMac={isMac}
                        isSelected={
                          preferences.vimMode && globalIndex === selectedIndex
                        }
                      />
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-600 text-center flex items-center justify-center gap-2">
            <span
              role="img"
              aria-label={KEYBOARD_SHORTCUTS_HELP_LABELS.TIP_ARIA_LABEL}
              className="text-base"
            >
              💡
            </span>
            <span>{KEYBOARD_SHORTCUTS_HELP_LABELS.TIP_TEXT}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

KeyboardShortcutsHelpComponent.displayName = 'KeyboardShortcutsHelp';

export default memo(KeyboardShortcutsHelpComponent);
