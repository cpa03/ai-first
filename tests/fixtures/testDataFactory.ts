// Test data factories for consistent testing

export interface TestIdea {
  id: string;
  user_id: string;
  title: string;
  raw_text: string;
  status: 'draft' | 'clarified' | 'breakdown' | 'completed';
  created_at: string;
  updated_at?: string;
}

export interface TestDeliverable {
  id: string;
  idea_id: string;
  title: string;
  description: string;
  priority: number;
  estimate_hours: number;
  status: 'todo' | 'in_progress' | 'completed';
  created_at: string;
}

export interface TestTask {
  id: string;
  deliverable_id: string;
  title: string;
  description: string;
  assignee: string;
  status: 'todo' | 'in_progress' | 'completed';
  estimate: number;
  created_at: string;
}

export interface TestClarificationQuestion {
  id: string;
  question: string;
  type: 'open' | 'multiple' | 'single';
  required: boolean;
  options?: string[];
}

export interface TestClarificationSession {
  ideaId: string;
  originalIdea: string;
  questions: TestClarificationQuestion[];
  answers: Record<string, string>;
  confidence: number;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

// Factory functions
export class TestDataFactory {
  static createIdea(overrides: Partial<TestIdea> = {}): TestIdea {
    return {
      id: `idea_${Math.random().toString(36).substr(2, 9)}`,
      user_id: `user_${Math.random().toString(36).substr(2, 9)}`,
      title: 'Test Project Idea',
      raw_text: 'This is a test project idea for testing purposes.',
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides,
    };
  }

  static createDeliverable(
    overrides: Partial<TestDeliverable> = {}
  ): TestDeliverable {
    return {
      id: `del_${Math.random().toString(36).substr(2, 9)}`,
      idea_id: `idea_${Math.random().toString(36).substr(2, 9)}`,
      title: 'Test Deliverable',
      description: 'This is a test deliverable description.',
      priority: 1,
      estimate_hours: 8,
      status: 'todo',
      created_at: new Date().toISOString(),
      ...overrides,
    };
  }

  static createTask(overrides: Partial<TestTask> = {}): TestTask {
    return {
      id: `task_${Math.random().toString(36).substr(2, 9)}`,
      deliverable_id: `del_${Math.random().toString(36).substr(2, 9)}`,
      title: 'Test Task',
      description: 'This is a test task description.',
      assignee: 'Test User',
      status: 'todo',
      estimate: 2,
      created_at: new Date().toISOString(),
      ...overrides,
    };
  }

  static createClarificationQuestion(
    overrides: Partial<TestClarificationQuestion> = {}
  ): TestClarificationQuestion {
    return {
      id: `q_${Math.random().toString(36).substr(2, 9)}`,
      question: 'What is the main problem you are trying to solve?',
      type: 'open',
      required: true,
      ...overrides,
    };
  }

