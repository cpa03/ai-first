'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  hasGuestSession,
  getGuestIdeaId,
  getGuestIdeaData,
  saveGuestIdeaData,
  saveGuestAnswers,
  getGuestAnswers,
  clearGuestSession,
  initializeGuestSession,
  GUEST_STORAGE_KEYS,
} from '@/lib/auth/guest';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useGuestMode');

interface GuestModeState {
  isGuest: boolean;
  ideaId: string | null;
  idea: string | null;
  createdAt: string | null;
  answers: Record<string, string> | null;
  loading: boolean;
}

interface GuestModeActions {
  setGuestIdea: (idea: string, ideaId: string) => void;
  setGuestAnswers: (answers: Record<string, string>) => void;
  clearGuest: () => void;
  refreshGuestState: () => void;
}

/**
 * Hook for managing guest mode state
 * Allows anonymous users to use the clarify flow without authentication
 */
export function useGuestMode(): GuestModeState & GuestModeActions {
  const [state, setState] = useState<GuestModeState>({
    isGuest: false,
    ideaId: null,
    idea: null,
    createdAt: null,
    answers: null,
    loading: true,
  });

  // Initialize guest session on mount
  useEffect(() => {
    initializeGuestSession();
    refreshGuestState();
  }, []);

  const refreshGuestState = useCallback(() => {
    const isGuest = hasGuestSession();
    const ideaId = getGuestIdeaId();
    const ideaData = getGuestIdeaData();
    const answers = getGuestAnswers();

    setState({
      isGuest,
      ideaId,
      idea: ideaData?.idea || null,
      createdAt: ideaData?.createdAt || null,
      answers,
      loading: false,
    });
  }, []);

  const setGuestIdea = useCallback((idea: string, ideaId: string) => {
    saveGuestIdeaData(idea, ideaId);
    refreshGuestState();
  }, [refreshGuestState]);

  const setGuestAnswers = useCallback((answers: Record<string, string>) => {
    saveGuestAnswers(answers);
    setState(prev => ({ ...prev, answers }));
  }, []);

  const clearGuest = useCallback(() => {
    clearGuestSession();
    setState({
      isGuest: false,
      ideaId: null,
      idea: null,
      createdAt: null,
      answers: null,
      loading: false,
    });
  }, []);

  return {
    ...state,
    setGuestIdea,
    setGuestAnswers,
    clearGuest,
    refreshGuestState,
  };
}

/**
 * Hook for checking if user is in guest mode (lighter weight)
 */
export function useIsGuest(): boolean {
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    initializeGuestSession();
    setIsGuest(hasGuestSession());
  }, []);

  return isGuest;
}