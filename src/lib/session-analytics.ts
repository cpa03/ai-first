'use client';

/**
 * Session Analytics - Client-side session and page time tracking
 *
 * Growth: Enables retention metrics tracking
 * Provides functions for tracking:
 * - Session start/end
 * - Time spent on each page
 * - Tab visibility changes
 */

import { createLogger } from '@/lib/logger';
import { generateSecureId } from '@/lib/utils';
import { SESSION_ANALYTICS_CONFIG } from '@/lib/config/constants';
import { SESSION_STORAGE_KEYS } from '@/lib/config';
import { PLATFORM_ENV_KEYS } from '@/lib/config/env-keys';

const logger = createLogger('SessionAnalytics');

/**
 * Event types for session tracking
 */
export const SESSION_EVENTS = {
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  PAGE_TIME: 'page_time',
} as const;

/**
 * Get or create a session ID
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';

  try {
    let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEYS.SESSION_ID);
    if (!sessionId) {
      sessionId = generateSecureId('session');
      sessionStorage.setItem(SESSION_STORAGE_KEYS.SESSION_ID, sessionId);
    }
    return sessionId;
  } catch {
    return 'session_unavailable';
  }
}

/**
 * Get current page context
 */
function getPageContext(): { path: string; title: string } {
  if (typeof window === 'undefined') {
    return { path: '/server', title: 'Server' };
  }
  return {
    path: window.location.pathname,
    title: document.title || 'Unknown',
  };
}

/**
 * Get current timestamp
 */
function getTimestamp(): number {
  return Date.now();
}

/**
 * Internal queue for batch sending
 */
interface SessionEvent {
  event: string;
  timestamp: number;
  session_id: string;
  page_path: string;
  page_title?: string;
  session_duration?: number;
  page_time?: number;
}

const eventQueue: SessionEvent[] = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;

function flushEvents(): void {
  if (eventQueue.length === 0) return;

  const eventsToSend = [...eventQueue];
  eventQueue.length = 0;

  if (process.env[PLATFORM_ENV_KEYS.NODE_ENV] !== 'production') {
    logger.debug('[SessionAnalytics] Flush events:', eventsToSend);
  }

  // Logger.debug for now - can be extended to PostHog later
  if (process.env[PLATFORM_ENV_KEYS.NODE_ENV] !== 'production') {
    logger.debug('[SessionAnalytics] Events:', eventsToSend);
  }

  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }
}

function queueEvent(event: SessionEvent): void {
  eventQueue.push(event);

  // Flush if queue is full
  if (eventQueue.length >= SESSION_ANALYTICS_CONFIG.MAX_QUEUE_SIZE) {
    flushEvents();
    return;
  }

  // Schedule flush
  if (!flushTimeout) {
    flushTimeout = setTimeout(
      flushEvents,
      SESSION_ANALYTICS_CONFIG.FLUSH_INTERVAL_MS
    );
  }
}

/**
 * Track session start
 */
export function trackSessionStart(): void {
  const sessionId = getSessionId();
  const pageContext = getPageContext();

  const event: SessionEvent = {
    event: SESSION_EVENTS.SESSION_START,
    timestamp: getTimestamp(),
    session_id: sessionId,
    page_path: pageContext.path,
    page_title: pageContext.title,
  };

  queueEvent(event);
}

/**
 * Track session end
 * @param sessionDurationMs - Total session duration in milliseconds
 */
export function trackSessionEnd(sessionDurationMs: number): void {
  const sessionId = getSessionId();
  const pageContext = getPageContext();

  const event: SessionEvent = {
    event: SESSION_EVENTS.SESSION_END,
    timestamp: getTimestamp(),
    session_id: sessionId,
    page_path: pageContext.path,
    page_title: pageContext.title,
    session_duration: sessionDurationMs,
  };

  queueEvent(event);
}

/**
 * Track time spent on a page
 * @param pagePath - The page path where time was spent
 * @param timeMs - Time spent on the page in milliseconds
 */
export function trackPageTime(pagePath: string, timeMs: number): void {
  const sessionId = getSessionId();

  const event: SessionEvent = {
    event: SESSION_EVENTS.PAGE_TIME,
    timestamp: getTimestamp(),
    session_id: sessionId,
    page_path: pagePath,
    page_time: timeMs,
  };

  queueEvent(event);
}

/**
 * Flush all pending events
 */
export function flush(): void {
  flushEvents();
}

/**
 * Reset session
 */
export function resetSession(): void {
  eventQueue.length = 0;
  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }

  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem('ideaflow_session_id');
    } catch {
      // Ignore
    }
  }
}
