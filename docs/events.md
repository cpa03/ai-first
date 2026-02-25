# Agent Event System Documentation

## Overview

The event-driven architecture enables loose coupling between agents, provides built-in audit trails, and allows for easy extensibility. The system uses a central event bus that agents publish to and subscribe from.

## Event Bus

The event bus (`src/lib/agents/events/event-bus.ts`) is the central hub for all agent communications.

### Usage

```typescript
import { eventBus } from './events';

// Subscribe to events
const subscriptionId = eventBus.subscribe('ClarificationCompleted', (event) => {
  console.log('Clarification completed:', event.payload);
});

// Emit events
await eventBus.emit({
  type: 'ClarificationCompleted',
  payload: { ideaId: '123', refinedIdea: '...' },
  timestamp: new Date(),
  source: 'clarifier',
});

// Unsubscribe
eventBus.unsubscribe(subscriptionId);
```

## Event Types

### Idea Events

| Event         | Description                            | Payload                        |
| ------------- | -------------------------------------- | ------------------------------ |
| `IdeaCreated` | Triggered when a new idea is submitted | `{ ideaId, ideaText, userId }` |

### Clarification Events

| Event                          | Description                                    | Payload                                                             |
| ------------------------------ | ---------------------------------------------- | ------------------------------------------------------------------- |
| `ClarificationStarted`         | Clarification session begins                   | `{ ideaId, ideaText, sessionId }`                                   |
| `ClarificationAnswerSubmitted` | User submits an answer                         | `{ ideaId, questionId, answer, sessionId }`                         |
| `ClarificationCompleted`       | All questions answered, refined idea generated | `{ ideaId, refinedIdea, questionsAnswered, confidence, sessionId }` |

### Breakdown Events

| Event                    | Description                | Payload                                                        |
| ------------------------ | -------------------------- | -------------------------------------------------------------- |
| `BreakdownStarted`       | Breakdown process begins   | `{ ideaId, refinedIdea, userResponses, options }`              |
| `BreakdownTaskGenerated` | Individual task created    | `{ ideaId, taskId, taskTitle, sessionId }`                     |
| `BreakdownCompleted`     | Breakdown process finished | `{ ideaId, sessionId, taskCount, confidence, processingTime }` |

### Deliverable Events

| Event                | Description              | Payload                                                 |
| -------------------- | ------------------------ | ------------------------------------------------------- |
| `DeliverableCreated` | Deliverable generated    | `{ ideaId, deliverableId, deliverableType, sessionId }` |
| `ExportRequested`    | Export process requested | `{ ideaId, exportFormat, deliverableIds }`              |
| `ExportCompleted`    | Export process finished  | `{ ideaId, exportFormat, success, error? }`             |

### Error Events

| Event        | Description             | Payload                              |
| ------------ | ----------------------- | ------------------------------------ |
| `AgentError` | Error occurred in agent | `{ ideaId, agent, error, context? }` |

## Event Handlers

Event handlers allow you to react to events without modifying agent code. They're registered at application startup:

```typescript
import { registerEventHandlers } from './events';

// In your app initialization
registerEventHandlers();
```

### Built-in Handlers

- **Metrics Handler**: Tracks event counts and timestamps
- **Correlation Handler**: Logs event correlation IDs
- **Task Generated Handler**: Triggers downstream processing for tasks
- **Breakdown Completed Handler**: Triggers export workflow
- **Error Handler**: Triggers alerting for errors

## Adding Custom Handlers

```typescript
import { eventBus } from './events';

eventBus.subscribe('BreakdownCompleted', async (event) => {
  // Custom logic here
  const { payload } = event;

  // Send notification, trigger webhook, etc.
});
```

## Event History

The event bus maintains an in-memory history of events (limited to 1000 events):

```typescript
import { eventBus } from './events';

// Get recent events
const recentEvents = eventBus.getHistory(100);

// Get events for specific idea
const ideaEvents = eventBus.getEventsForIdea('idea-123');

// Get events by type
const errors = eventBus.getHistory(50, 'AgentError');
```

## Audit Trail

All events are automatically logged to the database via `dbService.logAgentAction()`. This provides:

- Full traceability of agent actions
- Debugging support
- Performance monitoring
- Compliance audit logs

## Type Safety

The event system is fully typed. Use the `EventPayloadMap` type for type-safe handler definitions:

```typescript
import type { EventPayloadMap, AgentEvent } from './events';

function handleEvent<T extends keyof EventPayloadMap>(
  type: T,
  handler: (payload: EventPayloadMap[T]) => void
) {
  eventBus.subscribe(type as AgentEvent['type'], (event) => {
    handler(event.payload);
  });
}
```

## Migration Guide

### From Callbacks to Events

**Before:**

```typescript
// Direct callback
breakdownEngine.startBreakdown(ideaId, refinedIdea, (result) => {
  // Handle result
});
```

**After:**

```typescript
// Event-based
eventBus.subscribe('BreakdownCompleted', (event) => {
  // Handle result
});

await breakdownEngine.startBreakdown(ideaId, refinedIdea, userResponses);
```

### From Direct Method Calls to Event Subscription

**Before:**

```typescript
// Direct coupling
await clarifier.completeClarification(ideaId);
await breakdownEngine.startBreakdown(ideaId, refinedIdea, ...);
```

**After:**

```typescript
// Loose coupling via events
eventBus.subscribe('ClarificationCompleted', async (event) => {
  await breakdownEngine.startBreakdown(
    event.payload.ideaId,
    event.payload.refinedIdea,
    {}
  );
});
```
