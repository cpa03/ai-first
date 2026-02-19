'use client';

import { memo, useCallback, useMemo } from 'react';
import { Task } from '@/lib/db';
import { TaskItem } from './TaskItem';
import { TaskStatus } from '@/hooks/useTaskManagement';
import {
  DELIVERABLE_STYLES,
  DELIVERABLE_CARD_STYLES,
  DELIVERABLE_PROGRESS_CONFIG,
} from '@/lib/config';

interface DeliverableWithTasks {
  id: string;
  title: string;
  description?: string;
  tasks: Task[];
  progress: number;
  completedCount: number;
  totalCount: number;
  totalHours: number;
  completedHours: number;
}

interface DeliverableCardProps {
  deliverable: DeliverableWithTasks;
  isExpanded: boolean;
  updatingTaskId: string | null;
  onToggleExpand: (deliverableId: string) => void;
  onToggleTask: (taskId: string, currentStatus: TaskStatus) => Promise<void>;
}

function DeliverableCardComponent({
  deliverable,
  isExpanded,
  updatingTaskId,
  onToggleExpand,
  onToggleTask,
}: DeliverableCardProps) {
  const deliverableStyle = useMemo(
    () => DELIVERABLE_STYLES.getByProgress(deliverable.progress),
    [deliverable.progress]
  );

  const handleToggleExpand = useCallback(() => {
    onToggleExpand(deliverable.id);
  }, [onToggleExpand, deliverable.id]);

  const progressStyle = useMemo(
    () => ({ width: `${deliverable.progress}%` }),
    [deliverable.progress]
  );

  const containerClasses = useMemo(
    () =>
      DELIVERABLE_CARD_STYLES.CONTAINER(
        deliverableStyle.bgColor,
        deliverableStyle.borderColor
      ),
    [deliverableStyle.bgColor, deliverableStyle.borderColor]
  );

  const iconClasses = useMemo(
    () => DELIVERABLE_CARD_STYLES.HEADER.ICON(isExpanded),
    [isExpanded]
  );

  return (
    <div className={containerClasses}>
      <button
        onClick={handleToggleExpand}
        aria-expanded={isExpanded}
        aria-controls={
          isExpanded ? `deliverable-tasks-${deliverable.id}` : undefined
        }
        className={DELIVERABLE_CARD_STYLES.HEADER.BASE}
      >
        <div className="flex-1">
          <h3 className={DELIVERABLE_CARD_STYLES.HEADER.TITLE}>
            {deliverable.title}
          </h3>
          {deliverable.description && (
            <p className={DELIVERABLE_CARD_STYLES.HEADER.DESCRIPTION}>
              {deliverable.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className={DELIVERABLE_CARD_STYLES.HEADER.PROGRESS.VALUE}>
              {deliverable.progress}%
            </div>
            <div className={DELIVERABLE_CARD_STYLES.HEADER.PROGRESS.LABEL}>
              {deliverable.completedCount}/{deliverable.totalCount} tasks (
              {deliverable.completedHours}/{deliverable.totalHours}h)
            </div>
          </div>
          <svg
            className={iconClasses}
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

      {isExpanded && (
        <div
          id={`deliverable-tasks-${deliverable.id}`}
          className={DELIVERABLE_CARD_STYLES.CONTENT.CONTAINER}
        >
          <div className="mt-4 mb-4">
            <div
              className={DELIVERABLE_CARD_STYLES.CONTENT.PROGRESS_BAR.CONTAINER}
            >
              <div
                className={DELIVERABLE_CARD_STYLES.CONTENT.PROGRESS_BAR.FILL}
                style={progressStyle}
                role="progressbar"
                aria-valuenow={deliverable.progress}
                aria-valuemin={
                  DELIVERABLE_PROGRESS_CONFIG.THRESHOLDS.IN_PROGRESS
                }
                aria-valuemax={DELIVERABLE_PROGRESS_CONFIG.THRESHOLDS.COMPLETED}
                aria-label={`${deliverable.title} progress`}
              />
            </div>
          </div>

          <div className="space-y-2">
            {deliverable.tasks.length === 0 ? (
              <p className={DELIVERABLE_CARD_STYLES.CONTENT.EMPTY_STATE}>
                No tasks in this deliverable.
              </p>
            ) : (
              deliverable.tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isUpdating={updatingTaskId === task.id}
                  onToggle={onToggleTask}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export const DeliverableCard = memo(DeliverableCardComponent);
