'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/db';
import {
  API_ERROR_MESSAGES,
  ROUTES,
  PAGE_LAYOUT_CLASSES,
  CONTAINER_WIDTHS,
  GRAY_CLASSES,
  SPINNER_PATTERNS,
  COMPONENT_DEFAULTS,
} from '@/lib/config';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (!supabaseClient) {
          throw new Error(API_ERROR_MESSAGES.PAGE.AUTH_SERVICE_UNAVAILABLE);
        }

        const { error } = await supabaseClient.auth.exchangeCodeForSession(
          window.location.href
        );

        if (error) {
          throw error;
        }

        router.push(ROUTES.DASHBOARD);
        router.refresh();
      } catch {
        router.push(`${ROUTES.LOGIN}?error=auth_callback_failed`);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className={PAGE_LAYOUT_CLASSES.AUTH_CONTAINER}>
      <div className={`${CONTAINER_WIDTHS.XS} w-full text-center space-y-4`}>
        <div
          className={`animate-spin rounded-full ${SPINNER_PATTERNS.default.size.lg} ${SPINNER_PATTERNS.default.border} border-primary-600 mx-auto`}
        ></div>
        <h1 className={`text-xl font-semibold ${GRAY_CLASSES.TEXT_900}`}>
          {COMPONENT_DEFAULTS.LOADING_TEXT.AUTH_CALLBACK_TITLE}
        </h1>
        <p className={GRAY_CLASSES.TEXT_600}>
          {COMPONENT_DEFAULTS.LOADING_TEXT.AUTH_CALLBACK_MESSAGE}
        </p>
      </div>
    </div>
  );
}
