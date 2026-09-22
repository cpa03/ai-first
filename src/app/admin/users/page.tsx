'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchWithTimeout } from '@/lib/api-client';
import { API_ROUTES } from '@/lib/config';
import { createLogger } from '@/lib/logger';
import Button from '@/components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const logger = createLogger('AdminUsersPage');

interface User {
  id: string;
  email: string;
  user_created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  banned_until: string | null;
  active_roles: string[];
  super_admin_expires: string | null;
  admin_expires: string | null;
  moderator_expires: string | null;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    user: User | null;
    action: 'suspend' | 'unsuspend' | 'delete' | 'change_role' | null;
    role?: string;
  }>({ isOpen: false, user: null, action: null });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('page', String(pagination?.page || 1));
      params.set('limit', String(pagination?.limit || 20));
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      if (statusFilter) params.set('status', statusFilter);

      const response = await fetchWithTimeout(`${API_ROUTES.ADMIN_USERS}?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.error || 'Failed to fetch users');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Error fetching users:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [pagination?.page, pagination?.limit, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAction = async (user: User, action: 'suspend' | 'unsuspend' | 'delete' | 'change_role', role?: string) => {
    setActionDialog({ isOpen: true, user, action, role });
  };

  const confirmAction = async () => {
    if (!actionDialog.user || !actionDialog.action) return;

    try {
      const response = await fetchWithTimeout(API_ROUTES.ADMIN_USERS_ACTION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: actionDialog.user.id,
          action: actionDialog.action,
          role: actionDialog.role,
        }),
      });

      if (!response.ok) {
        throw new Error('Action failed');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Action failed');
      }

      setActionDialog({ isOpen: false, user: null, action: null });
      fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Action failed';
      logger.error('Error performing action:', err);
      alert(message);
    }
  };

  const getStatusBadge = (user: User) => {
    if (user.banned_until && new Date(user.banned_until) > new Date()) {
      return <Badge variant="destructive">Suspended</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const getRoleBadges = (user: User) => {
    return user.active_roles.map((role) => {
      const expires = role === 'super_admin' ? user.super_admin_expires :
                      role === 'admin' ? user.admin_expires :
                      user.moderator_expires;
      return (
        <Badge
          key={role}
          variant={
            role === 'super_admin' ? 'destructive' :
            role === 'admin' ? 'default' :
            'secondary'
          }
          className="mr-1 mb-1"
        >
          {role.replace('_', ' ').toUpperCase()}
          {expires && (
            <span className="ml-1 opacity-75">
              (expires {format(new Date(expires), 'MMM d, yyyy')})
            </span>
          )}
        </Badge>
      );
    });
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
        <p className="text-red-600 mb-4">Error loading users: {error}</p>
        <Button onClick={fetchUsers} variant="outline">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="mt-2 text-gray-600">Manage user accounts, roles, and access</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Input
                placeholder="Search by email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                className="pl-10"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchUsers} variant="outline">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({pagination?.total || 0} total)</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full" role="table">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 font-medium text-gray-500">User</th>
                      <th className="text-left p-4 font-medium text-gray-500">Roles</th>
                      <th className="text-left p-4 font-medium text-gray-500">Status</th>
                      <th className="text-left p-4 font-medium text-gray-500">Created</th>
                      <th className="text-left p-4 font-medium text-gray-500">Last Sign In</th>
                      <th className="text-right p-4 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-gray-900">{user.email}</p>
                            <p className="text-sm text-gray-500">{user.id}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap">{getRoleBadges(user)}</div>
                        </td>
                        <td className="p-4">{getStatusBadge(user)}</td>
                        <td className="p-4 text-gray-500">
                          {format(new Date(user.user_created_at), 'MMM d, yyyy')}
                        </td>
                        <td className="p-4 text-gray-500">
                          {user.last_sign_in_at
                            ? format(new Date(user.last_sign_in_at), 'MMM d, yyyy HH:mm')
                            : 'Never'}
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0" aria-label="User actions">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              {user.active_roles.length === 0 && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleAction(user, 'change_role', 'moderator')}
                                    className="text-green-600"
                                  >
                                    Grant Moderator
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleAction(user, 'change_role', 'admin')}
                                    className="text-blue-600"
                                  >
                                    Grant Admin
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              {user.active_roles.includes('moderator') && !user.active_roles.includes('admin') && (
                                <DropdownMenuItem
                                  onClick={() => handleAction(user, 'change_role', 'admin')}
                                  className="text-blue-600"
                                >
                                  Promote to Admin
                                </DropdownMenuItem>
                              )}
                              {user.active_roles.includes('admin') && !user.active_roles.includes('super_admin') && (
                                <DropdownMenuItem
                                  onClick={() => handleAction(user, 'change_role', 'super_admin')}
                                  className="text-red-600"
                                >
                                  Promote to Super Admin
                                </DropdownMenuItem>
                              )}
                              {user.active_roles.length > 0 && (
                                <>
                                  <DropdownMenuSeparator />
                                  {user.active_roles.map((role) => (
                                    <DropdownMenuItem
                                      key={role}
                                      onClick={() => handleAction(user, 'change_role', role)}
                                      className="text-orange-600"
                                    >
                                      Revoke {role.replace('_', ' ')}
                                    </DropdownMenuItem>
                                  ))}
                                </>
                              )}
                              <DropdownMenuSeparator />
                              {!user.banned_until || new Date(user.banned_until) <= new Date() ? (
                                <DropdownMenuItem
                                  onClick={() => handleAction(user, 'suspend')}
                                  className="text-red-600"
                                >
                                  Suspend User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleAction(user, 'unsuspend')}
                                  className="text-green-600"
                                >
                                  Unsuspend User
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleAction(user, 'delete')}
                                className="text-red-600 font-medium"
                              >
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialog.isOpen} onOpenChange={(open) => !open && setActionDialog({ isOpen: false, user: null, action: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === 'suspend' ? 'Suspend User' :
               actionDialog.action === 'unsuspend' ? 'Unsuspend User' :
               actionDialog.action === 'delete' ? 'Delete User' :
               `Grant ${actionDialog.role}`}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.action === 'suspend' && `Are you sure you want to suspend ${actionDialog.user?.email}? This will prevent them from accessing the application.`}
              {actionDialog.action === 'unsuspend' && `Are you sure you want to unsuspend ${actionDialog.user?.email}?`}
              {actionDialog.action === 'delete' && `Are you sure you want to permanently delete ${actionDialog.user?.email}? This action cannot be undone.`}
              {actionDialog.action === 'change_role' && `Grant ${actionDialog.role?.replace('_', ' ')} role to ${actionDialog.user?.email}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ isOpen: false, user: null, action: null })}>
              Cancel
            </Button>
            <Button
              variant={actionDialog.action === 'delete' ? 'danger' : 'primary'}
              onClick={confirmAction}
              disabled={loading}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}