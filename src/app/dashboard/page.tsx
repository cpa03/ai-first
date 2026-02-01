'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Idea {
  id: string;
  title: string;
  status: 'draft' | 'clarified' | 'breakdown' | 'completed';
  createdAt: string;
  updatedAt?: string;
}

const statusColors: Record<Idea['status'], string> = {
  draft: 'bg-gray-100 text-gray-800',
  clarified: 'bg-blue-100 text-blue-800',
  breakdown: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
};

const statusLabels: Record<Idea['status'], string> = {
  draft: 'Draft',
  clarified: 'Clarified',
  breakdown: 'Breakdown',
  completed: 'Completed',
};

export default function DashboardPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchIdeas();
  }, []);

  useEffect(() => {
    let result = ideas;

    if (statusFilter !== 'all') {
      result = result.filter((idea) => idea.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (idea) =>
          idea.title.toLowerCase().includes(query) ||
          idea.id.toLowerCase().includes(query)
      );
    }

    setFilteredIdeas(result);
  }, [ideas, statusFilter, searchQuery]);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/ideas');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch ideas');
      }

      setIdeas(data.data || []);
      setFilteredIdeas(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ideas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this idea?')) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`/api/ideas/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete idea');
      }

      setIdeas((prev) => prev.filter((idea) => idea.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete idea');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: Idea['status']) => {
    try {
      const response = await fetch(`/api/ideas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update idea');
      }

      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === id ? { ...idea, status: newStatus } : idea
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update idea');
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
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
          Your Ideas
        </h1>
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          + New Idea
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Search ideas
          </label>
          <input
            type="text"
            id="search"
            placeholder="Search ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
          />
        </div>
        <div>
          <label htmlFor="status-filter" className="sr-only">
            Filter by status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="clarified">Clarified</option>
            <option value="breakdown">Breakdown</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchIdeas}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {filteredIdeas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg mb-4">
            {ideas.length === 0
              ? "You haven't created any ideas yet."
              : 'No ideas match your filters.'}
          </p>
          {ideas.length === 0 && (
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Create your first idea →
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {filteredIdeas.map((idea) => (
              <li
                key={idea.id}
                className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {idea.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Created {formatDate(idea.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[idea.status]}`}
                    >
                      {statusLabels[idea.status]}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        router.push(
                          `/clarify?ideaId=${idea.id}&idea=${encodeURIComponent(
                            idea.title
                          )}`
                        )
                      }
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Continue →
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor={`status-${idea.id}`} className="sr-only">
                      Change status
                    </label>
                    <select
                      id={`status-${idea.id}`}
                      value={idea.status}
                      onChange={(e) =>
                        handleStatusChange(
                          idea.id,
                          e.target.value as Idea['status']
                        )
                      }
                      className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1 border"
                    >
                      <option value="draft">Draft</option>
                      <option value="clarified">Clarified</option>
                      <option value="breakdown">Breakdown</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button
                      onClick={() => handleDelete(idea.id)}
                      disabled={deletingId === idea.id}
                      className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1"
                      aria-label={`Delete idea: ${idea.title}`}
                    >
                      {deletingId === idea.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-500">
        Showing {filteredIdeas.length} of {ideas.length} ideas
      </div>
    </div>
  );
}
