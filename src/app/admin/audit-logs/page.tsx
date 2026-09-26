'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchWithTimeout } from '@/lib/api-client';
import { API_ROUTES } from '@/lib/config';
import { createLogger } from '@/lib/logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Button from '@/components/Button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const logger = createLogger('AdminAuditLogsPage');

interface AuditLog {
  id: string;
  admin_user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  target_user_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  request_id: string | null;
  correlation_id: string | null;
  severity: string;
  created_at: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('page', String(pagination?.page || 1));
      params.set('limit', String(pagination?.limit || 50));
      if (actionFilter) params.set('action', actionFilter);
      if (resourceTypeFilter) params.set('resource_type', resourceTypeFilter);
      if (severityFilter) params.set('severity', severityFilter);
      if (startDate) params.set('start_date', startDate);
      if (endDate) params.set('end_date', endDate);

      const response = await fetchWithTimeout(`${API_ROUTES.ADMIN_AUDIT_LOGS}?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }
      const data = await response.json();
      if (data.success) {
        setLogs(data.data.logs);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.error || 'Failed to fetch audit logs');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Error fetching audit logs:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [pagination?.page, pagination?.limit, actionFilter, resourceTypeFilter, severityFilter, startDate, endDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
      debug: 'secondary',
      info: 'default',
      warning: 'outline',
      error: 'destructive',
      critical: 'destructive',
    };
    return (
      <Badge variant={variants[severity] || 'default'} className="capitalize">
        {severity}
      </Badge>
    );
  };

  const getActionLabel = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error loading audit logs: {error}</p>
        <Button onClick={fetchLogs} variant="outline">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="mt-2 text-gray-600">Track all administrative actions and security events</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="relative flex-1 max-w-md">
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Actions</SelectItem>
                <SelectItem value="user_suspend">User Suspend</SelectItem>
                <SelectItem value="user_unsuspend">User Unsuspend</SelectItem>
                <SelectItem value="user_delete">User Delete</SelectItem>
                <SelectItem value="role_grant">Role Grant</SelectItem>
              </SelectContent>
            </Select>
            <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Resources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Resources</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin_role">Admin Role</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Severity</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchLogs} variant="outline">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs ({pagination?.total || 0} total)</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No audit logs found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full" role="table">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 font-medium text-gray-500">Timestamp</th>
                      <th className="text-left p-4 font-medium text-gray-500">Action</th>
                      <th className="text-left p-4 font-medium text-gray-500">Resource</th>
                      <th className="text-left p-4 font-medium text-gray-500">Admin User</th>
                      <th className="text-left p-4 font-medium text-gray-500">Target User</th>
                      <th className="text-left p-4 font-medium text-gray-500">Severity</th>
                      <th className="text-left p-4 font-medium text-gray-500">IP Address</th>
                      <th className="text-left p-4 font-medium text-gray-500">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="p-4 text-sm text-gray-900 whitespace-nowrap">
                          {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                        </td>
                        <td className="p-4 text-sm text-gray-900">
                          {getActionLabel(log.action)}
                        </td>
                        <td className="p-4 text-sm text-gray-500">
                          {log.resource_type}
                          {log.resource_id && <span className="text-gray-600 ml-1">({log.resource_id.slice(0, 8)}...)</span>}
                        </td>
                        <td className="p-4 text-sm text-gray-500">
                          {log.admin_user_id || 'System'}
                        </td>
                        <td className="p-4 text-sm text-gray-500">
                          {log.target_user_id || '—'}
                        </td>
                        <td className="p-4">{getSeverityBadge(log.severity)}</td>
                        <td className="p-4 text-sm text-gray-500 font-mono">
                          {log.ip_address || '—'}
                        </td>
                        <td className="p-4">
                          <details className="group">
                            <summary className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                              View Details
                            </summary>
                            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40 text-gray-700">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() => setPagination((p) => p ? { ...p, page: p.page - 1 } : null)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() => setPagination((p) => p ? { ...p, page: p.page + 1 } : null)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}