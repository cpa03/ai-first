'use client';

import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/db';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
}

export function useAuthCheck(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    userId: null,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!supabaseClient) {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            userId: null,
          });
          return;
        }

        const {
          data: { session },
          error,
        } = await supabaseClient.auth.getSession();

        if (error || !session) {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            userId: null,
          });
          return;
        }

        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          userId: session.user.id,
        });
      } catch {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          userId: null,
        });
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabaseClient?.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          userId: session.user.id,
        });
      } else if (event === 'SIGNED_OUT') {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          userId: null,
        });
      }
    }) || { data: { subscription: null } };

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return authState;
}

export function isAuthenticatedQuickCheck(): boolean {
  if (typeof window === 'undefined') return false;

  const supabaseAuthKey = Object.keys(localStorage).find(
    (key) => key.startsWith('sb-') && key.endsWith('-auth-token')
  );

  if (!supabaseAuthKey) return false;

  try {
    const authData = JSON.parse(localStorage.getItem(supabaseAuthKey) || '{}');
    return !!authData.access_token && !!authData.user;
  } catch {
    return false;
  }
}
