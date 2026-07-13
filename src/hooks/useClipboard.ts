'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { triggerHapticFeedback } from '@/lib/utils';
import { UI_CONFIG } from '@/lib/config/constants';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useClipboard');

export interface UseClipboardOptions {
  duration?: number;
  onCopy?: () => void;
  onPaste?: (text: string) => void;
}

export function useClipboard(options: UseClipboardOptions = {}) {
  const {
    duration = UI_CONFIG.COPY_FEEDBACK_DURATION || 2000,
    onCopy,
    onPaste,
  } = options;

  const [hasCopied, setHasCopied] = useState(false);
  const [hasPasted, setHasPasted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copy = useCallback(
    async (text: string) => {
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
        logger.error('Failed to copy text to clipboard', err);
        return false;
      }
    },
    [duration, onCopy]
  );

  const paste = useCallback(async () => {
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
      logger.error('Failed to read from clipboard', err);
      return null;
    }
  }, [duration, onPaste]);

  return {
    copy,
    paste,
    hasCopied,
    hasPasted,
  };
}
