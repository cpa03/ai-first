/**
 * Events module exports
 */

export { eventBus, createEventEmitter } from './event-bus';
export { registerEventHandlers, unregisterEventHandlers } from './handlers';
export type { EventHandler, Subscription } from './event-bus';

export type {
  BaseEvent,
  IdeaCreatedEvent,
  ClarificationStartedEvent,
  ClarificationAnswerSubmittedEvent,
  ClarificationCompletedEvent,
  BreakdownStartedEvent,
  BreakdownTaskGeneratedEvent,
  BreakdownCompletedEvent,
  DeliverableCreatedEvent,
  ExportRequestedEvent,
  ExportCompletedEvent,
  AgentErrorEvent,
  AgentEvent,
  EventType,
  EventPayloadMap,
} from './types';
