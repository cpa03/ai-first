/**
 * Optimistic Mutation Hook
 *
 * Provides optimistic UI updates with automatic rollback on failure.
 * This hook enables immediate feedback to users while syncing with the server.
 *
 * @example
 * const { mutate, isPending } = useOptimisticMutation({
 *   mutationFn: (newStatus) => updateTaskStatus(taskId, newStatus),
 *   onOptimistic: () => updateLocalState(newStatus),
 *   onRollback: () => restoreLocalState(),
 *   onError: (error) => showErrorToast(error.message),
 * });
 */

import { useState, useCallback, useRef } from 'react';
import { createLogger } from '@/lib/logger';

export interface OptimisticMutationOptions<T, TVariables> {
  /** The async function that performs the actual mutation */
  mutationFn: (variables: TVariables) => Promise<T>;
  /** Called immediately before mutation to update UI optimistically */
  onOptimistic: (variables: TVariables) => void;
  /** Called when mutation fails to rollback optimistic changes */
  onRollback: () => void;
  /** Called when mutation succeeds */
  onSuccess?: (data: T, variables: TVariables) => void;
  /** Called when mutation fails */
  onError?: (error: Error, variables: TVariables) => void;
  /** Maximum number of retry attempts (default: 2) */
  maxRetries?: number;
  /** Delay between retries in ms (default: 1000) */
  retryDelay?: number;
}

export interface UseOptimisticMutationReturn<T, TVariables> {
  /** Execute the optimistic mutation */
  mutate: (variables: TVariables) => Promise<void>;
  /** Execute the mutation with variables */
  mutateAsync: (variables: TVariables) => Promise<T | undefined>;
  /** True if currently waiting for server response */
  isPending: boolean;
  /** True if currently in retry mode */
  isRetrying: boolean;
  /** True if the optimistic update has been applied */
  isOptimistic: boolean;
  /** Number of retry attempts made */
  retryCount: number;
  /** Current error if any */
  error: Error | null;
  /** Reset error state */
  reset: () => void;
}

const logger = createLogger('useOptimisticMutation');

/**
 * Custom hook for optimistic UI updates
 *
 * @param options - Configuration options for the optimistic mutation
 * @returns Interface for executing and tracking the mutation
 */
export function useOptimisticMutation<T, TVariables>(
  options: OptimisticMutationOptions<T, TVariables>
): UseOptimisticMutationReturn<T, TVariables> {
  const {
    mutationFn,
    onOptimistic,
    onRollback,
    onSuccess,
    onError,
    maxRetries = 2,
    retryDelay = 1000,
  } = options;

  const [isPending, setIsPending] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOptimistic, setIsOptimistic] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  // Use ref to track if we've applied optimistic update
  const optimisticAppliedRef = useRef(false);
  // Use ref to store variables for retry
  const variablesRef = useRef<TVariables | null>(null);

  const reset = useCallback(() => {
    setError(null);
    setIsOptimistic(false);
    setRetryCount(0);
    optimisticAppliedRef.current = false;
    variablesRef.current = null;
  }, []);

  const mutate = useCallback(
    async (variables: TVariables) => {
      // Store variables for potential retry
      variablesRef.current = variables;

      // Reset state
      setError(null);
      setIsPending(true);
      setIsRetrying(false);

      try {
        // Step 1: Apply optimistic update immediately
        optimisticAppliedRef.current = true;
        setIsOptimistic(true);
        onOptimistic(variables);

        logger.info('Optimistic update applied', { variables });

        // Step 2: Attempt server mutation with retries
        let lastError: Error | null = null;
        let attempt = 0;

        while (attempt <= maxRetries) {
          try {
            if (attempt > 0) {
              setIsRetrying(true);
              setRetryCount(attempt);
              logger.info('Retrying mutation', { attempt, variables });
              // Exponential backoff
              await new Promise((resolve) =>
                setTimeout(resolve, retryDelay * Math.pow(2, attempt - 1))
              );
            }

            const data = await mutationFn(variables);

            // Step 3: Success - confirm optimistic update
            logger.info('Mutation succeeded', { attempt, variables });
            setIsPending(false);
            setIsRetrying(false);

            if (onSuccess) {
              onSuccess(data, variables);
            }

            // Clear optimistic flag after successful sync
            setIsOptimistic(false);
            optimisticAppliedRef.current = false;

            return;
          } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));
            attempt++;
            logger.warn('Mutation attempt failed', {
              attempt,
              maxRetries,
              error: lastError.message,
            });
          }
        }

        // All retries exhausted - rollback
        throw lastError;
      } catch (err) {
        // Step 4: Failure - rollback optimistic update
        logger.error('Mutation failed, rolling back', {
          error: err instanceof Error ? err.message : String(err),
        });

        if (optimisticAppliedRef.current) {
          onRollback();
          setIsOptimistic(false);
          optimisticAppliedRef.current = false;
        }

        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setIsPending(false);
        setIsRetrying(false);

        if (onError) {
          onError(error, variables);
        }

        throw error;
      }
    },
    [
      mutationFn,
      onOptimistic,
      onRollback,
      onSuccess,
      onError,
      maxRetries,
      retryDelay,
    ]
  );

  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<T | undefined> => {
      await mutate(variables);
      // Return undefined since we don't store the result
      // If the caller needs the result, they should use onSuccess callback
      return undefined;
    },
    [mutate]
  );

  return {
    mutate,
    mutateAsync,
    isPending,
    isRetrying,
    isOptimistic,
    retryCount,
    error,
    reset,
  };
}

/**
 * Hook for managing multiple optimistic mutations
 * Useful when you need to track multiple operations simultaneously
 */
export function useOptimisticMutationSet() {
  const [pendingMutations, setPendingMutations] = useState<Set<string>>(
    new Set()
  );

  const addPending = useCallback((mutationId: string) => {
    setPendingMutations((prev) => new Set(prev).add(mutationId));
  }, []);

  const removePending = useCallback((mutationId: string) => {
    setPendingMutations((prev) => {
      const next = new Set(prev);
      next.delete(mutationId);
      return next;
    });
  }, []);

  const isPending = useCallback(
    (mutationId?: string) => {
      if (mutationId) {
        return pendingMutations.has(mutationId);
      }
      return pendingMutations.size > 0;
    },
    [pendingMutations]
  );

  return {
    pendingMutations,
    addPending,
    removePending,
    isPending,
  };
}
