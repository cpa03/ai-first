'use client';

import { memo } from 'react';
import Skeleton from '@/components/Skeleton';
import {
  CARD_PATTERNS,
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  COMPONENT_CONFIG,
  ANIMATION_CONFIG,
  TASK_MANAGEMENT_LABELS,
} from '@/lib/config';

/**
 * TaskManagementSkeleton - Skeleton loading state for TaskManagement component
 *
 * Micro-UX improvement: Provides a visual preview of the task management layout
 * while data is loading. This reduces perceived loading time and gives users
 * a sense of what's coming, following the "content reflow" pattern.
 *
 * Instead of showing a generic spinner, we show skeleton placeholders that mirror
 * the actual component structure:
 * - Header with stats and progress bar
 * - Deliverable cards with task items
 *
 * This follows the same pattern as DashboardSkeleton but adapted for task management.
 */
function TaskManagementSkeletonComponent() {
  return (
    <div
      className="animate-fade-in"
      role="status"
      aria-live="polite"
      aria-label={TASK_MANAGEMENT_LABELS.SKELETON_ARIA_LABEL}
    >
      <span className="sr-only">{TASK_MANAGEMENT_LABELS.SKELETON_SR_TEXT}</span>

      {/* Header skeleton - mirrors TaskManagementHeader layout */}
      <div className={CARD_PATTERNS.BASE}>
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" variant="text" />
            <Skeleton className="h-4 w-32" variant="text" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-8 w-16 ml-auto" variant="text" />
            <Skeleton className="h-4 w-32 ml-auto" variant="text" />
            <Skeleton className="h-3 w-40 ml-auto" variant="text" />
          </div>
        </div>

        {/* Progress bar skeleton */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
          <Skeleton className="h-full w-1/3" variant="rect" />
        </div>

        {/* Action buttons skeleton */}
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" variant="rect" />
          <Skeleton className="h-9 w-32" variant="rect" />
        </div>
      </div>

      {/* Deliverable cards skeleton - mirrors DeliverableCard layout */}
      <div className="space-y-4 mt-6">
        {Array.from({
          length:
            COMPONENT_CONFIG.TASK_MANAGEMENT?.SKELETON_DELIVERABLE_COUNT ?? 3,
        }).map((_, index) => (
          <div
            key={index}
            className="animate-fade-in"
            style={{
              animationDelay: `${index * ANIMATION_CONFIG.DASHBOARD_STAGGER_DELAY}ms`,
            }}
          >
            <div
              className={`${CARD_PATTERNS.BASE} border-l-4 border-l-gray-200`}
            >
              {/* Deliverable header */}
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <Skeleton className="h-5 w-48 mb-2" variant="text" />
                  <Skeleton className="h-4 w-64" variant="text" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Skeleton
                      className="h-5 w-12 mb-1 ml-auto"
                      variant="text"
                    />
                    <Skeleton className="h-3 w-24 ml-auto" variant="text" />
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-300"
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
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

TaskManagementSkeletonComponent.displayName = 'TaskManagementSkeleton';

export default memo(TaskManagementSkeletonComponent);
