'use client';

import { useState, useEffect, useCallback } from 'react';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useNotificationPermission');

export type NotificationPermissionStatus =
  | 'default'
  | 'granted'
  | 'denied'
  | 'unsupported';

export interface NotificationPermissionState {
  permission: NotificationPermissionStatus;
  isSupported: boolean;
  isLoading: boolean;
  requestPermission: () => Promise<NotificationPermissionStatus>;
  checkPermission: () => Promise<NotificationPermissionStatus>;
}

/**
 * Hook to manage browser notification permissions
 *
 * Growth: Enables push notification opt-in for user engagement
 * Provides foundation for re-engagement campaigns and retention
 *
 * @example
 * const { permission, requestPermission } = useNotificationPermission();
 *
 * if (permission === 'default') {
 *   <button onClick={requestPermission}>Enable notifications</button>
 * }
 */
export function useNotificationPermission(): NotificationPermissionState {
  const [permission, setPermission] =
    useState<NotificationPermissionStatus>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if notifications are supported and get current permission
  const checkPermission =
    useCallback(async (): Promise<NotificationPermissionStatus> => {
      if (typeof window === 'undefined') {
        return 'unsupported';
      }

      if (!('Notification' in window)) {
        setIsSupported(false);
        return 'unsupported';
      }

      setIsSupported(true);

      if (Notification.permission === 'granted') {
        return 'granted';
      }

      if (Notification.permission === 'denied') {
        return 'denied';
      }

      return 'default';
    }, []);

  // Request notification permission from the user
  const requestPermission =
    useCallback(async (): Promise<NotificationPermissionStatus> => {
      if (typeof window === 'undefined') {
        logger.warn('Request permission called on server');
        return 'unsupported';
      }

      if (!('Notification' in window)) {
        logger.debug('Notifications not supported');
        return 'unsupported';
      }

      try {
        // Growth: Track notification permission request
        const currentPermission = Notification.permission;
        logger.info('Requesting notification permission', {
          currentPermission,
        });
        const newPermission = await Notification.requestPermission();

        // Growth: Track permission result
        logger.info('Notification permission result', {
          previous: currentPermission,
          current: newPermission,
        });

        const typedPermission = newPermission as NotificationPermissionStatus;
        setPermission(typedPermission);
        return typedPermission;
      } catch (error) {
        logger.error('Failed to request notification permission', error);
        return 'denied';
      }
    }, []);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const currentPermission = await checkPermission();
      setPermission(currentPermission);
      setIsLoading(false);
    };

    init();
  }, [checkPermission]);

  return {
    permission,
    isSupported,
    isLoading,
    requestPermission,
    checkPermission,
  };
}

export default useNotificationPermission;
