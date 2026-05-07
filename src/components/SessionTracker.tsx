'use client';

import { useSessionDuration } from '@/hooks/useSessionDuration';
import { memo } from 'react';

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
 */
function SessionTrackerComponent() {
  // Initialize session tracking - no UI rendered
  useSessionDuration();

  // Return null - this is a tracking-only component with no visual presence
  return null;
}

// PERFORMANCE: Memoize to prevent unnecessary re-runs when parent components re-render.
// This component has no props and only needs to run its internal tracking logic once on mount.
export default memo(SessionTrackerComponent);
