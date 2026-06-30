'use client';

import { memo } from 'react';
import Skeleton from '@/components/Skeleton';
import { CARD_PATTERNS, TABLE_PATTERNS } from '@/lib/config';

/**
 * DashboardSkeleton - Micro-UX improvement for perceived performance
 *
 * Shows a skeleton layout that mirrors the actual dashboard structure:
 * - Header with title + button
 * - Filter controls
 * - Table with shimmering rows
 *
 * This provides better perceived performance than a spinner because:
 * 1. Users immediately see the layout they'll interact with
 * 2. Reduces layout shift when data loads (CLS improvement)
 * 3. Animated shimmer creates a sense of progress
 * 4. Matches the exact structure of the loaded state
 */

const TABLE_ROW_COUNT = 5;

function DashboardSkeletonComponent() {
  return (
    <div
      className="animate-fade-in"
      role="status"
      aria-live="polite"
      aria-label="Loading dashboard"
    >
      {/* Screen reader announcement */}
      <span className="sr-only">Loading your ideas...</span>

      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" variant="text" />
          <Skeleton className="h-4 w-32" variant="text" />
        </div>
        <Skeleton className="h-10 w-28" variant="rect" />
      </div>

      {/* Filter skeleton */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Skeleton className="h-10 w-40" variant="rect" />
        <Skeleton className="h-4 w-20" variant="text" />
      </div>

      {/* Table skeleton */}
      <div className={CARD_PATTERNS.OVERFLOW_HIDDEN}>
        <div className="overflow-x-auto">
          <table
            className={`${TABLE_PATTERNS.container} divide-y divide-gray-200`}
            aria-hidden="true"
          >
            <thead className={TABLE_PATTERNS.header.container}>
              <tr>
                <th scope="col" className={TABLE_PATTERNS.header.cell}>
                  Title
                </th>
                <th scope="col" className={TABLE_PATTERNS.header.cell}>
                  Status
                </th>
                <th scope="col" className={TABLE_PATTERNS.header.cell}>
                  Created
                </th>
                <th
                  scope="col"
                  className={TABLE_PATTERNS.header.cell.replace(
                    'text-left',
                    'text-right'
                  )}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: TABLE_ROW_COUNT }).map((_, index) => (
                <tr
                  key={index}
                  className={`animate-fade-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Title cell */}
                  <td className={TABLE_PATTERNS.cell.padding}>
                    <Skeleton className="h-4 w-48 max-w-full" variant="text" />
                  </td>
                  {/* Status cell */}
                  <td className={TABLE_PATTERNS.cell.padding}>
                    <Skeleton className="h-5 w-20" variant="rect" />
                  </td>
                  {/* Created cell */}
                  <td className={TABLE_PATTERNS.cell.padding}>
                    <Skeleton className="h-4 w-24" variant="text" />
                  </td>
                  {/* Actions cell */}
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

      {/* Pagination skeleton */}
      <div className="mt-3 flex items-center gap-4">
        <Skeleton className="h-3 w-32" variant="text" />
      </div>
    </div>
  );
}

export default memo(DashboardSkeletonComponent);
