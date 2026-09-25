'use client';

import { createLogger } from '@/lib/logger';

const logger = createLogger('GuestMode');

/**
 * Guest Mode Utilities
 * 
 * Handles anonymous user session management using localStorage.
 * Allows users to try the clarify flow without authentication.
 */

// Storage keys
export const GUEST_STORAGE_KEYS = {
  IDEA_ID: 'guest_idea_id',
  IDEA_DATA: 'guest_idea_data',
  SESSION_ID: 'guest_session_id',
  ANSWERS: 'guest_answers',
  CREATED_AT: 'guest_created_at',
} as const;

/**
 * Guest session ID constraints.
 * IDs are `guest_<uuidv4>`; the header value is never trusted verbatim —
 * see isValidGuestSessionId() and getUserIdOrGuest() in src/lib/auth.ts.
 */
export const GUEST_ID_PREFIX = 'guest_';
export const GUEST_SESSION_ID_MAX_LENGTH = 128;

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Generate a unique guest session ID using a cryptographically secure UUID.
 * Predictable IDs (Date.now + Math.random) allow cross-guest impersonation.
 */
export function generateGuestSessionId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return `${GUEST_ID_PREFIX}${crypto.randomUUID()}`;
  }
  // Fallback for environments without crypto.randomUUID (uses CSPRNG).
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(
    ''
  );
  const uuid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  return `${GUEST_ID_PREFIX}${uuid}`;
}

/**
 * Validate a guest session ID from an untrusted source (e.g. request header).
 * Accepts `guest_<uuidv4>` or a bare `<uuidv4>`; rejects anything else,
 * including overlong values (DoS/CRLF guard). Returns false for malformed.
 */
export function isValidGuestSessionId(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  if (value.length === 0 || value.length > GUEST_SESSION_ID_MAX_LENGTH) {
    return false;
  }
  const bare = value.startsWith(GUEST_ID_PREFIX)
    ? value.slice(GUEST_ID_PREFIX.length)
    : value;
  return UUID_V4_REGEX.test(bare);
}

/**
 * Strip the optional `guest_` prefix and return the bare UUIDv4,
 * or null when the value is malformed.
 */
export function normalizeGuestSessionId(value: string): string | null {
  if (!isValidGuestSessionId(value)) return null;
  return value.startsWith(GUEST_ID_PREFIX)
    ? value.slice(GUEST_ID_PREFIX.length)
    : value;
}

/**
 * Check if user has an active guest session
 */
export function hasGuestSession(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(GUEST_STORAGE_KEYS.IDEA_ID);
}

/**
 * Get the current guest idea ID
 */
export function getGuestIdeaId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(GUEST_STORAGE_KEYS.IDEA_ID);
}

/**
 * Get the current guest idea data
 */
export function getGuestIdeaData(): { idea: string; ideaId: string; createdAt: string } | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(GUEST_STORAGE_KEYS.IDEA_DATA);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Save guest idea data
 */
export function saveGuestIdeaData(idea: string, ideaId: string): void {
  if (typeof window === 'undefined') return;
  
  const sessionId = generateGuestSessionId();
  const createdAt = new Date().toISOString();
  
  localStorage.setItem(GUEST_STORAGE_KEYS.SESSION_ID, sessionId);
  localStorage.setItem(GUEST_STORAGE_KEYS.IDEA_ID, ideaId);
  localStorage.setItem(GUEST_STORAGE_KEYS.IDEA_DATA, JSON.stringify({ idea, ideaId, createdAt }));
  localStorage.setItem(GUEST_STORAGE_KEYS.CREATED_AT, createdAt);
  
  logger.info('Guest idea saved', { ideaId, sessionId });
}

/**
 * Save guest answers
 */
export function saveGuestAnswers(answers: Record<string, string>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GUEST_STORAGE_KEYS.ANSWERS, JSON.stringify(answers));
  logger.info('Guest answers saved', { answerCount: Object.keys(answers).length });
}

/**
 * Get guest answers
 */
export function getGuestAnswers(): Record<string, string> | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(GUEST_STORAGE_KEYS.ANSWERS);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Clear guest session (called when user signs up or completes flow)
 */
export function clearGuestSession(): void {
  if (typeof window === 'undefined') return;
  Object.values(GUEST_STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  logger.info('Guest session cleared');
}

/**
 * Check if guest session is expired (older than 7 days)
 */
export function isGuestSessionExpired(): boolean {
  if (typeof window === 'undefined') return true;
  const createdAt = localStorage.getItem(GUEST_STORAGE_KEYS.CREATED_AT);
  if (!createdAt) return true;
  
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  
  return (now - created) > sevenDays;
}

/**
 * Initialize guest session if needed (called on app load)
 */
export function initializeGuestSession(): void {
  if (typeof window === 'undefined') return;
  
  if (isGuestSessionExpired()) {
    clearGuestSession();
  }
}