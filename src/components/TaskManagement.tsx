'use client';

import { memo, useCallback } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';
import Alert from '@/components/Alert';
import { TaskManagementHeader, DeliverableCard } from './task-management';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { MESSAGES, BUTTON_LABELS, COMPONENT_DEFAULTS } from '@/lib/config';

interface TaskManagementProps {
  ideaId: string;
}

// PERFORMANCE: Memoize TaskManagement to prevent unnecessary re-renders when parent updates.
// Child components (DeliverableCard, TaskItem, TaskManagementHeader) are already memoized.
// This ensures the entire task management tree only re-renders when ideaId prop changes.
function TaskManagementComponent({ ideaId }: TaskManagementProps) {
  const {
    loading,
    error,
    data,
    updatingTaskId,
    expandedDeliverables,
    handleToggleTaskStatus,
    toggleDeliverable,
    expandAll,
    collapseAll,
  } = useTaskManagement(ideaId);

  // PERFORMANCE: Memoize reload handler to prevent function recreation on each render
  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner
            size="lg"
            ariaLabel={COMPONENT_DEFAULTS.ARIA_LABELS.LOADING_TASKS}
          />
          <p className="mt-4 text-gray-600">{MESSAGES.LOADING.TASKS}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <Alert type="error" title={MESSAGES.ERRORS.LOADING_TASKS}>
          <p>{error}</p>
          <Button onClick={handleRetry} variant="primary" className="mt-4">
            {BUTTON_LABELS.RETRY}
          </Button>
        </Alert>
      </div>
    );
  }

  if (!data || data.deliverables.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <Alert type="info" title={MESSAGES.TASK_MANAGEMENT.NO_TASKS_TITLE}>
          <p>{MESSAGES.TASK_MANAGEMENT.NO_TASKS_DESCRIPTION}</p>
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
      <TaskManagementHeader
        totalDeliverables={summary.totalDeliverables}
        totalTasks={summary.totalTasks}
        completedTasks={summary.completedTasks}
        totalHours={summary.totalHours}
        completedHours={summary.completedHours}
        overallProgress={summary.overallProgress}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
      />

      <div className="space-y-4">
        {deliverables.map((deliverable) => (
          <DeliverableCard
            key={deliverable.id}
            deliverable={deliverable}
            isExpanded={expandedDeliverables.has(deliverable.id)}
            updatingTaskId={updatingTaskId}
            onToggleExpand={toggleDeliverable}
            onToggleTask={handleToggleTaskStatus}
          />
        ))}
      </div>
    </div>
  );
}

export default memo(TaskManagementComponent);
