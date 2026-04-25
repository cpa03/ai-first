'use client';

import { memo, useMemo } from 'react';
import Button from '@/components/Button';
import { TASK_HEADER_STYLES } from '@/lib/config/task-management';
import { MESSAGES } from '@/lib/config/ui';

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
  const progressStyle = useMemo(
    () => ({ width: `${overallProgress}%` }),
    [overallProgress]
  );

  return (
    <div className={TASK_HEADER_STYLES.CONTAINER}>
      <div className={TASK_HEADER_STYLES.STATS.CONTAINER}>
        <div>
          <h2 className={TASK_HEADER_STYLES.TITLE}>
            {MESSAGES.TASK_MANAGEMENT.TITLE}
          </h2>
          <p className={TASK_HEADER_STYLES.SUBTITLE}>
            Track your progress across {totalDeliverables} deliverables
          </p>
        </div>
        <div className="text-right">
          <div className={TASK_HEADER_STYLES.STATS.VALUE}>
            {overallProgress}%
          </div>
          <div className={TASK_HEADER_STYLES.STATS.LABEL}>
            {completedTasks} of {totalTasks} tasks completed
          </div>
          <div className={TASK_HEADER_STYLES.STATS.PERCENTAGE}>
            {completedHours}h of {totalHours}h estimated effort
          </div>
        </div>
      </div>

      <div className={TASK_HEADER_STYLES.PROGRESS.CONTAINER}>
        <div
          className={TASK_HEADER_STYLES.PROGRESS.BAR}
          style={progressStyle}
          aria-valuenow={overallProgress}
          aria-valuemin={TASK_HEADER_STYLES.PROGRESS.ARIA.MIN}
          aria-valuemax={TASK_HEADER_STYLES.PROGRESS.ARIA.MAX}
          role="progressbar"
          aria-label={MESSAGES.TASK_MANAGEMENT.PROGRESS_LABEL}
        />
      </div>

      <div className="flex gap-2 mt-4">
        <Button onClick={onExpandAll} variant="outline" size="sm">
          {MESSAGES.TASK_MANAGEMENT.EXPAND_ALL}
        </Button>
        <Button onClick={onCollapseAll} variant="outline" size="sm">
          {MESSAGES.TASK_MANAGEMENT.COLLAPSE_ALL}
        </Button>
      </div>
    </div>
  );
}

export const TaskManagementHeader = memo(TaskManagementHeaderComponent);
