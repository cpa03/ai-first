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
  PRIMARY_PULSE_CONTAINER,
  PRIMARY_PULSE_INNER,
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
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'in_progress' | 'completed'
  >('all');
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

  const filterCounts = useMemo(() => {
    const counts = { all: 0, in_progress: 0, completed: 0 };
    for (const task of allTasks) {
      counts.all++;
      if (task.status === 'in_progress') counts.in_progress++;
      if (task.status === 'completed') counts.completed++;
    }
    return counts;
  }, [allTasks]);

  const handleFilterChange = useCallback(
    (filter: 'all' | 'in_progress' | 'completed') => {
      setStatusFilter(filter);
      setFocusedTaskIndex(-1);
      triggerHapticFeedback();
      const filterLabel =
        filter === 'all'
          ? 'all'
          : filter === 'in_progress'
            ? 'in progress'
            : 'completed';
      const count = filterCounts[filter];
      setExpandAnnouncement(
        TASK_MANAGEMENT_LABELS.FILTER_ANNOUNCEMENT(count, filterLabel)
      );
      setExpandTriggered(true);
    },
    [filterCounts]
  );

  const filteredDeliverables = useMemo(() => {
    if (!data || data.deliverables.length === 0) return [];
    if (statusFilter === 'all') return data.deliverables;
    return data.deliverables
      .map((d) => ({
        ...d,
        tasks: d.tasks.filter((t) => t.status === statusFilter),
      }))
      .filter((d) => d.tasks.length > 0);
  }, [data, statusFilter]);

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
      } else if (e.key === '1') {
        e.preventDefault();
        triggerHapticFeedback();
        handleFilterChange('all');
      } else if (e.key === '2') {
        e.preventDefault();
        triggerHapticFeedback();
        handleFilterChange('in_progress');
      } else if (e.key === '3') {
        e.preventDefault();
        triggerHapticFeedback();
        handleFilterChange('completed');
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
    handleFilterChange,
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
              className={PRIMARY_PULSE_CONTAINER}
              style={{
                animationDuration: `${ANIMATION_CONFIG.ERROR_RELOAD_DELAY / 1000}s`,
              }}
            />
            <div className={PRIMARY_PULSE_INNER} />
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

  const { summary } = data;

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
        statusFilter={statusFilter}
        onFilterChange={handleFilterChange}
        filterCounts={filterCounts}
      />

      <div className="space-y-4">
        {filteredDeliverables.map((deliverable) => (
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
        {filteredDeliverables.length === 0 && statusFilter !== 'all' && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">
              No {statusFilter === 'in_progress' ? 'in progress' : 'completed'}{' '}
              tasks found.
            </p>
          </div>
        )}
      </div>

      {/* Micro-UX: Keyboard shortcut hints for discoverability */}
      {/* Matches the pattern established on the dashboard page */}
      <div
        className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500"
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
            1-3
          </kbd>
          filter
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
