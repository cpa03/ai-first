/**
 * User Story Format Validation Configuration
 *
 * Validates ideas follow the standard user story format:
 * "As a [persona], I want [goal], So that [benefit]"
 *
 * This configuration was extracted from constants.ts as part of the
 * modularity improvement effort (Issue #1740)
 */
import { EnvLoader } from './environment';

export const USER_STORY_CONFIG = {
  /**
   * Enable user story format validation
   * When true, validates that ideas follow standard user story format
   * Env: USER_STORY_FORMAT_VALIDATION_ENABLED (default: false for backward compatibility)
   */
  FORMAT_VALIDATION_ENABLED: EnvLoader.boolean(
    'USER_STORY_FORMAT_VALIDATION_ENABLED',
    false
  ),

  /**
   * Regex patterns for user story format validation
   * Matches: "As a [persona], I want [goal], So that [benefit]"
   * Case-insensitive matching for flexibility
   */
  PATTERNS: {
    /**
     * Full user story pattern with all three parts
     * Captures: persona, goal, and benefit
     */
    FULL_STORY:
      /^As\s+(?:an?\s+)?(.+?),?\s*I\s+want\s+(.+?),?\s*(?:So\s+that|In\s+order\s+to)\s+(.+)$/i,

    /**
     * Partial pattern - at minimum has "As a" and "I want"
     * Less strict validation for draft stories
     */
    PARTIAL_STORY: /^As\s+(?:an?\s+)?(.+?),?\s*I\s+want\s+/i,

    /**
     * Keywords that indicate user story intent (for suggestions)
     */
    KEYWORDS: ['as a', 'as an', 'i want', 'so that', 'in order to'],
  } as const,

  /**
   * Known personas from docs/user-stories/personas.md
   * Used for validation hints and suggestions
   *
   * Note: Generic personas like 'user' are intentionally excluded as they are
   * considered anti-patterns per user-story-engineer.md (lines 289-291).
   * User stories should use specific personas for clarity.
   */
  KNOWN_PERSONAS: ['startup founder', 'product manager', 'developer'] as const,

  /**
   * Minimum lengths for user story components
   */
  MIN_LENGTHS: {
    PERSONA: 3,
    GOAL: 5,
    BENEFIT: 5,
  } as const,

  /**
   * Error messages for validation failures
   */
  ERROR_MESSAGES: {
    MISSING_FORMAT:
      'Idea should follow user story format: "As a [persona], I want [goal], So that [benefit]"',
    MISSING_PERSONA:
      'User story is missing a valid persona (e.g., "As a startup founder")',
    MISSING_GOAL:
      'User story is missing a clear goal (e.g., "I want to create a landing page")',
    MISSING_BENEFIT:
      'User story is missing a benefit/reason (e.g., "So that I can attract customers")',
    PERSONA_TOO_SHORT:
      'Persona description is too short. Be more specific (e.g., "startup founder" instead of "user")',
    GOAL_TOO_SHORT:
      'Goal is too short. Describe what you want to accomplish in more detail',
    BENEFIT_TOO_SHORT: 'Benefit is too short. Explain why this goal matters',
  } as const,
} as const;

/**
 * Type for user story configuration
 */
export type UserStoryConfig = typeof USER_STORY_CONFIG;
