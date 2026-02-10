'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createLogger } from '@/lib/logger';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';
import Alert from '@/components/Alert';
import { Task, Deliverable } from '@/lib/db';
import { ToastOptions } from '@/components/ToastContainer';

interface DeliverableWithTasks extends Deliverable {
  tasks: Task[];
  progress: number;
  completedCount: number;
  totalCount: number;
  totalHours: number;
  completedHours: number;
}

interface TaskManagementProps {
  ideaId: string;
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

type TaskStatus = 'todo' | 'in_progress' | 'completed';

const statusConfig: Record<
  TaskStatus,
  { label: string; color: string; bgColor: string }
> = {
  todo: { label: 'To Do', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  in_progress: {
    label: 'In Progress',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  completed: {
    label: 'Completed',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
};

export default function TaskManagement({ ideaId }: TaskManagementProps) {
  const logger = useMemo(() => createLogger('TaskManagement'), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TasksResponse | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [expandedDeliverables, setExpandedDeliverables] = useState<Set<string>>(
    new Set()
  );

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

        // PERFORMANCE: Pre-calculate deliverable-level and global statistics to ensure consistency
        // and avoid redundant calculations in the render loop. This also provides a safe
        // base for incremental delta updates in handleToggleTaskStatus.
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
              { totalHours: 0, completedHours: 0, totalCount: 0, completedCount: 0 }
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
                stats.totalCount > 0 ? (stats.completedCount / stats.totalCount) * 100 : 0
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
          const task = data?.deliverables
            .flatMap((d) => d.tasks)
            .find((t) => t.id === taskId);
          if (task) {
            const win = window as unknown as Window & {
              showToast?: (options: ToastOptions) => void;
            };
            win.showToast?.({
              type: 'success',
              message: `Nicely done! "${task.title}" is complete.`,
            });
          }
        }

        // PERFORMANCE: Use incremental updates and only update the affected deliverable.
        // This avoids O(D * T) nested loops and minimizes React re-renders.
        setData((prevData) => {
          if (!prevData) return null;

          // Find the deliverable that contains the task
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

          // Calculate deltas for summary
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
    [logger, data]
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
    if (data?.deliverables) {
      setExpandedDeliverables(new Set(data.deliverables.map((d) => d.id)));
    }
  }, [data]);

  // Collapse all deliverables
  const collapseAll = useCallback(() => {
    setExpandedDeliverables(new Set());
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" ariaLabel="Loading tasks" />
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <Alert type="error" title="Error Loading Tasks">
          <p>{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="primary"
            className="mt-4"
          >
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  if (!data || data.deliverables.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <Alert type="info" title="No Tasks Found">
          <p>No tasks have been created for this idea yet.</p>
          <p className="text-sm mt-2 text-gray-600">
            Complete the clarification process to generate tasks.
          </p>
        </Alert>
      </div>
    );
  }

  const { deliverables, summary } = data;

  return (
    <div className="space-y-6">
      {/* Overall Progress Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Task Management
            </h2>
            <p className="text-gray-600 mt-1">
              Track your progress across {summary.totalDeliverables}{' '}
              deliverables
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary-600">
              {summary.overallProgress}%
            </div>
            <div className="text-sm text-gray-600">
              {summary.completedTasks} of {summary.totalTasks} tasks completed
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {summary.completedHours}h of {summary.totalHours}h estimated
              effort
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-primary-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${summary.overallProgress}%` }}
            aria-valuenow={summary.overallProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            role="progressbar"
            aria-label="Overall project progress"
          />
        </div>

        {/* Expand/Collapse Controls */}
        <div className="flex gap-2 mt-4">
          <Button onClick={expandAll} variant="outline" size="sm">
            Expand All
          </Button>
          <Button onClick={collapseAll} variant="outline" size="sm">
            Collapse All
          </Button>
        </div>
      </div>

      {/* Deliverables List */}
      <div className="space-y-4">
        {deliverables.map((deliverable) => {
          const isExpanded = expandedDeliverables.has(deliverable.id);
          const deliverableStyle =
            deliverable.progress === 100
              ? { bgColor: 'bg-green-50', borderColor: 'border-green-200' }
              : deliverable.progress > 0
                ? { bgColor: 'bg-blue-50', borderColor: 'border-blue-200' }
                : { bgColor: 'bg-white', borderColor: 'border-gray-200' };

          return (
            <div
              key={deliverable.id}
              className={`rounded-lg shadow-md border-2 transition-all duration-200 ${deliverableStyle.bgColor} ${deliverableStyle.borderColor}`}
            >
              {/* Deliverable Header */}
              <button
                onClick={() => toggleDeliverable(deliverable.id)}
                aria-expanded={isExpanded}
                className="w-full px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left hover:opacity-80 transition-opacity"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {deliverable.title}
                  </h3>
                  {deliverable.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {deliverable.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {deliverable.progress}%
                    </div>
                    <div className="text-xs text-gray-600">
                      {deliverable.completedCount}/{deliverable.totalCount}{' '}
                      tasks ({deliverable.completedHours}/
                      {deliverable.totalHours}h)
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {/* Tasks List */}
              {isExpanded && (
                <div className="px-6 pb-4 border-t border-gray-200">
                  {/* Deliverable Progress Bar */}
                  <div className="mt-4 mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${deliverable.progress}%` }}
                        role="progressbar"
                        aria-valuenow={deliverable.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${deliverable.title} progress`}
                      />
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="space-y-2">
                    {deliverable.tasks.length === 0 ? (
                      <p className="text-gray-500 text-sm py-4">
                        No tasks in this deliverable.
                      </p>
                    ) : (
                      deliverable.tasks.map((task) => {
                        const isUpdating = updatingTaskId === task.id;
                        const taskStatus = statusConfig[task.status];

                        return (
                          <div
                            key={task.id}
                            className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                          >
                            <button
                              onClick={() =>
                                handleToggleTaskStatus(task.id, task.status)
                              }
                              disabled={isUpdating}
                              className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                task.status === 'completed'
                                  ? 'bg-green-500 border-green-500'
                                  : 'border-gray-300 hover:border-primary-500'
                              } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                              aria-label={
                                task.status === 'completed'
                                  ? 'Mark as incomplete'
                                  : 'Mark as complete'
                              }
                              aria-pressed={task.status === 'completed'}
                            >
                              {task.status === 'completed' && (
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                              {isUpdating && (
                                <LoadingSpinner
                                  size="sm"
                                  ariaLabel="Updating..."
                                />
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p
                                  className={`text-sm font-medium ${
                                    task.status === 'completed'
                                      ? 'text-gray-500 line-through'
                                      : 'text-gray-900'
                                  }`}
                                >
                                  {task.title}
                                </p>
                                <span
                                  className={`flex-shrink-0 px-2 py-0.5 text-xs rounded-full ${taskStatus.bgColor} ${taskStatus.color}`}
                                >
                                  {taskStatus.label}
                                </span>
                              </div>

                              {task.description && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              {/* Task Metadata */}
                              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-500">
                                {task.estimate > 0 && (
                                  <span className="flex items-center gap-1">
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    {task.estimate}h
                                  </span>
                                )}
                                {task.assignee && (
                                  <span className="flex items-center gap-1">
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                      />
                                    </svg>
                                    {task.assignee}
                                  </span>
                                )}
                                {task.risk_level !== 'low' && (
                                  <span
                                    className={`px-1.5 py-0.5 rounded ${
                                      task.risk_level === 'high'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}
                                  >
                                    {task.risk_level} risk
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
