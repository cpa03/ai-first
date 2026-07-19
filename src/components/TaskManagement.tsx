'use client';

import { memo, useCallback, useEffect, useState, useRef, useMemo } from 'react';
import TaskManagementSkeleton from '@/components/TaskManagementSkeleton';
import Button from '@/components/Button';
import Alert from '@/components/Alert';
import StatusAnnouncer from '@/components/StatusAnnouncer';
import { TaskManagementHeader, DeliverableCard } from './task-management';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { triggerHapticFeedback } from '@/lib/utils';
import {
  MESSAGES,
  BUTTON_LABELS,
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  TASK_MANAGEMENT_LABELS,
  CARD_PATTERNS,
  ANIMATION_CONFIG,
  TEXT_COLOR_CLASSES,
  BG_COLOR_CLASSES,
  LAYOUT_CLASSES,
  TYPOGRAPHY_CLASSES,
  SPACING_CLASSES,
  ROUNDED_CLASSES,
  UI_CONFIG,
} from '@/lib/config';
import { isFocusedOnInput } from '@/lib/dom-utils';
import type { Task } from '@/lib/db';

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
  const [focusedTaskIndex, setFocusedTaskIndex] = useState<number>(-1);
  const taskRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const allTasks = useMemo(() => {
    if (!data || data.deliverables.length === 0) return [];
    const tasks: Task[] = [];
    for (const deliverable of data.deliverables) {
      for (const task of deliverable.tasks) {
        tasks.push(task);
      }
    }
    return tasks;
  }, [data]);

  const focusedTaskId = useMemo(
    () =>
      focusedTaskIndex >= 0 && focusedTaskIndex < allTasks.length
        ? allTasks[focusedTaskIndex].id
        : null,
    [focusedTaskIndex, allTasks]
  );

  useEffect(() => {
    if (focusedTaskIndex >= 0 && focusedTaskIndex < allTasks.length) {
      const taskId = allTasks[focusedTaskIndex].id;
      const taskElement = taskRefs.current.get(taskId);
      if (taskElement) {
        taskElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
        taskElement.focus();
      }
    }
  }, [focusedTaskIndex, allTasks]);

  // Micro-UX: Keyboard shortcuts for expand/collapse all deliverables
  // [ = expand all, ] = collapse all (matches keyboard shortcuts help panel)
  // Arrow keys = navigate between tasks, Enter/Space = toggle focused task
  useEffect(() => {
    if (!data || data.deliverables.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFocusedOnInput(e.target) || e.metaKey || e.ctrlKey || e.altKey)
        return;

      if (e.key === '[') {
        e.preventDefault();
        triggerHapticFeedback();
        expandAll();
        setExpandAnnouncement(TASK_MANAGEMENT_LABELS.EXPAND_ALL_ANNOUNCEMENT);
        setExpandTriggered(true);
      } else if (e.key === ']') {
        e.preventDefault();
        triggerHapticFeedback();
        collapseAll();
        setExpandAnnouncement(TASK_MANAGEMENT_LABELS.COLLAPSE_ALL_ANNOUNCEMENT);
        setExpandTriggered(true);
      } else if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        triggerHapticFeedback();
        setFocusedTaskIndex((prev) => {
          const nextIndex = prev < allTasks.length - 1 ? prev + 1 : 0;
          return nextIndex;
        });
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        triggerHapticFeedback();
        setFocusedTaskIndex((prev) => {
          const nextIndex = prev > 0 ? prev - 1 : allTasks.length - 1;
          return nextIndex;
        });
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (focusedTaskIndex >= 0 && focusedTaskIndex < allTasks.length) {
          e.preventDefault();
          triggerHapticFeedback();
          const task = allTasks[focusedTaskIndex];
          handleToggleTaskStatus(task.id, task.status);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setFocusedTaskIndex(-1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    data,
    expandAll,
    collapseAll,
    allTasks,
    focusedTaskIndex,
    handleToggleTaskStatus,
  ]);

  // PERFORMANCE: Memoize reload handler to prevent function recreation on each render
  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  if (loading) {
    return <TaskManagementSkeleton />;
  }

  if (error) {
    return (
      <div className={CARD_PATTERNS.BASE}>
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
      <div className={CARD_PATTERNS.BASE}>
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
                viewBox={SVG_VIEWBOX.STANDARD}
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
          <h3
            className={`${TYPOGRAPHY_CLASSES.SUBHEADING} ${TEXT_COLOR_CLASSES.HEADING} ${SPACING_CLASSES.SMALL}`}
          >
            {MESSAGES.TASK_MANAGEMENT.NO_TASKS_TITLE}
          </h3>
          <p
            className={`${TEXT_COLOR_CLASSES.BODY} ${SPACING_CLASSES.ELEMENT} max-w-sm`}
          >
            {MESSAGES.TASK_MANAGEMENT.NO_TASKS_DESCRIPTION}
          </p>
          <div
            className={`${LAYOUT_CLASSES.FLEX_ROW} gap-2 ${TYPOGRAPHY_CLASSES.SMALL} ${TEXT_COLOR_CLASSES.MUTED} ${BG_COLOR_CLASSES.PAGE} px-4 py-2 ${ROUNDED_CLASSES.LARGE}`}
          >
            <svg
              className="w-4 h-4 text-primary-500 flex-shrink-0"
              fill="none"
              viewBox={SVG_VIEWBOX.STANDARD}
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
            <span>{MESSAGES.TASK_MANAGEMENT.NO_TASKS_HINT}</span>
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
            focusedTaskId={focusedTaskId}
            onToggleExpand={toggleDeliverable}
            onToggleTask={handleToggleTaskStatus}
          />
        ))}
      </div>

      {/* Micro-UX: Keyboard shortcut hints for discoverability */}
      {/* Matches the pattern established on the dashboard page */}
      <div
        className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400"
        aria-hidden="true"
      >
        <span className="hidden sm:inline-flex items-center gap-1.5">
          <kbd className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}>
            ↑↓
          </kbd>
          navigate
        </span>
        <span className="hidden sm:inline-flex items-center gap-1.5">
          <kbd className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}>
            Enter
          </kbd>
          toggle task
        </span>
        <span className="hidden sm:inline-flex items-center gap-1.5">
          <kbd className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}>
            [
          </kbd>
          expand all
        </span>
        <span className="hidden sm:inline-flex items-center gap-1.5">
          <kbd className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}>
            ]
          </kbd>
          collapse all
        </span>
        <span className="hidden sm:inline-flex items-center gap-1.5">
          <kbd className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}>
            Esc
          </kbd>
          clear focus
        </span>
      </div>
    </div>
  );
}

export default memo(TaskManagementComponent);
