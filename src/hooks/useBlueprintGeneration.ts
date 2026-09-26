'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { generateBlueprintTemplate } from '@/templates/blueprint-template';
import { UI_CONFIG } from '@/lib/config/constants';
import { ANIMATION_DELAYS } from '@/lib/config';
import { createLogger } from '@/lib/logger';
import { API_ERROR_MESSAGES } from '@/lib/config/error-messages';
import { useToast } from '@/hooks/useAnnouncement';

const logger = createLogger('useBlueprintGeneration');

/**
 * Return type for the useBlueprintGeneration hook
 */
export interface UseBlueprintGenerationReturn {
  readonly isGenerating: boolean;
  readonly blueprint: string;
  readonly copied: boolean;
  readonly showCelebration: boolean;
  readonly handleDownload: () => void;
  readonly handleCopy: () => Promise<void>;
  readonly dismissCelebration: () => void;
  readonly handleCancel: () => void;
}

/**
 * Custom hook for managing blueprint generation, download, and copy functionality.
 *
 * @description
 * This hook handles the complete lifecycle of blueprint generation including:
 * - Async blueprint generation with configurable delay
 * - Copy to clipboard with toast feedback
 * - Download as markdown file
 * - Success celebration animation
 *
 * @param {string} idea - The user's idea text
 * @param {Record<string, string>} answers - The clarification answers object
 *
 * @returns {UseBlueprintGenerationReturn} Object containing state and handlers
 *
 * @example
 * ```tsx
 * function BlueprintDisplay({ idea, answers }: Props) {
 *   const {
 *     isGenerating,
 *     blueprint,
 *     copied,
 *     showCelebration,
 *     handleDownload,
 *     handleCopy,
 *     dismissCelebration
 *   } = useBlueprintGeneration(idea, answers);
 *
 *   if (isGenerating) {
 *     return <LoadingSpinner />;
 *   }
 *
 *   return (
 *     <div>
 *       <pre>{blueprint}</pre>
 *       <button onClick={handleCopy}>
 *         {copied ? 'Copied!' : 'Copy'}
 *       </button>
 *       <button onClick={handleDownload}>Download</button>
 *       {showCelebration && <SuccessCelebration onComplete={dismissCelebration} />}
 *     </div>
 *   );
 * }
 * ```
 *
 * @see {@link generateBlueprintTemplate} for template generation logic
 */
export function useBlueprintGeneration(
  idea: string,
  answers: Record<string, string>
): UseBlueprintGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(true);
  const [blueprint, setBlueprint] = useState('');
  const [copied, setCopied] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const downloadCleanupRef = useRef<NodeJS.Timeout | null>(null);
  const isCancelledRef = useRef(false);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      if (downloadCleanupRef.current) {
        clearTimeout(downloadCleanupRef.current);
      }
    };
  }, []);

  // PERFORMANCE: Use useMemo for serialized answers to avoid redundant stringification
  // and ensure it only changes when the content of answers actually changes.
  const serializedAnswers = useMemo(() => JSON.stringify(answers), [answers]);

  // Generate blueprint with delay
  useEffect(() => {
    isCancelledRef.current = false;
    setIsGenerating(true);

    const generateBlueprint = () => {
      timeoutIdRef.current = setTimeout(() => {
        if (isCancelledRef.current) return;

        const generatedBlueprint = generateBlueprintTemplate(idea, answers);

        setBlueprint(generatedBlueprint);
        setIsGenerating(false);
        setShowCelebration(true);
      }, UI_CONFIG.BLUEPRINT_GENERATION_DELAY);
    };

    generateBlueprint();

    return () => {
      isCancelledRef.current = true;
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idea, serializedAnswers]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([blueprint], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-blueprint.md';
    document.body.appendChild(a);

    if (downloadCleanupRef.current) {
      clearTimeout(downloadCleanupRef.current);
    }

    downloadCleanupRef.current = setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      downloadCleanupRef.current = null;
    }, ANIMATION_DELAYS.CLEANUP);

    a.click();
  }, [blueprint]);

  const { showToast } = useToast();

  /**
   * Copies the blueprint to clipboard with toast feedback
   */
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(blueprint);
      setCopied(true);
      copyTimeoutRef.current = setTimeout(
        () => setCopied(false),
        UI_CONFIG.COPY_FEEDBACK_DURATION
      );

      showToast({
        type: 'success',
        message: API_ERROR_MESSAGES.HOOKS.BLUEPRINT_COPIED,
        duration: UI_CONFIG.TOAST_DURATION,
      });
    } catch (err) {
      logger.error('Failed to copy blueprint', err);
      showToast({
        type: 'error',
        message: API_ERROR_MESSAGES.HOOKS.BLUEPRINT_COPY_FAILED,
        duration: UI_CONFIG.TOAST_DURATION,
      });
    }
  }, [blueprint, showToast]);

  /**
   * Dismisses the celebration animation
   */
  const dismissCelebration = useCallback(() => {
    setShowCelebration(false);
  }, []);

  const handleCancel = useCallback(() => {
    isCancelledRef.current = true;
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    setIsGenerating(false);
    showToast({
      type: 'info',
      message: 'Blueprint generation cancelled',
      duration: UI_CONFIG.TOAST_DURATION,
    });
  }, [showToast]);

  // PERFORMANCE: Memoize return object to ensure referential stability
  return useMemo(
    () => ({
      isGenerating,
      blueprint,
      copied,
      showCelebration,
      handleDownload,
      handleCopy,
      dismissCelebration,
      handleCancel,
    }),
    [
      isGenerating,
      blueprint,
      copied,
      showCelebration,
      handleDownload,
      handleCopy,
      dismissCelebration,
      handleCancel,
    ]
  );
}
