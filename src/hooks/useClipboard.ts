'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { triggerHapticFeedback } from '@/lib/utils';
import { UI_TIMING_CONFIG } from '@/lib/config';
import { UI_CONFIG } from '@/lib/config/ui-config';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useClipboard');

export interface UseClipboardOptions {
  duration?: number;
  onCopy?: () => void;
  onPaste?: (text: string) => void;
}

export interface UseClipboardResult {
  copy: (text: string) => Promise<boolean>;
  paste: () => Promise<string | null>;
  hasCopied: boolean;
  hasPasted: boolean;
  /** Indicates the most recent clipboard operation failed */
  hasError: boolean;
  /** Human-readable error message for the most recent failure */
  errorMessage: string | null;
  /** Clears the error state */
  clearError: () => void;
}

export function useClipboard(
  options: UseClipboardOptions = {}
): UseClipboardResult {
  const {
    duration = UI_CONFIG.COPY_FEEDBACK_DURATION,
    onCopy,
    onPaste,
  } = options;

  const [hasCopied, setHasCopied] = useState(false);
  const [hasPasted, setHasPasted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  const clearError = useCallback(() => {
    setHasError(false);
    setErrorMessage(null);
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
  }, []);

  const copy = useCallback(
    async (text: string) => {
      clearError();

      try {
        await navigator.clipboard.writeText(text);
        triggerHapticFeedback();
        setHasCopied(true);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          setHasCopied(false);
        }, duration);

        if (onCopy) {
          onCopy();
        }

        return true;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to copy to clipboard. Please try again.';
        logger.error('Failed to copy text to clipboard', err);
        setHasError(true);
        setErrorMessage(message);

        errorTimeoutRef.current = setTimeout(() => {
          setHasError(false);
          setErrorMessage(null);
        }, UI_TIMING_CONFIG.CLIPBOARD_ERROR_HIDE_DURATION);

        return false;
      }
    },
    [duration, onCopy, clearError]
  );

  const paste = useCallback(async () => {
    clearError();

    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        triggerHapticFeedback();
        setHasPasted(true);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          setHasPasted(false);
        }, duration);

        if (onPaste) {
          onPaste(text);
        }

        return text;
      }
      return null;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to read from clipboard. Please check permissions.';
      logger.error('Failed to read from clipboard', err);
      setHasError(true);
      setErrorMessage(message);

      errorTimeoutRef.current = setTimeout(() => {
        setHasError(false);
        setErrorMessage(null);
      }, UI_TIMING_CONFIG.CLIPBOARD_ERROR_HIDE_DURATION);

      return null;
    }
  }, [duration, onPaste, clearError]);

  return {
    copy,
    paste,
    hasCopied,
    hasPasted,
    hasError,
    errorMessage,
    clearError,
  };
}
