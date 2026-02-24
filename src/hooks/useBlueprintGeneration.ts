'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { generateBlueprintTemplate } from '@/templates/blueprint-template';
import { UI_LEGACY_CONFIG as UI_CONFIG } from '@/lib/config/constants';
import { ANIMATION_DELAYS } from '@/lib/config';
import { createLogger } from '@/lib/logger';
import { ToastOptions } from '@/components/ToastContainer';

const logger = createLogger('useBlueprintGeneration');

/**
 * Return type for the useBlueprintGeneration hook
 */
export interface UseBlueprintGenerationReturn {
  /** Whether the blueprint is currently being generated */
  readonly isGenerating: boolean;
  /** The generated blueprint content as a markdown string */
  readonly blueprint: string;
  /** Whether the blueprint has been copied to clipboard */
  readonly copied: boolean;
  /** Whether to show the success celebration animation */
  readonly showCelebration: boolean;
  /** Handler to download the blueprint as a markdown file */
  readonly handleDownload: () => void;
  /** Handler to copy the blueprint to clipboard */
  readonly handleCopy: () => Promise<void>;
  /** Callback to dismiss the celebration animation */
  readonly dismissCelebration: () => void;
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Generate blueprint with delay
  useEffect(() => {
    let isCancelled = false;

    const generateBlueprint = async () => {
      await new Promise((resolve) =>
        setTimeout(resolve, UI_CONFIG.BLUEPRINT_GENERATION_DELAY)
      );

      // Prevent state updates if component unmounted during generation
      if (isCancelled) return;

      const generatedBlueprint = generateBlueprintTemplate(idea, answers);

      setBlueprint(generatedBlueprint);
      setIsGenerating(false);
      setShowCelebration(true);
    };

    generateBlueprint();

    return () => {
      isCancelled = true;
    };
  }, [idea, answers]);

  /**
   * Downloads the blueprint as a markdown file
   */
  const handleDownload = useCallback(() => {
    const blob = new Blob([blueprint], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-blueprint.md';
    document.body.appendChild(a);

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, ANIMATION_DELAYS.CLEANUP);

    a.click();
  }, [blueprint]);

  /**
   * Copies the blueprint to clipboard with toast feedback
   */
  const handleCopy = useCallback(async () => {
    const win = window as unknown as Window & {
      showToast?: (options: ToastOptions) => void;
    };

    try {
      await navigator.clipboard.writeText(blueprint);
      setCopied(true);
      copyTimeoutRef.current = setTimeout(
        () => setCopied(false),
        UI_CONFIG.COPY_FEEDBACK_DURATION
      );

      if (typeof window !== 'undefined' && win.showToast) {
        win.showToast({
          type: 'success',
          message: 'Blueprint copied to clipboard!',
          duration: UI_CONFIG.TOAST_DURATION,
        });
      }
    } catch (err) {
      logger.error('Failed to copy blueprint', err);
      if (typeof window !== 'undefined' && win.showToast) {
        win.showToast({
          type: 'error',
          message: 'Failed to copy. Please try selecting and copying manually.',
          duration: UI_CONFIG.TOAST_DURATION,
        });
      }
    }
  }, [blueprint]);

  /**
   * Dismisses the celebration animation
   */
  const dismissCelebration = useCallback(() => {
    setShowCelebration(false);
  }, []);

  return {
    isGenerating,
    blueprint,
    copied,
    showCelebration,
    handleDownload,
    handleCopy,
    dismissCelebration,
  };
}
