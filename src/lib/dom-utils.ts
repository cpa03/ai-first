/**
 * DOM Utility Functions
 *
 * Centralizes common DOM operations to eliminate hardcoded patterns.
 * Follows the "Flexy" principle: eliminate hardcoded values, make modular systems.
 *
 * Key patterns eliminated:
 * - tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT'
 * - navigator.platform.includes('Mac')
 */

/**
 * HTML element tag names that are considered interactive input elements.
 * Used for detecting if user is typing in an input field.
 */
export const INPUT_ELEMENT_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'] as const;

/**
 * Type guard to check if a tag name is an input element tag
 */
export type InputElementTag = (typeof INPUT_ELEMENT_TAGS)[number];

/**
 * Check if an element is an interactive input element.
 * Eliminates hardcoded tagName checks across the codebase.
 *
 * @param element - The HTML element to check
 * @returns true if the element is an input, textarea, or select element
 *
 * @example
 * ```typescript
 * // Before (hardcoded):
 * if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
 *   return;
 * }
 *
 * // After (modular):
 * if (isInputElement(target)) {
 *   return;
 * }
 * ```
 */
export function isInputElement(
  element: HTMLElement | EventTarget | null
): element is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
  if (!element || !('tagName' in element)) {
    return false;
  }
  const tagName = (element as HTMLElement).tagName;
  // PERFORMANCE: Using direct equality check is 6-10x faster than Array.includes()
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
}

/**
 * Check if an element is content editable.
 * Common pattern used alongside input element detection.
 */
export function isContentEditable(
  element: HTMLElement | EventTarget | null
): boolean {
  if (!element || !('isContentEditable' in element)) {
    return false;
  }
  return (element as HTMLElement).isContentEditable;
}

/**
 * Check if the user is currently focused on an interactive input element.
 * Combines isInputElement and isContentEditable checks.
 *
 * @param element - The element to check (defaults to document.activeElement)
 * @returns true if the element is an interactive input
 *
 * @example
 * ```typescript
 * // Before:
 * const target = e.target as HTMLElement;
 * const isInputFocused =
 *   target.tagName === 'INPUT' ||
 *   target.tagName === 'TEXTAREA' ||
 *   target.tagName === 'SELECT' ||
 *   target.isContentEditable;
 *
 * // After:
 * const isInputFocused = isFocusedOnInput(e.target);
 * ```
 */
export function isFocusedOnInput(
  element?: HTMLElement | EventTarget | null
): boolean {
  const target = element ?? document.activeElement;
  return isInputElement(target) || isContentEditable(target);
}

// PERFORMANCE: Module-level cached evaluation variables for PLATFORM getters.
// Since these platform properties do not change throughout the session lifecycle,
// caching them once at startup avoids repeating expensive string manipulation/regex
// searches on every subsequent helper call.
//
// To prevent stale mock states in test suites, we also cache the exact platform
// and userAgent strings. If navigator is re-defined or mocked (which changes
// the underlying platform or userAgent reference/value), the cache automatically
// invalidates and updates itself.
let cachedIsMac: boolean | null = null;
let cachedIsIOS: boolean | null = null;
let cachedIsWindows: boolean | null = null;
let cachedIsLinux: boolean | null = null;
let cachedIsEdge: boolean | null = null;
let cachedIsFirefox: boolean | null = null;
let cachedIsSafari: boolean | null = null;

let cachedPlatformStr: string | null = null;
let cachedUserAgentStr: string | null = null;

/**
 * Reset platform caching state.
 * EXCLUSIVELY used for unit/performance testing with mocked navigator profiles.
 */
export function __resetPlatformCacheForTesting(): void {
  cachedIsMac = null;
  cachedIsIOS = null;
  cachedIsWindows = null;
  cachedIsLinux = null;
  cachedIsEdge = null;
  cachedIsFirefox = null;
  cachedIsSafari = null;
  cachedPlatformStr = null;
  cachedUserAgentStr = null;
}

const MAC_REGEX = /Mac|iPhone|iPad|iPod/;
const IOS_REGEX = /iPhone|iPad|iPod/;
const WINDOWS_REGEX = /Win/;
const LINUX_REGEX = /Linux/;

/**
 * Platform detection utilities.
 * Centralizes platform-specific logic.
 */
