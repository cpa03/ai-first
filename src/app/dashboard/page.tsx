'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Idea {
  id: string;
  title: string;
  status: 'draft' | 'clarified' | 'breakdown' | 'completed';
  createdAt: string;
  updatedAt?: string;
}

interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  clarified: 'bg-blue-100 text-blue-800',
  breakdown: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  clarified: 'Clarified',
  breakdown: 'In Progress',
  completed: 'Completed',
};

export default function DashboardPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchIdeas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const url = new URL('/api/ideas', window.location.origin);
      if (filter !== 'all') {
        url.searchParams.set('status', filter);
      }
      url.searchParams.set('limit', '50');

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error('Failed to fetch ideas');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch ideas');
      }

      setIdeas(data.data.ideas);
      setPagination(data.data.pagination);
    } catch (err) {
      console.error('Error fetching ideas:', err);
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this idea?')) {
      return;
    }

    try {
      setDeletingId(id);

      const response = await fetch(`/api/ideas/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete idea');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete idea');
      }

      setIdeas(ideas.filter((idea) => idea.id !== id));
    } catch (err) {
      console.error('Error deleting idea:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete idea');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <LoadingSpinner
            size="md"
            className="mb-4"
            ariaLabel="Loading your ideas"
          />
          <p className="text-gray-600">Loading your ideas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-4">Error</h2>
          <p className="text-red-800">{error}</p>
          <Button onClick={fetchIdeas} variant="primary" className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Ideas</h1>
          <p className="text-gray-600 mt-1">
            {pagination?.total || 0} idea{pagination?.total !== 1 ? 's' : ''}{' '}
            total
          </p>
        </div>
        <Link href="/">
          <Button variant="primary">+ New Idea</Button>
        </Link>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <label htmlFor="status-filter" className="sr-only">
          Filter by status
        </label>
        <select
          id="status-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="block w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          aria-label="Filter ideas by status"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="clarified">Clarified</option>
          <option value="breakdown">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Ideas List */}
      {ideas.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">💡</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No ideas yet
          </h2>
          <p className="text-gray-600 mb-6">
            Start by creating your first idea to get AI-powered project
            planning.
          </p>
          <Link href="/">
            <Button variant="primary">Create Your First Idea</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table
              className="min-w-full divide-y divide-gray-200"
              role="table"
              aria-label="List of your ideas"
            >
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Created
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ideas.map((idea) => (
                  <tr key={idea.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {idea.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[idea.status]}`}
                      >
                        {statusLabels[idea.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(idea.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/clarify?ideaId=${idea.id}`}
                          className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                          aria-label={`Continue working on ${idea.title}`}
                        >
                          Continue
                        </Link>
                        <Link
                          href={`/results?ideaId=${idea.id}`}
                          className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50 transition-colors"
                          aria-label={`View blueprint for ${idea.title}`}
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(idea.id)}
                          disabled={deletingId === idea.id}
                          className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                          aria-label={`Delete ${idea.title}`}
                        >
                          {deletingId === idea.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
