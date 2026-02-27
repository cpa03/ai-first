import { createLogger } from '@/lib/logger';

const logger = createLogger('service-worker');

export interface ServiceWorkerRegistrationOptions {
  /** Path to the service worker file */
  swUrl?: string;
  /** Callback when service worker is registered */
  onRegistered?: (registration: ServiceWorkerRegistration) => void;
  /** Callback on registration error */
  onError?: (error: Error) => void;
}

export interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isReady: boolean;
  registration: ServiceWorkerRegistration | null;
  error: Error | null;
}

/**
 * Check if service workers are supported in the current browser
 */
export function isServiceWorkerSupported(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Register a service worker for push notifications
 *
 * Growth: Service worker enables:
 * - Push notifications (re-engagement)
 * - Background sync (reliability)
 * - Offline support (retention)
 *
 * @example
 * const { isReady } = await registerServiceWorker({
 *   onRegistered: (reg) => console.log('SW registered', reg),
 * });
 */
export async function registerServiceWorker(
  options: ServiceWorkerRegistrationOptions = {}
): Promise<ServiceWorkerState> {
  const { swUrl = '/sw.js', onRegistered, onError } = options;

  const result: ServiceWorkerState = {
    isSupported: false,
    isRegistered: false,
    isReady: false,
    registration: null,
    error: null,
  };

  // Check support
  if (!isServiceWorkerSupported()) {
    logger.warn('Service workers not supported in this browser');
    result.error = new Error('Service workers not supported');
    onError?.(result.error);
    return result;
  }

  result.isSupported = true;

  try {
    // Register the service worker
    const registration = await navigator.serviceWorker.register(swUrl, {
      scope: '/',
    });

    logger.info('Service worker registered', {
      scope: registration.scope,
      active: !!registration.active,
      waiting: !!registration.waiting,
    });

    result.registration = registration;
    result.isRegistered = true;

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;
    result.isReady = true;

    logger.debug('Service worker is ready');

    // Notify callback
    onRegistered?.(registration);

    // Set up update found handler
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            logger.info('New service worker available');
          }
        });
      }
    });

    return result;
  } catch (error) {
    logger.error('Failed to register service worker', error);
    result.error = error instanceof Error ? error : new Error(String(error));
    onError?.(result.error);
    return result;
  }
}

/**
 * Subscribe to push notifications
 *
 * Requires a push service and VAPID public key
 * This is a placeholder - full implementation requires backend
 *
 * @param vapidPublicKey - The VAPID public key from the server
 */
export async function subscribeToPush(
  vapidPublicKey: string
): Promise<PushSubscription | null> {
  if (!isServiceWorkerSupported()) {
    logger.warn('Cannot subscribe - service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as any,
    });

    logger.info('Push subscription successful', {
      endpoint: subscription.endpoint,
    });

    return subscription;
  } catch (error) {
    logger.error('Failed to subscribe to push', error);
    return null;
  }
}

/**
 * Get current push subscription
 */
export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  if (!isServiceWorkerSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    logger.error('Failed to get push subscription', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isServiceWorkerSupported()) {
    return false;
  }

  try {
    const subscription = await getCurrentPushSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      logger.info('Unsubscribed from push notifications');
    }
    return true;
  } catch (error) {
    logger.error('Failed to unsubscribe from push', error);
    return false;
  }
}

/**
 * Convert VAPID base64 key to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

const serviceWorkerExports = {
  isServiceWorkerSupported,
  registerServiceWorker,
  subscribeToPush,
  getCurrentPushSubscription,
  unsubscribeFromPush,
};

export default serviceWorkerExports;
