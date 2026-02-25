/**
 * Event Handlers for Agent System
 *
 * Side effect handlers that react to events emitted by agents.
 * These handlers provide extensibility for adding new behaviors
 * without modifying the core agent code.
 */

import { eventBus } from './event-bus';
import type { AgentEvent } from './types';
import { dbService } from '@/lib/db';
import { createLogger } from '@/lib/logger';

const _logger = createLogger('EventHandlers');

/**
 * Handler for tracking event metrics
 */
async function handleEventMetrics(event: AgentEvent): Promise<void> {
  try {
    await dbService.logAgentAction('event-handler', `metrics.${event.type}`, {
      source: event.source,
      timestamp: event.timestamp,
      correlationId: event.correlationId,
    });
  } catch (error) {
    _logger.warn('Failed to log event metrics:', error);
  }
}

/**
 * Handler for logging event correlation
 */
async function handleEventCorrelation(event: AgentEvent): Promise<void> {
  if (event.correlationId) {
    _logger.debug(
      `Event ${event.type} with correlation ${event.correlationId}`
    );
  }
}

/**
 * Handler for BreakdownTaskGenerated events - triggers downstream processing
 */
async function handleTaskGenerated(event: AgentEvent): Promise<void> {
  if (event.type === 'BreakdownTaskGenerated') {
    const payload = event.payload as {
      ideaId: string;
      taskId: string;
      taskTitle: string;
      sessionId: string;
    };

    _logger.info(`Task generated: ${payload.taskTitle} (${payload.taskId})`);

    // Here you could trigger additional processing for each task
    // e.g., send notifications, trigger GitHub workflows, etc.
  }
}

/**
 * Handler for BreakdownCompleted events - triggers export workflow
 */
async function handleBreakdownCompleted(event: AgentEvent): Promise<void> {
  if (event.type === 'BreakdownCompleted') {
    const payload = event.payload as {
      ideaId: string;
      sessionId: string;
      taskCount: number;
    };

    _logger.info(
      `Breakdown completed for idea ${payload.ideaId}: ${payload.taskCount} tasks`
    );

    // Here you could trigger the export workflow automatically
    // or notify users that breakdown is ready
  }
}

/**
 * Handler for AgentError events - triggers alerting
 */
async function handleAgentError(event: AgentEvent): Promise<void> {
  if (event.type === 'AgentError') {
    const payload = event.payload as {
      ideaId: string;
      agent: string;
      error: string;
    };

    _logger.error(
      `Agent error in ${payload.agent} for idea ${payload.ideaId}: ${payload.error}`
    );

    // Here you could trigger alerts, send notifications, etc.
  }
}

/**
 * Handler for ClarificationCompleted events - triggers breakdown
 */
async function handleClarificationCompleted(event: AgentEvent): Promise<void> {
  if (event.type === 'ClarificationCompleted') {
    const payload = event.payload as {
      ideaId: string;
      refinedIdea: string;
    };

    _logger.info(`Clarification completed for idea ${payload.ideaId}`);

    // Here you could automatically start breakdown after clarification
    // This would require importing and initializing the breakdown engine
  }
}

/**
 * Register all event handlers
 * Call this once during application initialization
 */
export function registerEventHandlers(): void {
  // Subscribe to all events for metrics
  eventBus.subscribeAll(handleEventMetrics);

  // Subscribe to all events for correlation tracking
  eventBus.subscribeAll(handleEventCorrelation);

  // Subscribe to specific events
  eventBus.subscribe('BreakdownTaskGenerated', handleTaskGenerated);
  eventBus.subscribe('BreakdownCompleted', handleBreakdownCompleted);
  eventBus.subscribe('AgentError', handleAgentError);
  eventBus.subscribe('ClarificationCompleted', handleClarificationCompleted);

  _logger.info('Event handlers registered');
}

/**
 * Unregister all event handlers
 * Useful for testing
 */
export function unregisterEventHandlers(): void {
  // This would require tracking subscription IDs
  // For now, we can clear the event history
  eventBus.clearHistory();
  _logger.info('Event handlers unregistered (history cleared)');
}
