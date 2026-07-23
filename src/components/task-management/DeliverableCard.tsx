'use client';

import { memo, useCallback, useMemo, useState, useEffect, useRef } from 'react';
import type { Task } from '@/lib/db';
import { TaskItem } from './TaskItem';
import type { TaskStatus } from '@/types/task';
import {
  COMPONENT_CONFIG,
  DELIVERABLE_STYLES,
  DELIVERABLE_CARD_STYLES,
  DELIVERABLE_PROGRESS_CONFIG,
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  MESSAGES,
  TEXT_COLORS,
  BG_COLORS,
  DELIVERABLE_CARD_LABELS,
} from '@/lib/config';
import { triggerHapticFeedback } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useConfetti } from '@/hooks/useConfetti';

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
  focusedTaskId?: string | null;
  onToggleExpand: (deliverableId: string) => void;
  onToggleTask: (taskId: string, currentStatus: TaskStatus) => Promise<void>;
}

function DeliverableCardComponent({
  deliverable,
  isExpanded,
  updatingTaskId,
  focusedTaskId = null,
  onToggleExpand,
  onToggleTask,
}: DeliverableCardProps) {
  const deliverableStyle = useMemo(
    () => DELIVERABLE_STYLES.getByProgress(deliverable.progress),
    [deliverable.progress]
  );
  const prefersReducedMotion = usePrefersReducedMotion();
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [showCompletionCelebration, setShowCompletionCelebration] =
    useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const prevExpandedRef = useRef(isExpanded);
  const prevProgressRef = useRef(deliverable.progress);
  const { particles, fire } = useConfetti();

  // Micro-UX: Fire confetti celebration when deliverable reaches 100% completion
  // Delightful positive feedback at the exact moment the deliverable is fully done
  useEffect(() => {
    const justCompleted =
      deliverable.progress === 100 && prevProgressRef.current < 100;

    if (justCompleted && !prefersReducedMotion) {
      triggerHapticFeedback();
      fire();
      setShowCompletionCelebration(true);

      const timer = setTimeout(() => {
        setShowCompletionCelebration(false);
      }, COMPONENT_CONFIG.DELIVERABLE_CARD.CELEBRATION_DURATION_MS);

      prevProgressRef.current = deliverable.progress;
      return () => clearTimeout(timer);
    }

    prevProgressRef.current = deliverable.progress;
  }, [deliverable.progress, prefersReducedMotion, fire]);

  // Micro-UX: Animate progress bar from 0 to actual value when card expands
  // Creates a delightful visual feedback that draws attention to progress
  useEffect(() => {
    if (isExpanded && !prefersReducedMotion) {
      // Reset to 0 first, then animate to actual value
      setAnimatedProgress(0);
      const animationFrame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimatedProgress(deliverable.progress);
        });
      });
      return () => cancelAnimationFrame(animationFrame);
    } else {
      setAnimatedProgress(deliverable.progress);
    }
  }, [isExpanded, deliverable.progress, prefersReducedMotion]);

  // Micro-UX: Smooth scroll newly revealed tasks into view when expanding a deliverable
  // Especially important on mobile where expanded content may be below the fold
  // Matches the pattern established in ClarificationFlow for step changes
  useEffect(() => {
    if (isExpanded && !prevExpandedRef.current && contentRef.current) {
      // Brief delay ensures the content has rendered after expand
      const timer = setTimeout(() => {
        contentRef.current?.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'nearest',
        });
      }, COMPONENT_CONFIG.DELIVERABLE_CARD.EXPAND_SCROLL_DELAY_MS);
      return () => clearTimeout(timer);
    }
    prevExpandedRef.current = isExpanded;
  }, [isExpanded, prefersReducedMotion]);

  const handleToggleExpand = useCallback(() => {
    triggerHapticFeedback();
    onToggleExpand(deliverable.id);
  }, [onToggleExpand, deliverable.id]);

  const progressStyle = useMemo(
    () => ({ width: `${animatedProgress}%` }),
    [animatedProgress]
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

  const isCompleted = deliverable.progress === 100;

  return (
    <div
      className={`${containerClasses} ${showCompletionCelebration ? 'animate-deliverable-complete' : ''}`}
    >
      <button
        onClick={handleToggleExpand}
        aria-expanded={isExpanded}
        aria-controls={
          isExpanded ? `deliverable-tasks-${deliverable.id}` : undefined
        }
        className={DELIVERABLE_CARD_STYLES.HEADER.BASE}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={DELIVERABLE_CARD_STYLES.HEADER.TITLE}>
              {deliverable.title}
            </h3>
            {isCompleted && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${BG_COLORS.SUCCESS_LIGHT} ${TEXT_COLORS.SUCCESS_DARK} ${showCompletionCelebration && !prefersReducedMotion ? 'animate-success-pop' : ''}`}
                role="status"
                aria-label={DELIVERABLE_CARD_LABELS.COMPLETE_ARIA_LABEL}
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox={SVG_VIEWBOX.STANDARD}
                  stroke="currentColor"
                  strokeWidth={SVG_STROKE_WIDTHS.THICK}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {DELIVERABLE_CARD_LABELS.COMPLETE_BADGE}
              </span>
            )}
          </div>
          {deliverable.description && (
            <p className={DELIVERABLE_CARD_STYLES.HEADER.DESCRIPTION}>
              {deliverable.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div
              className={`${DELIVERABLE_CARD_STYLES.HEADER.PROGRESS.VALUE} ${isCompleted ? TEXT_COLORS.SUCCESS_DARK : ''}`}
            >
              {deliverable.progress}%
            </div>
            <div className={DELIVERABLE_CARD_STYLES.HEADER.PROGRESS.LABEL}>
              {MESSAGES.TASK_MANAGEMENT.DELIVERABLE_PROGRESS(
                deliverable.completedCount,
                deliverable.totalCount,
                deliverable.completedHours,
                deliverable.totalHours
              )}
            </div>
          </div>
          <svg
            className={iconClasses}
            fill="none"
            stroke="currentColor"
            viewBox={SVG_VIEWBOX.STANDARD}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div
          ref={contentRef}
          id={`deliverable-tasks-${deliverable.id}`}
          className={`${DELIVERABLE_CARD_STYLES.CONTENT.CONTAINER} ${prefersReducedMotion ? '' : 'animate-expand-content'}`}
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
                {MESSAGES.TASK_MANAGEMENT.DELIVERABLE_EMPTY}
              </p>
            ) : (
              deliverable.tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isUpdating={updatingTaskId === task.id}
                  focused={focusedTaskId === task.id}
                  onToggle={onToggleTask}
                />
              ))
            )}
          </div>
        </div>
      )}
      {/* Micro-UX: Confetti particles for deliverable completion celebration */}
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="absolute rounded-full pointer-events-none animate-copy-confetti"
          style={
            {
              left: '50%',
              top: '50%',
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              '--confetti-x': `${particle.x}px`,
              '--confetti-y': `${particle.y}px`,
              animationDelay: `${particle.delay}ms`,
            } as React.CSSProperties
          }
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export const DeliverableCard = memo(DeliverableCardComponent);
