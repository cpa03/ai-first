/**
 * AI Module - Modular AI Service Components
 *
 * This module provides separated concerns for the AI Service:
 * - AIProviderRegistry: Provider client initialization and management
 * - AICostTracker: Cost tracking, limits, and memory leak prevention
 * - AIRateLimiter: Rate limiting and resilience patterns
 * - AIService: Main service orchestrating the above components
 */

export { AIProviderRegistry, createAIProviderRegistry, defaultProviderRegistry } from './provider-registry';
export { AICostTracker } from './cost-tracker';
export { AIRateLimiter } from './rate-limiter';

// Re-export types
export type { AIModelConfig, CostTracker, ContextWindow } from './types';