'use client';

import { memo, useCallback, useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';
import Alert from '@/components/Alert';
import StatusAnnouncer from '@/components/StatusAnnouncer';
import { TaskManagementHeader, DeliverableCard } from './task-management';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { triggerHapticFeedback } from '@/lib/utils';
import {
  MESSAGES,
  BUTTON_LABELS,
  COMPONENT_DEFAULTS,
  ANIMATION_CONFIG,
  SVG_STROKE_WIDTHS,
} from '@/lib/config';

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

  const [expandAnnouncement, setExpandAnnouncement] = useState('');
  const [expandTriggered, setExpandTriggered] = useState(false);

  // Micro-UX: Keyboard shortcuts for expand/collapse all deliverables
  // [ = expand all, ] = collapse all (matches keyboard shortcuts help panel)
  useEffect(() => {
    if (!data || data.deliverables.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      if (isInputFocused || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === '[') {
        e.preventDefault();
        triggerHapticFeedback();
        expandAll();
        setExpandAnnouncement('All deliverables expanded');
        setExpandTriggered(true);
      } else if (e.key === ']') {
        e.preventDefault();
        triggerHapticFeedback();
        collapseAll();
        setExpandAnnouncement('All deliverables collapsed');
        setExpandTriggered(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [data, expandAll, collapseAll]);

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
        <div className="flex flex-col items-center text-center py-6">
          {/* Micro-UX improvement: Friendly animated empty state with visual guidance */}
          <div className="relative w-24 h-24 mb-6" aria-hidden="true">
            <div
              className="absolute inset-0 bg-primary-50 rounded-full animate-pulse"
              style={{
                animationDuration: `${ANIMATION_CONFIG.ERROR_RELOAD_DELAY / 1000}s`,
              }}
            />
            <div className="absolute inset-2 bg-primary-100 rounded-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-primary-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={SVG_STROKE_WIDTHS.LIGHT}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {MESSAGES.TASK_MANAGEMENT.NO_TASKS_TITLE}
          </h3>
          <p className="text-gray-600 mb-4 max-w-sm">
            {MESSAGES.TASK_MANAGEMENT.NO_TASKS_DESCRIPTION}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
            <svg
              className="w-4 h-4 text-primary-500 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Complete the clarification process to generate tasks</span>
          </div>
        </div>
      </div>
    );
  }

  const { deliverables, summary } = data;

  return (
    <div className="space-y-6">
      <StatusAnnouncer
        message={expandAnnouncement}
        triggered={expandTriggered}
        politeness="polite"
      />
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
