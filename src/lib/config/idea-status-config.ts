/**
 * Idea Status Configuration
 *
 * Centralized configuration for idea status colors, labels, and styling.
 * Used across dashboard, results, and other components for consistency.
 *
 * This module was extracted from constants.ts as part of the domain-specific
 * configuration modularization effort (Product-Architect).
 */

export const IDEA_STATUS_CONFIG = {
  /**
   * Status types for ideas in the workflow
   */
  TYPES: {
    DRAFT: 'draft',
    CLARIFIED: 'clarified',
    BREAKDOWN: 'breakdown',
    COMPLETED: 'completed',
  } as const,

  /**
   * Tailwind CSS classes for each status badge
   * Consistent styling across all status badges
   */
  COLORS: {
    draft: 'bg-gray-100 text-gray-800',
    clarified: 'bg-blue-100 text-blue-800',
    breakdown: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
  } as const,

  /**
   * Human-readable labels for each status
   */
  LABELS: {
    draft: 'Draft',
    clarified: 'Clarified',
    breakdown: 'In Progress',
    completed: 'Completed',
  } as const,

  /**
   * Border colors for status badges
   */
  BORDER_COLORS: {
    draft: 'border-gray-200',
    clarified: 'border-blue-200',
    breakdown: 'border-yellow-200',
    completed: 'border-green-200',
  } as const,

  /**
   * All valid status values
   */
  ALL_STATUSES: ['draft', 'clarified', 'breakdown', 'completed'] as const,

  /**
   * Default status for new ideas
   */
  DEFAULT_STATUS: 'draft' as const,
} as const;

/**
 * Type for idea status
 */
export type IdeaStatus =
  (typeof IDEA_STATUS_CONFIG.TYPES)[keyof typeof IDEA_STATUS_CONFIG.TYPES];
