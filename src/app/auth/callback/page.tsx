'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/db';
import {
  API_ERROR_MESSAGES,
  ROUTES,
  PAGE_LAYOUT_CLASSES,
  CONTAINER_WIDTHS,
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <h1 className="text-xl font-semibold text-gray-900">
          Completing sign in...
        </h1>
        <p className="text-gray-600">
          Please wait while we verify your account.
        </p>
      </div>
    </div>
  );
}
