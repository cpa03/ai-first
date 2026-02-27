'use client';

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
 */
export default function SessionTracker() {
  // Initialize session tracking - no UI rendered
  useSessionDuration();

  // Return null - this is a tracking-only component with no visual presence
  return null;
}
