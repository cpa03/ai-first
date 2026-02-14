'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createLogger } from '@/lib/logger';
import { Task, Deliverable } from '@/lib/db';

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

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

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

  // PERFORMANCE: Use a ref to keep track of the latest data without triggering
  // re-creations of callbacks that depend on it.
  const dataRef = useRef(data);
  dataRef.current = data;

  // Fetch tasks on mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/ideas/${ideaId}/tasks`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch tasks');
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error('Invalid response from server');
        }

        // PERFORMANCE: Pre-calculate deliverable-level and global statistics
        let totalTasks = 0;
        let completedTasks = 0;
        let totalHours = 0;
        let completedHours = 0;

        const deliverables = (result.data.deliverables || []).map(
          (d: Deliverable & { tasks: Task[] }) => {
            const stats = d.tasks.reduce(
              (acc, t) => {
                const est = Number(t.estimate) || 0;
                acc.totalHours += est;
                acc.totalCount += 1;
                if (t.status === 'completed') {
                  acc.completedHours += est;
                  acc.completedCount += 1;
                }
                return acc;
              },
              {
                totalHours: 0,
                completedHours: 0,
                totalCount: 0,
                completedCount: 0,
              }
            );

            const dTotalHours = Math.round(stats.totalHours * 10) / 10;
            const dCompletedHours = Math.round(stats.completedHours * 10) / 10;

            totalTasks += stats.totalCount;
            completedTasks += stats.completedCount;
            totalHours += dTotalHours;
            completedHours += dCompletedHours;

            return {
              ...d,
              totalCount: stats.totalCount,
              completedCount: stats.completedCount,
              totalHours: dTotalHours,
              completedHours: dCompletedHours,
              progress: Math.round(
                stats.totalCount > 0
                  ? (stats.completedCount / stats.totalCount) * 100
                  : 0
              ),
            };
          }
        );

        const summary = {
          totalDeliverables: deliverables.length,
          totalTasks,
          completedTasks,
          totalHours: Math.round(totalHours * 10) / 10,
          completedHours: Math.round(completedHours * 10) / 10,
          overallProgress: Math.round(
            totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
          ),
        };

        setData({ ideaId, deliverables, summary });

        // Expand all deliverables by default
        if (deliverables.length > 0) {
          setExpandedDeliverables(
            new Set(deliverables.map((d: DeliverableWithTasks) => d.id))
          );
        }
      } catch (err) {
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
  }, [ideaId, logger]);

  // Toggle task status
  const handleToggleTaskStatus = useCallback(
    async (taskId: string, currentStatus: TaskStatus) => {
      const newStatus: TaskStatus =
        currentStatus === 'completed' ? 'todo' : 'completed';

      try {
        setUpdatingTaskId(taskId);

        const response = await fetch(`/api/tasks/${taskId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update task status');
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error('Invalid response from server');
        }

        // Show success toast when task is completed
        if (newStatus === 'completed' && typeof window !== 'undefined') {
          const task = dataRef.current?.deliverables
            .flatMap((d) => d.tasks)
            .find((t) => t.id === taskId);
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

        // PERFORMANCE: Use incremental updates
        setData((prevData) => {
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
        });
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
        setError(
          err instanceof Error ? err.message : 'Failed to update task status'
        );
      } finally {
        setUpdatingTaskId(null);
      }
    },
    [logger]
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

  return {
    loading,
    error,
    data,
    updatingTaskId,
    expandedDeliverables,
    handleToggleTaskStatus,
    toggleDeliverable,
    expandAll,
    collapseAll,
  };
}
