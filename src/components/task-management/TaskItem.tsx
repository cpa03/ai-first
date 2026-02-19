'use client';

import { memo, useCallback, useMemo } from 'react';
import { Task } from '@/lib/db';
import { TaskStatus } from '@/hooks/useTaskManagement';
import {
  SVG_ANIMATION,
  TASK_STATUS_CONFIG,
  RISK_LEVEL_CONFIG,
  TASK_ITEM_STYLES,
  TASK_MANAGEMENT_MESSAGES,
} from '@/lib/config';

interface TaskItemProps {
  task: Task;
  isUpdating: boolean;
  onToggle: (taskId: string, currentStatus: TaskStatus) => void;
}

function TaskItemComponent({ task, isUpdating, onToggle }: TaskItemProps) {
  const taskStatus = TASK_STATUS_CONFIG[task.status];
  const isCompleted = task.status === 'completed';

  const handleClick = useCallback(() => {
    onToggle(task.id, task.status);
  }, [onToggle, task.id, task.status]);

  const checkmarkStyle = useMemo(
    () => ({
      strokeDasharray: SVG_ANIMATION.CHECKMARK_PATH_LENGTH,
      strokeDashoffset: SVG_ANIMATION.DASH_OFFSET.VISIBLE,
    }),
    []
  );

  const checkboxClasses = useMemo(() => {
    const baseClasses = TASK_ITEM_STYLES.CHECKBOX.BASE;
    const stateClasses = isCompleted
      ? TASK_ITEM_STYLES.CHECKBOX.CHECKED
      : TASK_ITEM_STYLES.CHECKBOX.UNCHECKED;
    const disabledClasses = isUpdating
      ? TASK_ITEM_STYLES.CHECKBOX.DISABLED
      : '';
    return `${baseClasses} ${stateClasses} ${disabledClasses}`;
  }, [isCompleted, isUpdating]);

  const titleClasses = useMemo(() => {
    const baseClasses = TASK_ITEM_STYLES.TITLE.BASE;
    const stateClasses = isCompleted
      ? TASK_ITEM_STYLES.TITLE.COMPLETED
      : TASK_ITEM_STYLES.TITLE.PENDING;
    return `${baseClasses} ${stateClasses}`;
  }, [isCompleted]);

  return (
    <div className={TASK_ITEM_STYLES.CONTAINER}>
      <button
        onClick={handleClick}
        disabled={isUpdating}
        className={checkboxClasses}
        aria-label={TASK_MANAGEMENT_MESSAGES.ARIA.CHECKBOX_LABEL(
          task.title,
          isCompleted
        )}
        aria-pressed={isCompleted}
      >
        {isCompleted && (
          <svg
            key={`check-${task.id}`}
            className={TASK_ITEM_STYLES.CHECKMARK.CONTAINER}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={checkmarkStyle}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={TASK_ITEM_STYLES.CHECKMARK.STROKE_WIDTH}
              d={TASK_ITEM_STYLES.CHECKMARK.PATH}
            />
          </svg>
        )}
        {isUpdating && (
          <svg
            className={TASK_ITEM_STYLES.LOADING_SPINNER.CONTAINER}
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth={TASK_ITEM_STYLES.LOADING_SPINNER.STROKE_WIDTH}
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={titleClasses}>{task.title}</p>
          <span
            className={`${TASK_ITEM_STYLES.STATUS_BADGE.BASE} ${taskStatus.bgColor} ${taskStatus.color}`}
          >
            {taskStatus.label}
          </span>
        </div>

        {task.description && (
          <p className={TASK_ITEM_STYLES.DESCRIPTION}>{task.description}</p>
        )}

        <div className={TASK_ITEM_STYLES.METADATA.CONTAINER}>
          {task.estimate > 0 && (
            <span className="flex items-center gap-1">
              <svg
                className={TASK_ITEM_STYLES.METADATA.ICON}
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
                className={TASK_ITEM_STYLES.METADATA.ICON}
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
              className={`${TASK_ITEM_STYLES.METADATA.RISK_BADGE} ${
                RISK_LEVEL_CONFIG[task.risk_level].bgColor
              } ${RISK_LEVEL_CONFIG[task.risk_level].textColor}`}
            >
              {task.risk_level} risk
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export const TaskItem = memo(TaskItemComponent);
