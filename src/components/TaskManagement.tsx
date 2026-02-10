'use client';

import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';
import Alert from '@/components/Alert';
import { TaskManagementHeader, DeliverableCard } from './task-management';
import { useTaskManagement } from '@/hooks/useTaskManagement';

interface TaskManagementProps {
  ideaId: string;
}

export default function TaskManagement({ ideaId }: TaskManagementProps) {
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
