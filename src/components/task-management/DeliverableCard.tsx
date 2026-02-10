'use client';

import { Task } from '@/lib/db';
import { TaskItem } from './TaskItem';
import { TaskStatus } from '@/hooks/useTaskManagement';

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

export function DeliverableCard({
  deliverable,
  isExpanded,
  updatingTaskId,
  onToggleExpand,
  onToggleTask,
}: DeliverableCardProps) {
  const deliverableStyle =
    deliverable.progress === 100
      ? { bgColor: 'bg-green-50', borderColor: 'border-green-200' }
      : deliverable.progress > 0
        ? { bgColor: 'bg-blue-50', borderColor: 'border-blue-200' }
        : { bgColor: 'bg-white', borderColor: 'border-gray-200' };

  return (
    <div
      className={`rounded-lg shadow-md border-2 transition-all duration-200 ${deliverableStyle.bgColor} ${deliverableStyle.borderColor}`}
    >
      {/* Deliverable Header */}
      <button
        onClick={() => onToggleExpand(deliverable.id)}
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
              {deliverable.completedCount}/{deliverable.totalCount} tasks (
              {deliverable.completedHours}/{deliverable.totalHours}h)
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
