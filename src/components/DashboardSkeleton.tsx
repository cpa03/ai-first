'use client';

import { memo } from 'react';
import Skeleton from '@/components/Skeleton';
import {
  CARD_PATTERNS,
  TABLE_PATTERNS,
  ANIMATION_DELAYS,
  COMPONENT_CONFIG,
  DASHBOARD_LABELS,
  BG_COLORS,
  BORDER_COLORS,
  FLEX_PATTERNS,
  SPACE_Y_PATTERNS,
  SKELETON_SIZE_PATTERNS,
  MB_CLASSES,
  MT_CLASSES,
  COMMON_SPACING_PATTERNS,
  OVERFLOW_PATTERNS,
  TABLE_BODY_DIVIDE,
} from '@/lib/config';
import { FADE_IN } from '@/lib/config/animation-classes';
import { SR_ONLY } from '@/lib/config/remaining-hardcoded-patterns';

function DashboardSkeletonComponent() {
  return (
    <div
      className={FADE_IN}
      role="status"
      aria-live="polite"
      aria-label={DASHBOARD_LABELS.SKELETON_ARIA_LABEL}
    >
      <span className={SR_ONLY}>{DASHBOARD_LABELS.SKELETON_SR_TEXT}</span>

      <div className={`${FLEX_PATTERNS.RESPONSIVE_BETWEEN} ${MB_CLASSES.XXXL}`}>
        <div className={SPACE_Y_PATTERNS.SM}>
          <Skeleton
            className={SKELETON_SIZE_PATTERNS.HEADING_SM}
            variant="text"
          />
          <Skeleton
            className={SKELETON_SIZE_PATTERNS.CAPTION_SM}
            variant="text"
          />
        </div>
        <Skeleton className={SKELETON_SIZE_PATTERNS.BUTTON_SM} variant="rect" />
      </div>

      <div
        className={`${MB_CLASSES.XXL} flex flex-wrap items-center ${COMMON_SPACING_PATTERNS.FLEX_CENTER_LG}`}
      >
        <Skeleton
          className={SKELETON_SIZE_PATTERNS.BUTTON_RESPONSIVE_SM}
          variant="rect"
        />
        <Skeleton className={SKELETON_SIZE_PATTERNS.BADGE_SM} variant="text" />
      </div>

      <div className={CARD_PATTERNS.OVERFLOW_HIDDEN}>
        <div className={OVERFLOW_PATTERNS.X_AUTO}>
          <table
            className={`${TABLE_PATTERNS.container} ${TABLE_BODY_DIVIDE}`}
            aria-hidden="true"
          >
            <thead className={TABLE_PATTERNS.header.container}>
              <tr>
                <th scope="col" className={TABLE_PATTERNS.header.cell}>
                  {DASHBOARD_LABELS.TABLE_HEADERS.TITLE}
                </th>
                <th scope="col" className={TABLE_PATTERNS.header.cell}>
                  {DASHBOARD_LABELS.TABLE_HEADERS.STATUS}
                </th>
                <th scope="col" className={TABLE_PATTERNS.header.cell}>
                  {DASHBOARD_LABELS.TABLE_HEADERS.CREATED}
                </th>
                <th
                  scope="col"
                  className={TABLE_PATTERNS.header.cell.replace(
                    'text-left',
                    'text-right'
                  )}
                >
                  {DASHBOARD_LABELS.TABLE_HEADERS.ACTIONS}
                </th>
              </tr>
            </thead>
            <tbody
              className={`${BG_COLORS.DEFAULT} divide-y ${BORDER_COLORS.LIGHT}`}
            >
              {Array.from({
                length: COMPONENT_CONFIG.DASHBOARD.SKELETON_ROW_COUNT,
              }).map((_, index) => (
                <tr
                  key={index}
                  className={`${FADE_IN}`}
                  style={{
                    animationDelay: `${index * ANIMATION_DELAYS.MICRO}ms`,
                  }}
                >
                  <td className={TABLE_PATTERNS.cell.padding}>
                    <Skeleton
                      className={SKELETON_SIZE_PATTERNS.TAG_MD}
                      variant="text"
                    />
                  </td>
                  <td className={TABLE_PATTERNS.cell.padding}>
                    <Skeleton
                      className={SKELETON_SIZE_PATTERNS.BADGE_SM}
                      variant="rect"
                    />
                  </td>
                  <td className={TABLE_PATTERNS.cell.padding}>
                    <Skeleton
                      className={SKELETON_SIZE_PATTERNS.TAG_SM}
                      variant="text"
                    />
                  </td>
                  <td className={TABLE_PATTERNS.actions.container}>
                    <div className={TABLE_PATTERNS.actions.buttonGroup}>
                      <Skeleton
                        className={SKELETON_SIZE_PATTERNS.TAG_SM}
                        variant="text"
                      />
                      <Skeleton
                        className={SKELETON_SIZE_PATTERNS.BADGE_SM}
                        variant="text"
                      />
                      <Skeleton
                        className={SKELETON_SIZE_PATTERNS.TAG_SM}
                        variant="text"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className={`${MT_CLASSES.LG} ${COMMON_SPACING_PATTERNS.FLEX_CENTER_LG}`}
      >
        <Skeleton
          className={SKELETON_SIZE_PATTERNS.CAPTION_SM}
          variant="text"
        />
      </div>
    </div>
  );
}

export default memo(DashboardSkeletonComponent);
