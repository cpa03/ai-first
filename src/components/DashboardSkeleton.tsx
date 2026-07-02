'use client';

import { memo } from 'react';
import Skeleton from '@/components/Skeleton';
import {
  CARD_PATTERNS,
  TABLE_PATTERNS,
  ANIMATION_DELAYS,
  COMPONENT_CONFIG,
  DASHBOARD_LABELS,
} from '@/lib/config';

function DashboardSkeletonComponent() {
  return (
    <div
      className="animate-fade-in"
      role="status"
      aria-live="polite"
      aria-label={DASHBOARD_LABELS.SKELETON_ARIA_LABEL}
    >
      <span className="sr-only">{DASHBOARD_LABELS.SKELETON_SR_TEXT}</span>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" variant="text" />
          <Skeleton className="h-4 w-32" variant="text" />
        </div>
        <Skeleton className="h-10 w-28" variant="rect" />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Skeleton className="h-10 w-40" variant="rect" />
        <Skeleton className="h-4 w-20" variant="text" />
      </div>

      <div className={CARD_PATTERNS.OVERFLOW_HIDDEN}>
        <div className="overflow-x-auto">
          <table
            className={`${TABLE_PATTERNS.container} divide-y divide-gray-200`}
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
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({
                length: COMPONENT_CONFIG.DASHBOARD.SKELETON_ROW_COUNT,
              }).map((_, index) => (
                <tr
                  key={index}
                  className={`animate-fade-in`}
                  style={{
                    animationDelay: `${index * ANIMATION_DELAYS.MICRO}ms`,
                  }}
                >
                  <td className={TABLE_PATTERNS.cell.padding}>
                    <Skeleton className="h-4 w-48 max-w-full" variant="text" />
                  </td>
                  <td className={TABLE_PATTERNS.cell.padding}>
                    <Skeleton className="h-5 w-20" variant="rect" />
                  </td>
                  <td className={TABLE_PATTERNS.cell.padding}>
                    <Skeleton className="h-4 w-24" variant="text" />
                  </td>
                  <td className={TABLE_PATTERNS.actions.container}>
                    <div className={TABLE_PATTERNS.actions.buttonGroup}>
                      <Skeleton className="h-6 w-16" variant="text" />
                      <Skeleton className="h-6 w-12" variant="text" />
                      <Skeleton className="h-6 w-14" variant="text" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <Skeleton className="h-3 w-32" variant="text" />
      </div>
    </div>
  );
}

export default memo(DashboardSkeletonComponent);