  static createClarificationSession(
    overrides: Partial<TestClarificationSession> = {}
  ): TestClarificationSession {
    const questions = [
      this.createClarificationQuestion({
        id: 'target_audience',
        question: 'Who is your target audience?',
      }),
      this.createClarificationQuestion({
        id: 'main_goal',
        question: 'What is the main goal you want to achieve?',
      }),
      this.createClarificationQuestion({
        id: 'timeline',
        question: 'What is your desired timeline?',
        type: 'multiple',
        options: ['1-2 weeks', '1 month', '3 months', '6 months'],
      }),
    ];

    return {
      ideaId: `idea_${Math.random().toString(36).substr(2, 9)}`,
      originalIdea: 'Test idea for clarification',
      questions,
      answers: {},
      confidence: 0.5,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createProjectWithDeliverablesAndTasks(
    deliverableCount: number = 3,
    tasksPerDeliverable: number = 2
  ) {
    const idea = this.createIdea();
    const deliverables: TestDeliverable[] = [];
    const tasks: TestTask[] = [];

    for (let i = 0; i < deliverableCount; i++) {
      const deliverable = this.createDeliverable({
        idea_id: idea.id,
        title: `Deliverable ${i + 1}`,
        priority: i + 1,
      });
      deliverables.push(deliverable);

      for (let j = 0; j < tasksPerDeliverable; j++) {
        const task = this.createTask({
          deliverable_id: deliverable.id,
          title: `Task ${i + 1}.${j + 1}`,
          assignee: `User ${j + 1}`,
        });
        tasks.push(task);
      }
    }

    return { idea, deliverables, tasks };
  }

  static createLargeProject(
    deliverableCount: number = 10,
    tasksPerDeliverable: number = 5
  ) {
    return this.createProjectWithDeliverablesAndTasks(
      deliverableCount,
      tasksPerDeliverable
    );
  }

  static createComplexClarificationSession() {
    return this.createClarificationSession({
      questions: [
        this.createClarificationQuestion({
          id: 'problem',
          question: 'What specific problem are you solving?',
          required: true,
        }),
        this.createClarificationQuestion({
          id: 'audience',
          question: 'Who is your target audience?',
          required: true,
        }),
        this.createClarificationQuestion({
          id: 'solution',
          question: 'How do you plan to solve this problem?',
          required: true,
        }),
        this.createClarificationQuestion({
          id: 'features',
          question: 'What are the key features?',
          required: false,
        }),
        this.createClarificationQuestion({
          id: 'timeline',
          question: 'What is your timeline?',
          type: 'multiple',
          options: ['1 month', '3 months', '6 months', '1 year'],
          required: true,
        }),
        this.createClarificationQuestion({
          id: 'budget',
          question: 'What is your budget range?',
          type: 'multiple',
          options: ['<$1k', '$1k-$5k', '$5k-$10k', '$10k+'],
          required: false,
        }),
      ],
      answers: {
        problem: 'Managing remote team tasks effectively',
        audience: 'Small to medium tech companies',
        solution: 'Web-based task management tool',
        features: 'Real-time collaboration, reporting, integrations',
        timeline: '3 months',
        budget: '$5k-$10k',
      },
      confidence: 0.85,
      status: 'completed',
    });
  }
}

// Test fixtures for common scenarios
export const TestFixtures = {
  simpleIdea: TestDataFactory.createIdea({
    title: 'Simple Task App',
    raw_text: 'A simple task management application for personal use',
  }),

  complexIdea: TestDataFactory.createIdea({
    title: 'Enterprise Project Management Platform',
    raw_text:
      'A comprehensive project management platform for enterprise teams with advanced reporting, integrations, and workflow automation capabilities.',
  }),

  minimalProject: TestDataFactory.createProjectWithDeliverablesAndTasks(1, 1),

  standardProject: TestDataFactory.createProjectWithDeliverablesAndTasks(3, 2),

  largeProject: TestDataFactory.createLargeProject(5, 4),

  simpleClarificationSession: TestDataFactory.createClarificationSession({
    originalIdea: 'Simple task app',
    answers: {
      target_audience: 'Individual users',
      main_goal: 'Track personal tasks',
      timeline: '1 month',
    },
    status: 'completed',
  }),

  complexClarificationSession:
    TestDataFactory.createComplexClarificationSession(),
};

// Mock response generators
export const MockResponseGenerator = {
  aiQuestions: [
    'What is the main problem you are trying to solve?',
    'Who is your target audience?',
    'What key features do you need?',
    'What is your timeline for this project?',
    'What is your budget range?',
  ],

  generateClarifyingQuestions(_ideaText: string) {
    return {
      questions: this.aiQuestions.slice(0, 3 + Math.floor(Math.random() * 3)),
    };
  },

  generateRefinedIdea(session: TestClarificationSession) {
    const answersText = Object.values(session.answers).join(' ');
    return `Refined idea based on "${session.originalIdea}": ${answersText}`;
  },

  generateBlueprint(idea: string, answers: Record<string, string>) {
    return {
      title: `Project Blueprint: ${idea}`,
      sections: [
        {
          title: 'Summary',
          content: `Project based on: ${idea}`,
        },
        {
          title: 'Requirements',
          content: Object.entries(answers)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n'),
        },
      ],
    };
  },
};

// Test utilities
export const TestUtils = {
  generateRandomString(length: number = 10): string {
    return Math.random().toString(36).substr(2, length);
  },

  generateRandomEmail(): string {
    return `test_${this.generateRandomString()}@example.com`;
  },

  generateFutureDate(days: number = 30): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
  },

  generatePastDate(days: number = 30): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
  },

  async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  createMockFetch(response: unknown, ok: boolean = true, status: number = 200) {
    return jest.fn().mockResolvedValue({
      ok,
      status,
      json: async () => response,
    });
  },

  createMockFetchError(error: string) {
    return jest.fn().mockRejectedValue(new Error(error));
  },
};
