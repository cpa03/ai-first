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
 * PERFORMANCE: This component is memoized to prevent unnecessary re-renders
 * when its parent (KeyboardShortcutsProvider) re-renders due to help modal
 * state changes. Since it has no props and only side effects in a hook,
 * one initial render is sufficient.
 */
function SessionTracker() {
  // Initialize session tracking - no UI rendered
  useSessionDuration();

  // Return null - this is a tracking-only component with no visual presence
  return null;
}

export default memo(SessionTracker);
