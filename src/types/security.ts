/**
 * Security-related type definitions
 *
 * This file contains shared security types to avoid circular dependencies
 * between security modules and configuration files.
 *
 * @module types/security
 */

/**
 * Categories of suspicious patterns
 */
export type SuspiciousPatternCategory =
  | 'sql_injection'
  | 'xss'
  | 'path_traversal'
  | 'command_injection'
  | 'ssrf'
  | 'header_injection'
  | 'encoding_attack'
  | 'nosql_injection'
  | 'prototype_pollution'
  | 'log_injection'
  | 'ssti'
  | 'insecure_deserialization';
