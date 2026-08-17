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
  SKELETON_PROGRESS,
  GRAY_CLASSES,
  ICON_SIZES,
  FLEX_PATTERNS,
  SPACE_Y_PATTERNS,
  SPACING_PATTERNS,
  SKELETON_SIZE_PATTERNS,
  TEXT_ALIGNMENT,
  MB_CLASSES,
} from '@/lib/config';
import { FADE_IN } from '@/lib/config/animation-classes';
import {
  SKELETON_FULL_THIRD,
  FLEX_1,
} from '@/lib/config/remaining-hardcoded-patterns';

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
      className={FADE_IN}
      role="status"
      aria-live="polite"
      aria-label={TASK_MANAGEMENT_LABELS.SKELETON_ARIA_LABEL}
    >
      <span className="sr-only">{TASK_MANAGEMENT_LABELS.SKELETON_SR_TEXT}</span>

      {/* Header skeleton - mirrors TaskManagementHeader layout */}
      <div className={CARD_PATTERNS.BASE}>
        <div
          className={`${FLEX_PATTERNS.BETWEEN_START} ${SPACING_PATTERNS.MB4}`}
        >
          <div className={SPACE_Y_PATTERNS.SM}>
            <Skeleton
              className={SKELETON_SIZE_PATTERNS.TAG_MD}
              variant="text"
            />
            <Skeleton
              className={SKELETON_SIZE_PATTERNS.TAG_SM}
              variant="text"
            />
          </div>
          <div className={`text-right ${SPACE_Y_PATTERNS.SM}`}>
            <Skeleton
              className={`${SKELETON_SIZE_PATTERNS.ICON_LG} ml-auto`}
              variant="text"
            />
            <Skeleton
              className={`${SKELETON_SIZE_PATTERNS.CAPTION_SM} ml-auto`}
              variant="text"
            />
            <Skeleton
              className={`${SKELETON_SIZE_PATTERNS.CAPTION_SM} ml-auto`}
              variant="text"
            />
          </div>
        </div>

        {/* Progress bar skeleton */}
        <div className={SKELETON_PROGRESS}>
          <Skeleton className={SKELETON_FULL_THIRD} variant="rect" />
        </div>

        {/* Action buttons skeleton */}
        <div className={`${FLEX_PATTERNS.ROW} ${SPACING_PATTERNS.GAP2}`}>
          <Skeleton
            className={SKELETON_SIZE_PATTERNS.BUTTON_SM}
            variant="rect"
          />
          <Skeleton
            className={SKELETON_SIZE_PATTERNS.BUTTON_MD}
            variant="rect"
          />
        </div>
      </div>

      {/* Deliverable cards skeleton - mirrors DeliverableCard layout */}
      <div className={`${SPACE_Y_PATTERNS.LG} ${SPACING_PATTERNS.MT6}`}>
        {Array.from({
          length:
            COMPONENT_CONFIG.TASK_MANAGEMENT?.SKELETON_DELIVERABLE_COUNT ?? 3,
        }).map((_, index) => (
          <div
            key={index}
            className={FADE_IN}
            style={{
              animationDelay: `${index * ANIMATION_CONFIG.DASHBOARD_STAGGER_DELAY}ms`,
            }}
          >
            <div
              className={`${CARD_PATTERNS.BASE} border-l-4 border-l-gray-200`}
            >
              {/* Deliverable header */}
              <div className={FLEX_PATTERNS.BETWEEN}>
                <div className={FLEX_1}>
                  <Skeleton
                    className={`${SKELETON_SIZE_PATTERNS.TAG_MD} ${MB_CLASSES.MD}`}
                    variant="text"
                  />
                  <Skeleton
                    className={SKELETON_SIZE_PATTERNS.TAG_LG}
                    variant="text"
                  />
                </div>
                <div className={FLEX_PATTERNS.GAP_XL}>
                  <div className={TEXT_ALIGNMENT.RIGHT}>
                    <Skeleton
                      className={`${SKELETON_SIZE_PATTERNS.BADGE_SM} ${MB_CLASSES.SM} ml-auto`}
                      variant="text"
                    />
                    <Skeleton
                      className={`${SKELETON_SIZE_PATTERNS.CAPTION_SM} ml-auto`}
                      variant="text"
                    />
                  </div>
                  <svg
                    className={`${ICON_SIZES.LG} ${GRAY_CLASSES.TEXT_300}`}
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
