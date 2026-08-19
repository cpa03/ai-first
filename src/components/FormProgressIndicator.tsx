'use client';

import { memo, useMemo } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import {
  BG_COLORS,
  TEXT_COLORS,
  DURATION_TAILWIND,
  PROGRESS_PERCENTAGE,
} from '@/lib/config';
import { SIGNUP_PAGE_CONTENT } from '@/lib/config/pages';

interface FormProgressIndicatorProps {
  completedFields: number;
  totalFields: number;
  className?: string;
}

function FormProgressIndicatorComponent({
  completedFields,
  totalFields,
  className = '',
}: FormProgressIndicatorProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const allComplete = completedFields === totalFields;

  const progressPercent = useMemo(
    () =>
      totalFields > 0
        ? Math.round((completedFields / totalFields) * PROGRESS_PERCENTAGE.MAX)
        : 0,
    [completedFields, totalFields]
  );

  const progressColor = allComplete
    ? BG_COLORS.SUCCESS
    : completedFields > 0
      ? BG_COLORS.BRAND
      : BG_COLORS.LIGHT_DARK;

  return (
    <div
      className={`flex items-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={SIGNUP_PAGE_CONTENT.PROGRESS_INDICATOR.ARIA_LABEL}
    >
      <div
        className={`flex-1 h-1.5 ${BG_COLORS.LIGHT_DARK} rounded-full overflow-hidden`}
      >
        <div
          className={`h-full ${progressColor} rounded-full ${prefersReducedMotion ? '' : `transition-all ${DURATION_TAILWIND[500]} ease-out`}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <span
        className={`text-xs font-medium tabular-nums whitespace-nowrap ${
          allComplete ? TEXT_COLORS.SUCCESS_DARK : TEXT_COLORS.MUTED
        } ${prefersReducedMotion ? '' : `transition-colors ${DURATION_TAILWIND[300]}`}`}
      >
        {allComplete
          ? SIGNUP_PAGE_CONTENT.PROGRESS_INDICATOR.ALL_COMPLETE
          : SIGNUP_PAGE_CONTENT.PROGRESS_INDICATOR.PROGRESS_TEXT(
              completedFields,
              totalFields
            )}
      </span>
    </div>
  );
}

FormProgressIndicatorComponent.displayName = 'FormProgressIndicator';

export default memo(FormProgressIndicatorComponent);
