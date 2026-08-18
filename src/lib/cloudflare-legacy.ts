/**
 * Cloudflare-specific utilities and helpers
 *
 * This module provides utilities for detecting and working with Cloudflare
 * Workers environment, including platform detection, header extraction,
 * geo information, cache control, and edge-specific operations.
 *
 * @see https://developers.cloudflare.com/workers/runtime-apis/
 * @see https://developers.cloudflare.com/workers/runtime-apis/request/
 *
 * @deprecated This file is kept for backward compatibility.
 * Use direct imports from './cloudflare/' modules instead.
 */

// Re-export everything from the modular structure
export * from './cloudflare';
