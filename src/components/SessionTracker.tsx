'use client';

import { memo } from 'react';
import { useSessionDuration } from '@/hooks/useSessionDuration';

/**
 * Session Duration Tracker Component
 *
 * Growth: Tracks session duration and page time for retention metrics
 * Automatically tracks:
 * - Session start/end
 * - Time spent on each page
 * - Tab visibility changes
 *
 * This component is hidden and tracks silently in the background.
 *
 * PERFORMANCE: Wrapped in React.memo to prevent unnecessary re-execution of
 * the useSessionDuration hook when its parent component re-renders.
 */
function SessionTracker() {
  // Initialize session tracking - no UI rendered
  useSessionDuration();

  // Return null - this is a tracking-only component with no visual presence
  return null;
}

export default memo(SessionTracker);
