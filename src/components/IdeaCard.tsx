'use client';

import { memo } from 'react';
import Button from '@/components/Button';
import { DASHBOARD_LABELS, DASHBOARD_PAGE_CONTENT } from '@/lib/config';
import {
  DASHBOARD_SPECIFIC,
  CARD_PATTERNS,
  ICON_SIZES,
  SVG_VIEWBOX,
  SVG_STROKE_WIDTHS,
  ANIMATION_CLASSES,
  TEXT_COLOR_CLASSES,
  BG_COLOR_CLASSES,
  FLEX_PATTERNS,
  ROUNDED_CLASSES,
  SPACE_Y_PATTERNS,
  REMAINING_PATTERNS,
  TYPOGRAPHY_CLASSES,
  COMMON_SPACING_PATTERNS,
  OVERFLOW_PATTERNS,
} from '@/lib/config';
import { getRelativeTime } from '@/lib/utils';
import {
  IDEA_STATUS_CONFIG,
  type IdeaStatus,
} from '@/lib/config/idea-status-config';

interface IdeaCardProps {
  idea: {
    id: string;
    idea: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  onClick: (ideaId: string) => void;
  onDelete?: (ideaId: string) => void;
  isMac: boolean;
  prefersReducedMotion: boolean;
}

function IdeaCardComponent({
  idea,
  onClick,
  onDelete,
  isMac,
  prefersReducedMotion,
}: IdeaCardProps) {
  const statusConfig =
    IDEA_STATUS_CONFIG[idea.status as IdeaStatus] || IDEA_STATUS_CONFIG.draft;

  const handleClick = () => onClick(idea.id);
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(idea.id);
  };

  return (
    <article
      className={`${CARD_PATTERNS.CARD} ${DASHBOARD_SPECIFIC.TABLE_BODY} ${ANIMATION_CLASSES.FADE_IN}`}
      onClick={handleClick}
      role="listitem"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className={FLEX_PATTERNS.COL}>
        {/* Idea Title & Status */}
        <div
          className={`${FLEX_PATTERNS.RESPONSIVE_BETWEEN} ${SPACE_Y_PATTERNS.SM}`}
        >
          <h3
            className={`${TYPOGRAPHY_CLASSES.COMPONENT_HEADING} ${TEXT_COLOR_CLASSES.HEADING} ${OVERFLOW_PATTERNS.HIDDEN} ${REMAINING_PATTERNS.LINE_CLAMP_2}`}
          >
            {idea.idea || 'Untitled Idea'}
          </h3>
          <span
            className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} ${TYPOGRAPHY_CLASSES.XS_MEDIUM} ${ROUNDED_CLASSES.FULL} px-3 py-1 ${FLEX_PATTERNS.SHRINK_0}`}
            aria-label={`Status: ${statusConfig.label}`}
          >
            {statusConfig.label}
          </span>
        </div>

        {/* Meta Info */}
        <div
          className={`${FLEX_PATTERNS.RESPONSIVE_BETWEEN} ${TEXT_COLOR_CLASSES.MUTED} ${TYPOGRAPHY_CLASSES.SMALL}`}
        >
          <time
            dateTime={idea.createdAt}
            aria-label={`Created ${getRelativeTime(idea.createdAt)}`}
          >
            {getRelativeTime(idea.createdAt)}
          </time>
          {idea.updatedAt !== idea.createdAt && (
            <time
              dateTime={idea.updatedAt}
              aria-label={`Updated ${getRelativeTime(idea.updatedAt)}`}
            >
              Updated {getRelativeTime(idea.updatedAt)}
            </time>
          )}
        </div>

        {/* Actions */}
        <div
          className={`${FLEX_PATTERNS.RESPONSIVE_BETWEEN} ${COMMON_SPACING_PATTERNS.PT_SM}`}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClick}
            aria-label={DASHBOARD_LABELS.TABLE_HEADERS.ACTIONS}
          >
            {DASHBOARD_PAGE_CONTENT.ACTIONS.VIEW_BLUEPRINT}
          </Button>

          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className={`${TEXT_COLOR_CLASSES.ERROR} hover:${BG_COLOR_CLASSES.ERROR}`}
              aria-label={DASHBOARD_PAGE_CONTENT.ACTIONS.DELETE_IDEA}
            >
              <svg
                className={`${ICON_SIZES.SM} ${COMMON_SPACING_PATTERNS.MR_XS}`}
                fill="none"
                viewBox={SVG_VIEWBOX.STANDARD}
                stroke="currentColor"
                strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span className="sr-only">
                {DASHBOARD_PAGE_CONTENT.ACTIONS.DELETE}
              </span>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

export default memo(IdeaCardComponent);
