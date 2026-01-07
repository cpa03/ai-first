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
  const [touched, setTouched] = useState(false);

  const MIN_LENGTH = 10;
  const MAX_LENGTH = 1000;

  const validationError = !idea.trim()
    ? 'Please enter your idea.'
    : idea.trim().length < MIN_LENGTH
      ? `Your idea must be at least ${MIN_LENGTH} characters.`
      : idea.length > MAX_LENGTH
        ? `Your idea cannot exceed ${MAX_LENGTH} characters.`
        : null;

  const isValid = !validationError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const newIdea: Omit<Idea, 'id' | 'created_at'> = {
        user_id: 'default_user',
        title: idea.substring(0, 50) + (idea.length > 50 ? '...' : ''),
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

  const handleBlur = () => {
    setTouched(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <label
          htmlFor="idea"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          What's your idea?
        </label>
        <textarea
          id="idea"
          name="idea"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          onBlur={handleBlur}
          placeholder="Describe your idea in a few sentences. For example: 'I want to build a mobile app that helps people track their daily habits and stay motivated to achieve their goals.'"
          className={`textarea min-h-[120px] ${touched && validationError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
          disabled={isSubmitting}
          aria-describedby="idea-hint idea-error idea-char-count"
          aria-invalid={touched && validationError ? 'true' : 'false'}
          aria-required="true"
          maxLength={MAX_LENGTH}
        />
        <div className="mt-2 flex justify-between items-center">
          <p id="idea-hint" className="text-sm text-gray-500">
            Be as specific or as general as you'd like. We'll help you clarify
            the details.
          </p>
          <span
            id="idea-char-count"
            className={`text-xs sm:text-sm ${idea.length > MAX_LENGTH * 0.9 ? 'text-orange-600 font-medium' : 'text-gray-500'}`}
            aria-live="polite"
          >
            {idea.length} / {MAX_LENGTH}
          </span>
        </div>
      </div>

      {touched && validationError && (
        <div
          id="idea-error"
          role="alert"
          aria-live="assertive"
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <p className="text-red-800 text-sm">
            <span className="font-semibold" aria-hidden="true">
              ⚠
            </span>{' '}
            {validationError}
          </p>
        </div>
      )}

      {error && (
        <div
          id="submit-error"
          role="alert"
          aria-live="assertive"
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <p className="text-red-800 text-sm">
            <span className="font-semibold">Error:</span> {error}
          </p>
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
