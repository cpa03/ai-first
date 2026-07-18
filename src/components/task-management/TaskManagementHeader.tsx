'use client';

import { memo, useMemo } from 'react';
import Button from '@/components/Button';
import Tooltip from '@/components/Tooltip';
import CopyButton from '@/components/CopyButton';
import {
  MESSAGES,
  TASK_HEADER_STYLES,
  ANIMATION_CONFIG,
  UI_CONFIG,
  TEXT_COLORS,
  TRANSITION_CLASSES,
} from '@/lib/config';
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

  const summaryText = useMemo(() => {
    return [
      `📊 Task Progress Summary`,
      ``,
      `Progress: ${overallProgress}%`,
      `Tasks: ${completedTasks}/${totalTasks} completed`,
      `Hours: ${completedHours}/${totalHours} logged`,
      `Deliverables: ${totalDeliverables}`,
    ].join('\n');
  }, [
    overallProgress,
    completedTasks,
    totalTasks,
    completedHours,
    totalHours,
    totalDeliverables,
  ]);

  return (
    <div className={TASK_HEADER_STYLES.CONTAINER}>
      <div className={TASK_HEADER_STYLES.STATS.CONTAINER}>
        <div>
          <h2 className={TASK_HEADER_STYLES.TITLE}>
            {MESSAGES.TASK_MANAGEMENT.TITLE}
          </h2>
          <p className={TASK_HEADER_STYLES.SUBTITLE}>
            {MESSAGES.TASK_MANAGEMENT.HEADER_SUBTITLE(totalDeliverables)}
          </p>
        </div>
        <div className="text-right">
          <div className={TASK_HEADER_STYLES.STATS.VALUE}>
            {animatedProgress}%
          </div>
          <div className={TASK_HEADER_STYLES.STATS.LABEL}>
            {MESSAGES.TASK_MANAGEMENT.STATS_COMPLETED(
              animatedCompletedTasks,
              totalTasks
            )}
          </div>
          <div className={TASK_HEADER_STYLES.STATS.PERCENTAGE}>
            {MESSAGES.TASK_MANAGEMENT.STATS_HOURS(
              animatedCompletedHours,
              totalHours
            )}
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

      <div className="mt-4">
        <div className="flex gap-2">
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
          <CopyButton
            textToCopy={summaryText}
            label="Copy Summary"
            successLabel="Copied!"
            variant="subtle"
            showToast={true}
          />
        </div>
        {/* Micro-UX: Keyboard shortcut hints for discoverability */}
        {/* Makes [ and ] shortcuts visible without requiring hover, following the ProgressStepper pattern */}
        <div
          className="hidden sm:flex items-center gap-3 mt-2 text-xs text-gray-400 animate-breathe"
          aria-label="Keyboard shortcuts: [ to expand all, ] to collapse all"
        >
          <span className="flex items-center gap-1.5">
            <kbd className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}>
              [
            </kbd>
            <span className={TRANSITION_CLASSES.COLOR}>expand all</span>
          </span>
          <span
            className={`${TEXT_COLORS.MUTED_LIGHT} opacity-50`}
            aria-hidden="true"
          >
            ·
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}>
              ]
            </kbd>
            <span className={TRANSITION_CLASSES.COLOR}>collapse all</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export const TaskManagementHeader = memo(TaskManagementHeaderComponent);
