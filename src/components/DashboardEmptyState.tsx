'use client';

import { memo } from 'react';
import Button from '@/components/Button';
import { useRouter } from 'next/navigation';
import { DASHBOARD_PAGE_CONTENT } from '@/lib/config';
import {
  DASHBOARD_SPECIFIC,
  CARD_PATTERNS,
  ICON_SIZES,
  SVG_VIEWBOX,
  SVG_STROKE_WIDTHS,
  ANIMATION_CLASSES,
  TEXT_COLOR_CLASSES,
  FLEX_PATTERNS,
  SPACE_Y_PATTERNS,
  TYPOGRAPHY_CLASSES,
  MB_CLASSES,
  MT_CLASSES,
  LAYOUT_CLASSES,
} from '@/lib/config';

interface DashboardEmptyStateProps {
  filter: string;
  isAuthenticated: boolean;
  onNewIdea: () => void;
}

function DashboardEmptyStateComponent({
  filter,
  isAuthenticated,
  onNewIdea,
}: DashboardEmptyStateProps) {
  const router = useRouter();
  const isFiltered = filter !== 'all';

  return (
    <div
      className={`${DASHBOARD_SPECIFIC.TABLE_BODY} ${ANIMATION_CLASSES.FADE_IN}`}
      role="status"
      aria-live="polite"
    >
      <div className={`${CARD_PATTERNS.CENTERED} ${SPACE_Y_PATTERNS.XL}`}>
        <div
          className={`${FLEX_PATTERNS.CENTER} ${MB_CLASSES.LG}`}
        >
          <svg
            className={`${ICON_SIZES.XXL} ${TEXT_COLOR_CLASSES.MUTED}`}
            fill="none"
            viewBox={SVG_VIEWBOX.STANDARD}
            stroke="currentColor"
            strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        </div>

        <div className={SPACE_Y_PATTERNS.MD}>
          {isFiltered ? (
            <>
              <h3
                className={`${TYPOGRAPHY_CLASSES.SECTION_HEADING} ${TEXT_COLOR_CLASSES.HEADING} text-center`}
              >
                {DASHBOARD_PAGE_CONTENT.EMPTY_STATE.NO_MATCHING_TITLE}
              </h3>
              <p
                className={`${TYPOGRAPHY_CLASSES.BODY} ${TEXT_COLOR_CLASSES.MUTED} text-center`}
              >
                {DASHBOARD_PAGE_CONTENT.EMPTY_STATE.NO_MATCHING_DESCRIPTION.replace(
                  '{filter}',
                  filter
                )}
              </p>
            </>
          ) : (
            <>
              <h3
                className={`${TYPOGRAPHY_CLASSES.SECTION_HEADING} ${TEXT_COLOR_CLASSES.HEADING} text-center`}
              >
                {DASHBOARD_PAGE_CONTENT.EMPTY_STATE.TITLE}
              </h3>
              <p
                className={`${TYPOGRAPHY_CLASSES.BODY} ${TEXT_COLOR_CLASSES.MUTED} text-center`}
              >
                {DASHBOARD_PAGE_CONTENT.EMPTY_STATE.DESCRIPTION}
              </p>
            </>
          )}

          <div className={MT_CLASSES.LG}>
            <Button
              onClick={onNewIdea}
              variant="primary"
              size="lg"
              className={`${LAYOUT_CLASSES.FULL_WIDTH} ${LAYOUT_CLASSES.SM_MAX_W_MD}`}
              aria-label={
                isFiltered
                  ? DASHBOARD_PAGE_CONTENT.EMPTY_STATE.CREATE_NEW_IDEA
                  : DASHBOARD_PAGE_CONTENT.EMPTY_STATE.BUTTON
              }
            >
              {isFiltered
                ? DASHBOARD_PAGE_CONTENT.EMPTY_STATE.CREATE_NEW_IDEA
                : DASHBOARD_PAGE_CONTENT.EMPTY_STATE.BUTTON}
            </Button>

            {isAuthenticated && isFiltered && (
              <Button
                onClick={() => router.push('/dashboard?filter=all')}
                variant="ghost"
                size="sm"
                className={`${MT_CLASSES.SM} ${LAYOUT_CLASSES.FULL_WIDTH} ${LAYOUT_CLASSES.SM_MAX_W_MD}`}
              >
                {DASHBOARD_PAGE_CONTENT.CLEAR_FILTER}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(DashboardEmptyStateComponent);
