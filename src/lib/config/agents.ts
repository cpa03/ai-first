/**
 * Agent Configuration
 * Centralizes agent prompts, fallback questions, and clarifier settings
 */

export const CLARIFIER_CONFIG = {
  FALLBACK_QUESTIONS: [
    {
      id: 'target_audience',
      question: 'Who is the target audience for this project?',
      type: 'open' as const,
      category: 'scope',
    },
    {
      id: 'core_features',
      question: 'What are the 3 most important features?',
      type: 'open' as const,
      category: 'features',
    },
    {
      id: 'timeline',
      question: 'What is your desired timeline?',
      type: 'multiple_choice' as const,
      options: ['1-2 weeks', '1 month', '3 months', '6 months', '1 year'],
      category: 'planning',
    },
    {
      id: 'budget_constraint',
      question: 'Do you have any budget constraints?',
      type: 'yes_no' as const,
      category: 'constraints',
    },
    {
      id: 'tech_preferences',
      question: 'Any technology preferences or constraints?',
      type: 'open' as const,
      category: 'technical',
    },
  ] as const,

  CATEGORIES: {
    SCOPE: 'scope',
    FEATURES: 'features',
    PLANNING: 'planning',
    CONSTRAINTS: 'constraints',
    TECHNICAL: 'technical',
  } as const,

  QUESTION_TYPES: {
    OPEN: 'open',
    MULTIPLE_CHOICE: 'multiple_choice',
    YES_NO: 'yes_no',
  } as const,

  LIMITS: {
    MAX_QUESTIONS: 10,
    MIN_QUESTIONS: 3,
    MAX_OPTIONS: 6,
  },
} as const;

export const AGENT_PROMPTS = {
  BREAKDOWN: {
    SYSTEM: `You are an expert project manager and technical architect. Your role is to analyze project ideas and break them down into actionable tasks and timelines.`,

    TASK_DECOMPOSITION: `Analyze the following project idea and break it down into specific, actionable tasks. For each task, provide:
- A clear title
- Detailed description
- Estimated complexity (1-10)
- Required skills
- Dependencies on other tasks

Project Idea: {{idea}}
Clarification Answers: {{answers}}

Respond in JSON format with a "tasks" array.`,

    TIMELINE_GENERATION: `Based on the project tasks and timeline preference, create a detailed project timeline with phases and milestones.

Tasks: {{tasks}}
Timeline Preference: {{timeline}}
Available Hours Per Week: {{hoursPerWeek}}

Respond in JSON format with "phases" and "milestones" arrays.`,
  },

  CLARIFIER: {
    SYSTEM: `You are a helpful project clarifier. Your role is to ask insightful questions to better understand project requirements and constraints.`,

    QUESTION_GENERATION: `Based on the project idea, generate clarifying questions to better understand the requirements. Ask about:
1. Target audience
2. Core features
3. Timeline
4. Budget constraints
5. Technical preferences

Project Idea: {{idea}}

Respond in JSON format with a "questions" array.`,

    FOLLOW_UP: `Based on previous answers, generate follow-up questions to gather more details.

Previous Questions and Answers: {{qa}}

Respond in JSON format with a "questions" array.`,
  },
} as const;

export const AI_CONFIG = {
  CACHE: {
    KEY_HASH_LENGTH: 64,
    TTL_SECONDS: 3600,
    MAX_ENTRIES: 1000,
  },

  TOKENIZATION: {
    CHARS_PER_TOKEN: 4,
    AVG_TOKENS_PER_WORD: 1.3,
  },

  RETRY: {
    MAX_ATTEMPTS: 3,
    BACKOFF_MULTIPLIER: 2,
    INITIAL_DELAY_MS: 1000,
    MAX_DELAY_MS: 10000,
  },

  TIMEOUT: {
    DEFAULT_MS: 30000,
    LONG_RUNNING_MS: 120000,
  },
} as const;

export type ClarifierConfig = typeof CLARIFIER_CONFIG;
export type AgentPrompts = typeof AGENT_PROMPTS;
export type AiConfig = typeof AI_CONFIG;
