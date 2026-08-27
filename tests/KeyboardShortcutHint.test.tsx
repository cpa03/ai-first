import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import KeyboardShortcutHint from '@/components/KeyboardShortcutHint';
import { KEYBOARD_SHORTCUT_HINT_LABELS, UI_CONFIG } from '@/lib/config';

const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => {
    store[key] = value.toString();
  },
  clear: () => {
    for (const k of Object.keys(store)) {
      delete store[k];
    }
  },
  removeItem: (key: string) => {
    delete store[key];
  },
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('KeyboardShortcutHint', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    window.localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders hint after delay when storage key is not set', () => {
    render(<KeyboardShortcutHint storageKey="test_hint_key" />);

    expect(screen.queryByRole('status')).toBeNull();

    act(() => {
      jest.advanceTimersByTime(UI_CONFIG.KEYBOARD_HINT_DELAY + 100);
    });

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(KEYBOARD_SHORTCUT_HINT_LABELS.TITLE)).toBeInTheDocument();
    expect(screen.getByText(KEYBOARD_SHORTCUT_HINT_LABELS.PRESS_INSTRUCTION, { exact: false })).toBeInTheDocument();
  });

  it('does not render hint if storage key is set in localStorage', () => {
    window.localStorage.setItem('test_hint_key', 'true');
    render(<KeyboardShortcutHint storageKey="test_hint_key" />);

    act(() => {
      jest.advanceTimersByTime(UI_CONFIG.KEYBOARD_HINT_DELAY + 500);
    });

    expect(screen.queryByRole('status')).toBeNull();
  });

  it('includes focus ring and active scale accessibility classes on dismiss button', () => {
    render(<KeyboardShortcutHint storageKey="test_hint_key" />);

    act(() => {
      jest.advanceTimersByTime(UI_CONFIG.KEYBOARD_HINT_DELAY + 100);
    });

    const dismissButton = screen.getByRole('button', {
      name: KEYBOARD_SHORTCUT_HINT_LABELS.DISMISS_ARIA_LABEL,
    });

    expect(dismissButton).toBeInTheDocument();
    expect(dismissButton.className).toContain('focus-visible:ring');
    expect(dismissButton.className).toContain('active:scale-95');
  });

  it('dismisses when dismiss button is clicked and sets localStorage', () => {
    render(<KeyboardShortcutHint storageKey="test_hint_key" />);

    act(() => {
      jest.advanceTimersByTime(UI_CONFIG.KEYBOARD_HINT_DELAY + 100);
    });

    const dismissButton = screen.getByRole('button', {
      name: KEYBOARD_SHORTCUT_HINT_LABELS.DISMISS_ARIA_LABEL,
    });

    fireEvent.click(dismissButton);

    expect(window.localStorage.getItem('test_hint_key')).toBe('true');

    act(() => {
      jest.advanceTimersByTime(UI_CONFIG.KEYBOARD_HINT_EXIT_ANIMATION + 100);
    });

    expect(screen.queryByRole('status')).toBeNull();
  });
});
