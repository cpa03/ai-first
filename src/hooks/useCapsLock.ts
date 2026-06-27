'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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

  // Also handle global CapsLock changes (e.g., user toggles CapsLock while not focused on input)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'CapsLock') {
        // Use a small delay to let the browser update the modifier state
        timeoutRef.current = setTimeout(() => {
          setIsCapsLockOn(e.getModifierState('CapsLock'));
        }, 0);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isCapsLockOn,
    handleKeyDown,
    handleKeyUp,
    handleBlur,
  };
}
