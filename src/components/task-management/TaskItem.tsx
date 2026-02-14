'use client';

import { memo } from 'react';
import { Task } from '@/lib/db';
import { TaskStatus } from '@/hooks/useTaskManagement';

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

interface TaskItemProps {
  task: Task;
  isUpdating: boolean;
  onToggle: (taskId: string, currentStatus: TaskStatus) => void;
}

function TaskItemComponent({ task, isUpdating, onToggle }: TaskItemProps) {
  const taskStatus = statusConfig[task.status];
  const isCompleted = task.status === 'completed';

  return (
    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
      <button
        onClick={() => onToggle(task.id, task.status)}
        disabled={isUpdating}
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 ${
          isCompleted
            ? 'bg-green-500 border-green-500 scale-110'
            : 'border-gray-300 hover:border-primary-500 hover:scale-105'
        } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        aria-label={
          task.status === 'completed'
            ? `Mark "${task.title}" as incomplete`
            : `Mark "${task.title}" as complete`
        }
        aria-pressed={task.status === 'completed'}
      >
        {isCompleted && (
          <svg
            key={`check-${task.id}`}
            className="w-3 h-3 text-white animate-draw-check"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{
              strokeDasharray: 24,
              strokeDashoffset: 0,
            }}
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
          <svg
            className="w-3 h-3 text-gray-500 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
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
          <p
            className={`text-sm font-medium transition-all duration-300 ${
              task.status === 'completed'
                ? 'text-gray-500 line-through decoration-2 decoration-gray-400'
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
}

export const TaskItem = memo(TaskItemComponent);
