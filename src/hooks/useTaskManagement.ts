'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createLogger } from '@/lib/logger';
import { fetchWithTimeout } from '@/lib/api-client';
import type { Task, Deliverable } from '@/lib/db';
import { triggerHapticFeedback } from '@/lib/utils';
import type { TaskStatus } from '@/types/task';
import { API_ENDPOINTS, HTTP_HEADERS, API_ERROR_MESSAGES } from '@/lib/config';

export interface DeliverableWithTasks extends Deliverable {
  tasks: Task[];
  progress: number;
  completedCount: number;
  totalCount: number;
  totalHours: number;
  completedHours: number;
}

interface TasksResponse {
  ideaId: string;
  deliverables: DeliverableWithTasks[];
  summary: {
    totalDeliverables: number;
    totalTasks: number;
    completedTasks: number;
    totalHours: number;
    completedHours: number;
    overallProgress: number;
  };
}

interface UseTaskManagementReturn {
  loading: boolean;
  error: string | null;
  data: TasksResponse | null;
  updatingTaskId: string | null;
  expandedDeliverables: Set<string>;
  handleToggleTaskStatus: (
    taskId: string,
    currentStatus: TaskStatus
  ) => Promise<void>;
  toggleDeliverable: (deliverableId: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
}

export function useTaskManagement(ideaId: string): UseTaskManagementReturn {
  const logger = useMemo(() => createLogger('TaskManagement'), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TasksResponse | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [expandedDeliverables, setExpandedDeliverables] = useState<Set<string>>(
    new Set()
  );

  // Track previous data for rollback on error (per-task to handle rapid toggles)
  const previousDataByTaskRef = useRef<Map<string, TasksResponse | null>>(
    new Map()
  );

  // PERFORMANCE: Use a ref to keep track of the latest data without triggering
  // re-creations of callbacks that depend on it.
  const dataRef = useRef(data);

  // Update dataRef when data changes - MUST be in useEffect to satisfy React lint rules
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Fetch tasks on mount
  useEffect(() => {
    const abortController = new AbortController();

    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchWithTimeout(
          API_ENDPOINTS.IDEA_TASKS(ideaId),
          undefined,
          undefined,
          abortController.signal
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch tasks');
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(API_ERROR_MESSAGES.PAGE.INVALID_SERVER_RESPONSE);
        }

        // PERFORMANCE: Use server-provided statistics to avoid redundant client-side calculations
        // This leverages the work already done by the API and keeps the client lightweight.
        const { deliverables, summary } = result.data;

        setData({ ideaId, deliverables, summary });

        // Expand all deliverables by default
        if (deliverables.length > 0) {
          setExpandedDeliverables(
            new Set(deliverables.map((d: DeliverableWithTasks) => d.id))
          );
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        logger.errorWithContext('Failed to fetch tasks', {
          component: 'TaskManagement',
          action: 'fetchTasks',
          metadata: {
            ideaId,
            error: err instanceof Error ? err.message : 'Unknown error',
          },
        });
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };

    if (ideaId) {
      fetchTasks();
    }

    return () => {
      abortController.abort();
    };
  }, [ideaId, logger]);

  // Helper function to apply task status update to state
  const applyTaskStatusUpdate = useCallback(
    (
      prevData: TasksResponse | null,
      taskId: string,
      newStatus: TaskStatus
    ): TasksResponse | null => {
      if (!prevData) return null;

      const dIndex = prevData.deliverables.findIndex((d) =>
        d.tasks.some((t) => t.id === taskId)
      );
      if (dIndex === -1) return prevData;

      const deliverable = prevData.deliverables[dIndex];
      const taskIndex = deliverable.tasks.findIndex((t) => t.id === taskId);
      const task = deliverable.tasks[taskIndex];
      const est = Number(task.estimate) || 0;

      let deltaTasks = 0;
      let deltaHours = 0;

      if (newStatus === 'completed' && task.status !== 'completed') {
        deltaTasks = 1;
        deltaHours = est;
      } else if (newStatus !== 'completed' && task.status === 'completed') {
        deltaTasks = -1;
        deltaHours = -est;
      }

      if (deltaTasks === 0) return prevData;

      const updatedTasks = [...deliverable.tasks];
      updatedTasks[taskIndex] = {
        ...task,
        status: newStatus,
        completion_percentage: newStatus === 'completed' ? 100 : 0,
      };

      const newCompletedCount = deliverable.completedCount + deltaTasks;
      const newCompletedHours =
        Math.round((deliverable.completedHours + deltaHours) * 10) / 10;

      const updatedDeliverable = {
        ...deliverable,
        tasks: updatedTasks,
        completedCount: newCompletedCount,
        completedHours: newCompletedHours,
        progress: Math.round(
          updatedTasks.length > 0
            ? (newCompletedCount / updatedTasks.length) * 100
            : 0
        ),
      };

      const updatedDeliverables = [...prevData.deliverables];
      updatedDeliverables[dIndex] = updatedDeliverable;

      const { summary } = prevData;
      const newOverallCompletedTasks = summary.completedTasks + deltaTasks;
      const newOverallCompletedHours =
        Math.round((summary.completedHours + deltaHours) * 10) / 10;

      return {
        ...prevData,
        deliverables: updatedDeliverables,
        summary: {
          ...summary,
          completedTasks: newOverallCompletedTasks,
          completedHours: newOverallCompletedHours,
          overallProgress: Math.round(
            summary.totalTasks > 0
              ? (newOverallCompletedTasks / summary.totalTasks) * 100
              : 0
          ),
        },
      };
    },
    []
  );

  // Toggle task status with OPTIMISTIC updates
  const handleToggleTaskStatus = useCallback(
    async (taskId: string, currentStatus: TaskStatus) => {
      const newStatus: TaskStatus =
        currentStatus === 'completed' ? 'todo' : 'completed';

      previousDataByTaskRef.current.set(taskId, dataRef.current);

      const findTask = () => {
        return dataRef.current?.deliverables
          .flatMap((d) => d.tasks)
          .find((t) => t.id === taskId);
      };

      try {
        setUpdatingTaskId(taskId);

        setData((prevData) =>
          applyTaskStatusUpdate(prevData, taskId, newStatus)
        );

        if (newStatus === 'completed' && typeof window !== 'undefined') {
          triggerHapticFeedback();
          const task = findTask();
          if (task) {
            const win = window as unknown as {
              showToast?: (options: { type: string; message: string }) => void;
            };
            win.showToast?.({
              type: 'success',
              message: `Nicely done! "${task.title}" is complete.`,
            });
          }
        }

        const response = await fetchWithTimeout(
          API_ENDPOINTS.TASK_STATUS(taskId),
          {
            method: 'PATCH',
            headers: HTTP_HEADERS.JSON_CONTENT_TYPE,
            body: JSON.stringify({ status: newStatus }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update task status');
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(API_ERROR_MESSAGES.PAGE.INVALID_SERVER_RESPONSE);
        }

        previousDataByTaskRef.current.delete(taskId);
        logger.info('Task status updated successfully', { taskId, newStatus });
      } catch (err) {
        logger.errorWithContext('Failed to update task status', {
          component: 'TaskManagement',
          action: 'handleToggleTaskStatus',
          metadata: {
            taskId,
            currentStatus,
            newStatus,
            error: err instanceof Error ? err.message : 'Unknown error',
          },
        });

        const rollbackData = previousDataByTaskRef.current.get(taskId);
        if (rollbackData) {
          setData(rollbackData);
          previousDataByTaskRef.current.delete(taskId);
        }

        if (typeof window !== 'undefined') {
          const win = window as unknown as {
            showToast?: (options: { type: string; message: string }) => void;
          };
          win.showToast?.({
            type: 'error',
            message:
              err instanceof Error ? err.message : 'Failed to update task',
          });
        }

        setError(
          err instanceof Error ? err.message : 'Failed to update task status'
        );
      } finally {
        setUpdatingTaskId(null);
      }
    },
    [logger, applyTaskStatusUpdate]
  );

  // Toggle deliverable expansion
  const toggleDeliverable = useCallback((deliverableId: string) => {
    setExpandedDeliverables((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(deliverableId)) {
        newSet.delete(deliverableId);
      } else {
        newSet.add(deliverableId);
      }
      return newSet;
    });
  }, []);

  // Expand all deliverables
  const expandAll = useCallback(() => {
    if (dataRef.current?.deliverables) {
      setExpandedDeliverables(
        new Set(dataRef.current.deliverables.map((d) => d.id))
      );
    }
  }, []);

  // Collapse all deliverables
  const collapseAll = useCallback(() => {
    setExpandedDeliverables(new Set());
  }, []);

  // PERFORMANCE: Memoize return value to prevent unnecessary re-renders of consumers
  return useMemo(
    () => ({
      loading,
      error,
      data,
      updatingTaskId,
      expandedDeliverables,
      handleToggleTaskStatus,
      toggleDeliverable,
      expandAll,
      collapseAll,
    }),
    [
      loading,
      error,
      data,
      updatingTaskId,
      expandedDeliverables,
      handleToggleTaskStatus,
      toggleDeliverable,
      expandAll,
      collapseAll,
    ]
  );
}
