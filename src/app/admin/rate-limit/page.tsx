'use client';

import { useEffect, useState } from 'react';
import { fetchWithTimeout } from '@/lib/api-client';
import { API_ROUTES } from '@/lib/config';
import { createLogger } from '@/lib/logger';
import Button from '@/components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const logger = createLogger('AdminRateLimitPage');

interface RateLimitStats {
  totalKeys: number;
  totalRequests: number;
  blockedRequests: number;
  activeKeys: number;
  configs: Record<string, { windowMs: number; maxRequests: number }>;
  tieredLimits: Record<string, { windowMs: number; maxRequests: number }>;
}

export default function AdminRateLimitPage() {
  const [stats, setStats] = useState<RateLimitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchWithTimeout(`${API_ROUTES.ADMIN_RATE_LIMIT}`);
      if (!response.ok) {
        throw new Error('Failed to fetch rate limit stats');
      }
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch rate limit stats');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Error fetching rate limit stats:', err);
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const clearRateLimitStore = async () => {
    try {
      setRefreshing(true);
      const response = await fetchWithTimeout(`${API_ROUTES.ADMIN_RATE_LIMIT}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to clear rate limit store');
      }
      await fetchStats();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Error clearing rate limit store:', err);
      alert(message);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatWindowMs = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="h-8 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error loading rate limit stats: {error}</p>
        <Button onClick={fetchStats} variant="outline">Retry</Button>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rate Limit Management</h1>
          <p className="mt-2 text-gray-600">Monitor and manage API rate limiting configuration</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={fetchStats}
            variant="outline"
            disabled={refreshing}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
          <Button
            onClick={clearRateLimitStore}
            variant="danger"
            disabled={refreshing}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Store
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Keys</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalKeys.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Requests</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalRequests.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Blocked Requests</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.blockedRequests.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Keys</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.activeKeys.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rate Limit Configurations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Standard Rate Limit Configs */}
        <Card>
          <CardHeader>
            <CardTitle>Standard Rate Limit Configurations</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(stats.configs).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(stats.configs).map(([key, config]) => (
                  <div key={key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h4 className="font-medium text-gray-900 capitalize">{key.replace(/_/g, ' ')}</h4>
                        <p className="text-sm text-gray-500">
                          Window: {formatWindowMs(config.windowMs)} | Max Requests: {config.maxRequests}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{formatWindowMs(config.windowMs)}</Badge>
                        <Badge variant="default">{config.maxRequests} req</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No rate limit configurations found</p>
            )}
          </CardContent>
        </Card>

        {/* Tiered Rate Limit Configs */}
        <Card>
          <CardHeader>
            <CardTitle>Tiered Rate Limit Configurations</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(stats.tieredLimits).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(stats.tieredLimits).map(([key, config]) => (
                  <div key={key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h4 className="font-medium text-gray-900 capitalize">{key.replace(/_/g, ' ')}</h4>
                        <p className="text-sm text-gray-500">
                          Window: {formatWindowMs(config.windowMs)} | Max Requests: {config.maxRequests}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{formatWindowMs(config.windowMs)}</Badge>
                        <Badge variant="outline">{config.maxRequests} req</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No tiered rate limit configurations found</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={clearRateLimitStore}
              variant="danger"
              disabled={refreshing}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Rate Limit Store
            </Button>
            <Button onClick={fetchStats} variant="outline" disabled={refreshing}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Stats
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}