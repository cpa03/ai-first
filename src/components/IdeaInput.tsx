'use client';

import { useState } from 'react';
import { dbService, Idea } from '@/lib/db';

interface IdeaInputProps {
  onSubmit: (idea: string, ideaId: string) => void;
}

export default function IdeaInput({ onSubmit }: IdeaInputProps) {
  const [idea, setIdea] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="idea"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          What's your idea?
        </label>
        <textarea
          id="idea"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Describe your idea in a few sentences. For example: 'I want to build a mobile app that helps people track their daily habits and stay motivated to achieve their goals.'"
          className="textarea min-h-[120px]"
          disabled={isSubmitting}
          autoFocus
        />
        <p className="mt-2 text-sm text-gray-500">
          Be as specific or as general as you'd like. We'll help you clarify the
          details.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!idea.trim() || isSubmitting}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Processing...' : 'Start Clarifying →'}
        </button>
      </div>
    </form>
  );
}
