'use client';

import { useState } from 'react';

interface IdeaInputProps {
  onSubmit: (idea: string) => void;
}

export default function IdeaInput({ onSubmit }: IdeaInputProps) {
  const [idea, setIdea] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    onSubmit(idea.trim());
    setIsSubmitting(false);
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
        />
        <p className="mt-2 text-sm text-gray-500">
          Be as specific or as general as you'd like. We'll help you clarify the
          details.
        </p>
      </div>

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
