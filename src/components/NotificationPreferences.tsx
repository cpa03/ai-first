'use client';

import { useState, useCallback, useEffect } from 'react';
import { createLogger } from '@/lib/logger';
import useNotificationPermission from '@/hooks/useNotificationPermission';
import { unsubscribeFromPush } from '@/lib/service-worker';

export interface NotificationPreferencesProps {
  showDetailed?: boolean;
  onSave?: (preferences: NotificationPreferences) => void;
  initialPreferences?: Partial<NotificationPreferences>;
  className?: string;
}

export interface NotificationPreferences {
  browser: boolean;
  email: boolean;
  taskReminders: boolean;
  ideaUpdates: boolean;
  weeklyDigest: boolean;
}

const logger = createLogger('NotificationPreferences');

export default function NotificationPreferences({
  showDetailed = false,
  onSave,
  initialPreferences,
  className = '',
}: NotificationPreferencesProps) {
  const { permission, isSupported, isLoading, requestPermission } =
    useNotificationPermission();

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    browser: permission === 'granted',
    email: true,
    taskReminders: true,
    ideaUpdates: true,
    weeklyDigest: false,
    ...initialPreferences,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setPreferences((prev) => ({
      ...prev,
      browser: permission === 'granted',
    }));
  }, [permission]);

  const handleToggle = useCallback((key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setHasChanges(true);
  }, []);

  const handleBrowserEnable = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      setPreferences((prev) => ({
        ...prev,
        browser: true,
      }));
      setHasChanges(true);
    }
  };

  const handleBrowserDisable = async () => {
    logger.info('User requested to disable browser notifications');
    if (typeof window !== 'undefined') {
      window.open('chrome://settings', '_blank');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!preferences.browser && permission === 'granted') {
        await unsubscribeFromPush();
      }
      onSave?.(preferences);
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
      >
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
      role="region"
      aria-label="Notification preferences"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Notification Settings
        </h3>
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      <div className="mb-6 pb-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Browser Notifications</p>
              <p className="text-sm text-gray-500">
                {permission === 'granted'
                  ? 'Enabled'
                  : permission === 'denied'
                    ? 'Blocked'
                    : 'Not yet enabled'}
              </p>
            </div>
          </div>
          {isSupported ? (
            permission === 'granted' ? (
              <button
                onClick={handleBrowserDisable}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Manage
              </button>
            ) : permission === 'denied' ? (
              <button
                onClick={handleBrowserDisable}
                className="text-sm text-red-600"
              >
                Unblock
              </button>
            ) : (
              <button
                onClick={handleBrowserEnable}
                className="text-sm font-medium text-primary-600"
              >
                Enable
              </button>
            )
          ) : (
            <span className="text-sm text-gray-400">Not supported</span>
          )}
        </div>
      </div>

      {showDetailed && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">
            Notification Types
          </h4>
          <PreferenceToggle
            label="Task Reminders"
            description="Get notified when tasks are updated"
            enabled={preferences.taskReminders}
            onToggle={() => handleToggle('taskReminders')}
          />
          <PreferenceToggle
            label="Idea Updates"
            description="Updates about your ideas"
            enabled={preferences.ideaUpdates}
            onToggle={() => handleToggle('ideaUpdates')}
          />
          <PreferenceToggle
            label="Weekly Digest"
            description="Summary of your weekly progress"
            enabled={preferences.weeklyDigest}
            onToggle={() => handleToggle('weeklyDigest')}
          />
        </div>
      )}
    </div>
  );
}

function PreferenceToggle({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${enabled ? 'bg-primary-600' : 'bg-gray-200'}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
}
