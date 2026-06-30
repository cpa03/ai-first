'use client';

import { memo, useMemo } from 'react';
import Button from '@/components/Button';
import Tooltip from '@/components/Tooltip';
import { MESSAGES, TASK_HEADER_STYLES, ANIMATION_CONFIG } from '@/lib/config';
import { triggerHapticFeedback } from '@/lib/utils';
import { useCountUp } from '@/hooks/useCountUp';

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
  // Micro-UX: Animate stats from 0 to actual values for a polished first impression
  // Creates a delightful count-up effect that makes data feel alive
  const { displayValue: animatedProgress } = useCountUp({
    target: overallProgress,
    duration: ANIMATION_CONFIG.TASK_MANAGEMENT.PROGRESS_DURATION,
    delay: ANIMATION_CONFIG.TASK_MANAGEMENT.PROGRESS_DELAY,
  });

  const { displayValue: animatedCompletedTasks } = useCountUp({
    target: completedTasks,
    duration: ANIMATION_CONFIG.TASK_MANAGEMENT.STATS_DURATION,
    delay: ANIMATION_CONFIG.TASK_MANAGEMENT.COMPLETED_TASKS_DELAY,
  });

  const { displayValue: animatedCompletedHours } = useCountUp({
    target: completedHours,
    duration: ANIMATION_CONFIG.TASK_MANAGEMENT.STATS_DURATION,
    delay: ANIMATION_CONFIG.TASK_MANAGEMENT.COMPLETED_HOURS_DELAY,
  });

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
            {animatedProgress}%
          </div>
          <div className={TASK_HEADER_STYLES.STATS.LABEL}>
            {animatedCompletedTasks} of {totalTasks} tasks completed
          </div>
          <div className={TASK_HEADER_STYLES.STATS.PERCENTAGE}>
            {animatedCompletedHours}h of {totalHours}h estimated effort
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
        <Tooltip
          content={MESSAGES.TASK_MANAGEMENT.EXPAND_ALL}
          shortcut={['[']}
          position="bottom"
        >
          <Button
            onClick={() => {
              triggerHapticFeedback();
              onExpandAll();
            }}
            variant="outline"
            size="sm"
          >
            {MESSAGES.TASK_MANAGEMENT.EXPAND_ALL}
          </Button>
        </Tooltip>
        <Tooltip
          content={MESSAGES.TASK_MANAGEMENT.COLLAPSE_ALL}
          shortcut={[']']}
          position="bottom"
        >
          <Button
            onClick={() => {
              triggerHapticFeedback();
              onCollapseAll();
            }}
            variant="outline"
            size="sm"
          >
            {MESSAGES.TASK_MANAGEMENT.COLLAPSE_ALL}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}

export const TaskManagementHeader = memo(TaskManagementHeaderComponent);
