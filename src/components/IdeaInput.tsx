'use client';

import { useState, useCallback } from 'react';
import { dbService, Idea } from '@/lib/db';

interface IdeaInputProps {
  onSubmit: (idea: string, ideaId: string) => void;
}

export default function IdeaInput({ onSubmit }: IdeaInputProps) {
  const [idea, setIdea] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!idea.trim()) return;

      setIsSubmitting(true);
      setError(null);

      try {
        // Create a new idea in the database
        const newIdea: Omit<Idea, 'id' | 'created_at'> = {
          user_id: 'default_user', // In a real app, this would come from auth
          title: idea.substring(0, 50) + (idea.length > 50 ? '...' : ''), // Truncate title
          raw_text: idea,
          status: 'draft',
        };

        const savedIdea = await dbService.createIdea(newIdea);

        onSubmit(idea.trim(), savedIdea.id);
      } catch (err) {
        console.error('Error saving idea:', err);
        setError('Failed to save your idea. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [idea, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <label
          htmlFor="idea-input"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          What's your idea?
        </label>
        <textarea
          id="idea-input"
          name="idea"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Describe your idea in a few sentences. For example: 'I want to build a mobile app that helps people track their daily habits and stay motivated to achieve their goals.'"
          className="textarea min-h-[120px]"
          disabled={isSubmitting}
          aria-describedby="idea-help"
          aria-required="true"
        />
        <p id="idea-help" className="mt-2 text-sm text-gray-500">
          Be as specific or as general as you'd like. We'll help you clarify the
          details.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
        >
          <svg
            className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!idea.trim() || isSubmitting}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Start Clarifying →'}
        </button>
      </div>
    </form>
  );
}
