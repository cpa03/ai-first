/**
 * Task Management Types
 *
 * Shared type definitions for task management functionality.
 * Kept minimal to avoid circular dependencies.
 */

// Task status values
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

// Task with status
export interface TaskWithStatus {
  id: string;
  status: TaskStatus;
  title: string;
}
