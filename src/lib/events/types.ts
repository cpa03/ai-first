/**
 * Event types for the event-driven agent architecture.
 *
 * These events are emitted by agents to enable loose coupling,
 * extensibility, and built-in audit trail.
 */

/**
 * Base event interface that all events extend.
 */
export interface BaseEvent {
  /** Unique event identifier */
  eventId: string;
  /** Timestamp when the event was emitted */
  timestamp: Date;
  /** The type of event */
  type: EventType;
  /** Associated idea ID */
  ideaId: string;
}

/**
 * All available event types in the system.
 */
export type EventType =
  | 'idea.created'
  | 'clarification.started'
  | 'clarification.answer-submitted'
  | 'clarification.completed'
  | 'breakdown.started'
  | 'breakdown.analysis-completed'
  | 'breakdown.decomposition-completed'
  | 'breakdown.dependencies-completed'
  | 'breakdown.timeline-completed'
  | 'breakdown.completed'
  | 'deliverable.created'
  | 'task.generated'
  | 'export.requested';

/**
 * Event payload for idea creation.
 */
export interface IdeaCreatedEvent extends BaseEvent {
  type: 'idea.created';
  payload: {
    ideaText: string;
    userId: string;
  };
}

/**
 * Event payload for clarification start.
 */
export interface ClarificationStartedEvent extends BaseEvent {
  type: 'clarification.started';
  payload: {
    originalIdea: string;
    questionCount: number;
  };
}

/**
 * Event payload when an answer is submitted during clarification.
 */
export interface ClarificationAnswerSubmittedEvent extends BaseEvent {
  type: 'clarification.answer-submitted';
  payload: {
    questionId: string;
    answerLength: number;
    confidence: number;
  };
}

/**
 * Event payload for clarification completion.
 */
export interface ClarificationCompletedEvent extends BaseEvent {
  type: 'clarification.completed';
  payload: {
    refinedIdea: string;
    questionsAnswered: number;
    confidence: number;
  };
}

/**
 * Event payload for breakdown start.
 */
export interface BreakdownStartedEvent extends BaseEvent {
  type: 'breakdown.started';
  payload: {
    refinedIdea: string;
    userResponses: Record<string, string>;
    options: {
      complexity?: 'simple' | 'medium' | 'complex';
      teamSize?: number;
      timelineWeeks?: number;
      constraints?: string[];
    };
  };
}

/**
 * Event payload for breakdown analysis completion.
 */
export interface BreakdownAnalysisCompletedEvent extends BaseEvent {
  type: 'breakdown.analysis-completed';
  payload: {
    analysisSummary: string;
  };
}

/**
 * Event payload for task decomposition completion.
 */
export interface BreakdownDecompositionCompletedEvent extends BaseEvent {
  type: 'breakdown.decomposition-completed';
  payload: {
    taskCount: number;
  };
}

/**
 * Event payload for dependency analysis completion.
 */
export interface BreakdownDependenciesCompletedEvent extends BaseEvent {
  type: 'breakdown.dependencies-completed';
  payload: {
    dependencyCount: number;
  };
}

/**
 * Event payload for timeline generation completion.
 */
export interface BreakdownTimelineCompletedEvent extends BaseEvent {
  type: 'breakdown.timeline-completed';
  payload: {
    timelineWeeks: number;
  };
}

/**
 * Event payload for breakdown completion.
 */
export interface BreakdownCompletedEvent extends BaseEvent {
  type: 'breakdown.completed';
  payload: {
    sessionId: string;
    processingTime: number;
    confidence: number;
    taskCount: number;
  };
}

/**
 * Event payload for deliverable creation.
 */
export interface DeliverableCreatedEvent extends BaseEvent {
  type: 'deliverable.created';
  payload: {
    deliverableId: string;
    deliverableType: string;
    taskCount: number;
  };
}

/**
 * Event payload for task generation.
 */
export interface TaskGeneratedEvent extends BaseEvent {
  type: 'task.generated';
  payload: {
    taskId: string;
    taskTitle: string;
    deliverableId?: string;
  };
}

/**
 * Event payload for export request.
 */
export interface ExportRequestedEvent extends BaseEvent {
  type: 'export.requested';
  payload: {
    exportFormat: string;
    includeTimeline: boolean;
    includeTasks: boolean;
  };
}

/**
 * Union type of all possible events.
 */
export type AgentEvent =
  | IdeaCreatedEvent
  | ClarificationStartedEvent
  | ClarificationAnswerSubmittedEvent
  | ClarificationCompletedEvent
  | BreakdownStartedEvent
  | BreakdownAnalysisCompletedEvent
  | BreakdownDecompositionCompletedEvent
  | BreakdownDependenciesCompletedEvent
  | BreakdownTimelineCompletedEvent
  | BreakdownCompletedEvent
  | DeliverableCreatedEvent
  | TaskGeneratedEvent
  | ExportRequestedEvent;

/**
 * Event handler type for processing events.
 */
export type EventHandler<T extends AgentEvent = AgentEvent> = (
  event: T
) => void | Promise<void>;

/**
 * Event subscription with unsubscribe capability.
 */
export interface EventSubscription {
  /** Unique subscription ID */
  id: string;
  /** The event type being subscribed to */
  eventType: EventType;
  /** The handler function */
  handler: EventHandler;
  /** Optional filter function */
  filter?: (event: AgentEvent) => boolean;
}

/**
 * Maps event types to their payload types for type-safe handlers.
 */
export type EventPayloadMap = {
  'idea.created': IdeaCreatedEvent;
  'clarification.started': ClarificationStartedEvent;
  'clarification.answer-submitted': ClarificationAnswerSubmittedEvent;
  'clarification.completed': ClarificationCompletedEvent;
  'breakdown.started': BreakdownStartedEvent;
  'breakdown.analysis-completed': BreakdownAnalysisCompletedEvent;
  'breakdown.decomposition-completed': BreakdownDecompositionCompletedEvent;
  'breakdown.dependencies-completed': BreakdownDependenciesCompletedEvent;
  'breakdown.timeline-completed': BreakdownTimelineCompletedEvent;
  'breakdown.completed': BreakdownCompletedEvent;
  'deliverable.created': DeliverableCreatedEvent;
  'task.generated': TaskGeneratedEvent;
  'export.requested': ExportRequestedEvent;
};
