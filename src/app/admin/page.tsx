'use client';

import { useEffect, useState } from 'react';
import { fetchWithTimeout } from '@/lib/api-client';
import { API_ROUTES } from '@/lib/config';
import { createLogger } from '@/lib/logger';
import Button from '@/components/Button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const logger = createLogger('AdminDashboard');

interface SystemHealthData {
  overview: {
    totalUsers: number;
    totalIdeas: number;
    totalTasks: number;
    activeAdmins: number;
    totalAuditLogs: number;
    databaseSizeBytes: number;
  };
  activity24h: {
    newUsers: number;
    newIdeas: number;
    adminActions: number;
  };
  roleDistribution: Record<string, number>;
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  nodeVersion: string;
}

export default function AdminDashboardPage() {
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchWithTimeout(API_ROUTES.ADMIN_SYSTEM_HEALTH);
      if (!response.ok) {
        throw new Error('Failed to fetch system health');
      }
      const data = await response.json();
      if (data.success) {
        setHealth(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch system health');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Error fetching system health:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <p className="text-red-600 mb-4">Error loading dashboard: {error}</p>
        <Button onClick={fetchHealth} variant="outline">Retry</Button>
      </div>
    );
  }

  if (!health) {
    return null;
  }

  const stats = [
    {
      title: 'Total Users',
      value: health.overview.totalUsers.toLocaleString(),
      change: `+${health.activity24h.newUsers} last 24h`,
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'blue',
    },
    {
      title: 'Total Ideas',
      value: health.overview.totalIdeas.toLocaleString(),
      change: `+${health.activity24h.newIdeas} last 24h`,
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: 'green',
    },
    {
      title: 'Total Tasks',
      value: health.overview.totalTasks.toLocaleString(),
      change: 'Active',
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      color: 'purple',
    },
    {
      title: 'Active Admins',
      value: health.overview.activeAdmins.toLocaleString(),
      change: `${health.activity24h.adminActions} actions (24h)`,
      icon: (
        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: 'indigo',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">System overview and administrative controls</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="mt-1 text-sm text-gray-500">{stat.change}</p>
                </div>
                <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & System Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/admin/users">
                <Button className="w-full justify-start gap-3" variant="outline">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Manage Users
                </Button>
              </Link>
              <Link href="/admin/audit-logs">
                <Button className="w-full justify-start gap-3" variant="outline">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Audit Logs
                </Button>
              </Link>
              <Link href="/admin/system-health">
                <Button className="w-full justify-start gap-3" variant="outline">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  System Health Details
                </Button>
              </Link>
              <Button
                onClick={fetchHealth}
                className="w-full justify-start gap-3"
                variant="outline"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Admin Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(health.roleDistribution).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(health.roleDistribution).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          role === 'super_admin'
                            ? 'bg-red-100 text-red-800'
                            : role === 'admin'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {role.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No active admin roles</p>
            )}
          </CardContent>
        </Card>

        {/* System Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Uptime</dt>
                <dd className="font-medium text-gray-900">{formatUptime(health.uptime)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Memory (RSS)</dt>
                <dd className="font-medium text-gray-900">{formatBytes(health.memoryUsage.rss)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Memory (Heap)</dt>
                <dd className="font-medium text-gray-900">
                  {formatBytes(health.memoryUsage.heapUsed)} / {formatBytes(health.memoryUsage.heapTotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Database Size</dt>
                <dd className="font-medium text-gray-900">{formatBytes(health.overview.databaseSizeBytes)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Node Version</dt>
                <dd className="font-medium text-gray-900">{health.nodeVersion}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Total Audit Logs</dt>
                <dd className="font-medium text-gray-900">{health.overview.totalAuditLogs.toLocaleString()}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}