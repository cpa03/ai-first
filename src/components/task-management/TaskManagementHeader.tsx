'use client';

import { memo } from 'react';
import Button from '@/components/Button';

interface TaskManagementHeaderProps {
  totalDeliverables: number;
  totalTasks: number;
  completedTasks: number;
  totalHours: number;
  completedHours: number;
  overallProgress: number;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

function TaskManagementHeaderComponent({
  totalDeliverables,
  totalTasks,
  completedTasks,
  totalHours,
  completedHours,
  overallProgress,
  onExpandAll,
  onCollapseAll,
}: TaskManagementHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Task Management</h2>
          <p className="text-gray-600 mt-1">
            Track your progress across {totalDeliverables} deliverables
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary-600">
            {overallProgress}%
          </div>
          <div className="text-sm text-gray-600">
            {completedTasks} of {totalTasks} tasks completed
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {completedHours}h of {totalHours}h estimated effort
          </div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-primary-600 h-3 rounded-full transition-all duration-500"
          style={{ width: `${overallProgress}%` }}
          aria-valuenow={overallProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
          aria-label="Overall project progress"
        />
      </div>

      {/* Expand/Collapse Controls */}
      <div className="flex gap-2 mt-4">
        <Button onClick={onExpandAll} variant="outline" size="sm">
          Expand All
        </Button>
        <Button onClick={onCollapseAll} variant="outline" size="sm">
          Collapse All
        </Button>
      </div>
    </div>
  );
}

TaskManagementHeaderComponent.displayName = 'TaskManagementHeader';
export const TaskManagementHeader = memo(TaskManagementHeaderComponent);