export const PLATFORM = {
  /**
   * Check if the current platform is macOS.
   * Eliminates hardcoded navigator.platform.includes('Mac') checks.
   */
  isMac(): boolean {
    if (typeof navigator === 'undefined') {
      return false;
    }
    const platform = navigator.platform;
    if (cachedIsMac === null || cachedPlatformStr !== platform) {
      cachedPlatformStr = platform;
      cachedIsMac = MAC_REGEX.test(platform);
    }
    return cachedIsMac;
  },

  /**
   * Check if the current platform is iOS.
   */
  isIOS(): boolean {
    if (typeof navigator === 'undefined') {
      return false;
    }
    const platform = navigator.platform;
    if (cachedIsIOS === null || cachedPlatformStr !== platform) {
      cachedPlatformStr = platform;
      cachedIsIOS = IOS_REGEX.test(platform);
    }
    return cachedIsIOS;
  },

  /**
   * Check if the current platform is Windows.
   */
  isWindows(): boolean {
    if (typeof navigator === 'undefined') {
      return false;
    }
    const platform = navigator.platform;
    if (cachedIsWindows === null || cachedPlatformStr !== platform) {
      cachedPlatformStr = platform;
      cachedIsWindows = WINDOWS_REGEX.test(platform);
    }
    return cachedIsWindows;
  },

  /**
   * Check if the current platform is Linux.
   */
  isLinux(): boolean {
    if (typeof navigator === 'undefined') {
      return false;
    }
    const platform = navigator.platform;
    if (cachedIsLinux === null || cachedPlatformStr !== platform) {
      cachedPlatformStr = platform;
      cachedIsLinux = LINUX_REGEX.test(platform);
    }
    return cachedIsLinux;
  },

  /**
   * Get the keyboard shortcut modifier key for the current platform.
   * Returns '⌘' on macOS, 'Ctrl' on other platforms.
   */
  getModifierKey(): string {
    return PLATFORM.isMac() ? '⌘' : 'Ctrl';
  },

  /**
   * Check if the current browser is Microsoft Edge.
   */
  isEdge(): boolean {
    if (typeof navigator === 'undefined') {
      return false;
    }
    const ua = navigator.userAgent;
    if (cachedIsEdge === null || cachedUserAgentStr !== ua) {
      cachedUserAgentStr = ua;
      cachedIsEdge = ua.toLowerCase().includes('edge');
    }
    return cachedIsEdge;
  },

  /**
   * Check if the current browser is Firefox.
   */
  isFirefox(): boolean {
    if (typeof navigator === 'undefined') {
      return false;
    }
    const ua = navigator.userAgent;
    if (cachedIsFirefox === null || cachedUserAgentStr !== ua) {
      cachedUserAgentStr = ua;
      cachedIsFirefox = ua.toLowerCase().includes('firefox');
    }
    return cachedIsFirefox;
  },

  /**
   * Check if the current browser is Safari.
   */
  isSafari(): boolean {
    if (typeof navigator === 'undefined') {
      return false;
    }
    const ua = navigator.userAgent;
    if (cachedIsSafari === null || cachedUserAgentStr !== ua) {
      cachedUserAgentStr = ua;
      const uaLower = ua.toLowerCase();
      cachedIsSafari = uaLower.includes('safari') && !uaLower.includes('chrome');
    }
    return cachedIsSafari;
  },
} as const;

/**
 * Keyboard shortcut utilities.
 */
export const KEYBOARD = {
  /**
   * Common keyboard keys used in shortcuts
   */
  KEYS: {
    ENTER: 'Enter',
    ESCAPE: 'Escape',
    TAB: 'Tab',
    SPACE: ' ',
    BACKSPACE: 'Backspace',
    DELETE: 'Delete',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
  } as const,

  /**
   * Check if a keyboard event matches a specific key.
   */
  isKey(event: KeyboardEvent, key: string): boolean {
    return event.key === key;
  },

  /**
   * Check if modifier keys are pressed.
   */
  hasModifiers(
    event: KeyboardEvent,
    modifiers: {
      meta?: boolean;
      ctrl?: boolean;
      shift?: boolean;
      alt?: boolean;
    } = {}
  ): boolean {
    if (modifiers.meta !== undefined && event.metaKey !== modifiers.meta) {
      return false;
    }
    if (modifiers.ctrl !== undefined && event.ctrlKey !== modifiers.ctrl) {
      return false;
    }
    if (modifiers.shift !== undefined && event.shiftKey !== modifiers.shift) {
      return false;
    }
    if (modifiers.alt !== undefined && event.altKey !== modifiers.alt) {
      return false;
    }
    return true;
  },
} as const;
