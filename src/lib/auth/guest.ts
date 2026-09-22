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
 * Generate a unique guest session ID
 */
export function generateGuestSessionId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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