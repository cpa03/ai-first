/**
 * Event Types for Agent System
 *
 * Defines all typed events for the event-driven architecture.
 * Each event type includes metadata and payload specific to the event.
 */

/** Base event interface */
export interface BaseEvent<T extends string, P> {
  type: T;
  payload: P;
  timestamp: Date;
  source: 'clarifier' | 'breakdown-engine' | 'export' | 'system';
  correlationId?: string;
}

/** Idea Created Event */
export type IdeaCreatedEvent = BaseEvent<
  'IdeaCreated',
  {
    ideaId: string;
    ideaText: string;
    userId?: string;
  }
>;

/** Clarification Started Event */
export type ClarificationStartedEvent = BaseEvent<
  'ClarificationStarted',
  {
    ideaId: string;
    ideaText: string;
    sessionId: string;
  }
>;

/** Clarification Answer Submitted Event */
export type ClarificationAnswerSubmittedEvent = BaseEvent<
  'ClarificationAnswerSubmitted',
  {
    ideaId: string;
    questionId: string;
    answer: string;
    sessionId: string;
  }
>;

/** Clarification Completed Event */
export type ClarificationCompletedEvent = BaseEvent<
  'ClarificationCompleted',
  {
    ideaId: string;
    refinedIdea: string;
    questionsAnswered: number;
    confidence: number;
    sessionId: string;
  }
>;

/** Breakdown Started Event */
export type BreakdownStartedEvent = BaseEvent<
  'BreakdownStarted',
  {
    ideaId: string;
    refinedIdea: string;
    userResponses: Record<string, string>;
    options: {
      complexity?: 'simple' | 'medium' | 'complex';
      teamSize?: number;
      timelineWeeks?: number;
    };
  }
>;

/** Breakdown Task Generated Event */
export type BreakdownTaskGeneratedEvent = BaseEvent<
  'BreakdownTaskGenerated',
  {
    ideaId: string;
    taskId: string;
    taskTitle: string;
    sessionId: string;
  }
>;

/** Breakdown Completed Event */
export type BreakdownCompletedEvent = BaseEvent<
  'BreakdownCompleted',
  {
    ideaId: string;
    sessionId: string;
    taskCount: number;
    confidence: number;
    processingTime: number;
  }
>;

/** Deliverable Created Event */
export type DeliverableCreatedEvent = BaseEvent<
  'DeliverableCreated',
  {
    ideaId: string;
    deliverableId: string;
    deliverableType: 'blueprint' | 'roadmap' | 'tasks' | 'template';
    sessionId: string;
  }
>;

/** Export Requested Event */
export type ExportRequestedEvent = BaseEvent<
  'ExportRequested',
  {
    ideaId: string;
    exportFormat: 'markdown' | 'json' | 'notion' | 'trello';
    deliverableIds: string[];
  }
>;

/** Export Completed Event */
export type ExportCompletedEvent = BaseEvent<
  'ExportCompleted',
  {
    ideaId: string;
    exportFormat: 'markdown' | 'json' | 'notion' | 'trello';
    success: boolean;
    error?: string;
  }
>;

/** Agent Error Event */
export type AgentErrorEvent = BaseEvent<
  'AgentError',
  {
    ideaId: string;
    agent: 'clarifier' | 'breakdown-engine' | 'export';
    error: string;
    context?: Record<string, unknown>;
  }
>;

/** Union of all event types */
export type AgentEvent =
  | IdeaCreatedEvent
  | ClarificationStartedEvent
  | ClarificationAnswerSubmittedEvent
  | ClarificationCompletedEvent
  | BreakdownStartedEvent
  | BreakdownTaskGeneratedEvent
  | BreakdownCompletedEvent
  | DeliverableCreatedEvent
  | ExportRequestedEvent
  | ExportCompletedEvent
  | AgentErrorEvent;

/** All event type strings */
export type EventType = AgentEvent['type'];

/** Event payload mapping using literal types */
export interface EventPayloadMap {
  IdeaCreated: IdeaCreatedEvent['payload'];
  ClarificationStarted: ClarificationStartedEvent['payload'];
  ClarificationAnswerSubmitted: ClarificationAnswerSubmittedEvent['payload'];
  ClarificationCompleted: ClarificationCompletedEvent['payload'];
  BreakdownStarted: BreakdownStartedEvent['payload'];
  BreakdownTaskGenerated: BreakdownTaskGeneratedEvent['payload'];
  BreakdownCompleted: BreakdownCompletedEvent['payload'];
  DeliverableCreated: DeliverableCreatedEvent['payload'];
  ExportRequested: ExportRequestedEvent['payload'];
  ExportCompleted: ExportCompletedEvent['payload'];
  AgentError: AgentErrorEvent['payload'];
}
