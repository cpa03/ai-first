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
 * PERFORMANCE: Memoized to prevent unnecessary re-execution of the component
 * and its hook during parent re-renders. This is particularly important
 * since it's nested in KeyboardShortcutsProvider which may re-render.
 */
function SessionTrackerComponent() {
  // Initialize session tracking - no UI rendered
  useSessionDuration();

  // Return null - this is a tracking-only component with no visual presence
  return null;
}

export default memo(SessionTrackerComponent);
