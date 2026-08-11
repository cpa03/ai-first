'use client';

import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook to detect Caps Lock state on keyboard events.
 *
 * Useful for password input fields to warn users when Caps Lock is enabled,
 * preventing frustrating login/signup errors.
 *
 * @returns Object with isCapsLockOn state and handlers to attach to input elements
 *
 * @example
 * ```tsx
 * const { isCapsLockOn, handleKeyDown, handleKeyUp } = useCapsLock();
 *
 * <input
 *   type="password"
 *   onKeyDown={handleKeyDown}
 *   onKeyUp={handleKeyUp}
 *   onBlur={handleBlur}
 * />
 * {isCapsLockOn && <CapsLockWarning />}
 * ```
 */
export function useCapsLock() {
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Check the CapsLock state from the keyboard event
    // The getModifierState method returns true if the modifier key is active
    if (e.getModifierState('CapsLock')) {
      setIsCapsLockOn(true);
    }
  }, []);

  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    // Check the CapsLock state from the keyboard event
    if (!e.getModifierState('CapsLock')) {
      setIsCapsLockOn(false);
    }
  }, []);

  const handleBlur = useCallback(() => {
    // Reset CapsLock state when input loses focus
    // This prevents stale state if user switches tabs while CapsLock is on
    setIsCapsLockOn(false);
  }, []);

  // Also handle global CapsLock changes and keep in sync on any interaction
  useEffect(() => {
    const handleGlobalEvent = (e: KeyboardEvent | MouseEvent) => {
      if (typeof e.getModifierState === 'function') {
        setIsCapsLockOn(e.getModifierState('CapsLock'));
      }
    };

    window.addEventListener('keydown', handleGlobalEvent);
    window.addEventListener('mousedown', handleGlobalEvent);
    return () => {
      window.removeEventListener('keydown', handleGlobalEvent);
      window.removeEventListener('mousedown', handleGlobalEvent);
    };
  }, []);

  return {
    isCapsLockOn,
    handleKeyDown,
    handleKeyUp,
    handleBlur,
  };
}
