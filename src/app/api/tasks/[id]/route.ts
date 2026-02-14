import {
  withApiHandler,
  standardSuccessResponse,
  notFoundResponse,
  badRequestResponse,
  ApiContext,
} from '@/lib/api-handler';
import { dbService, Task } from '@/lib/db';
import { AppError, ErrorCode } from '@/lib/errors';
import { requireAuth, verifyResourceOwnership } from '@/lib/auth';

// Valid task statuses
const VALID_STATUSES = ['todo', 'in_progress', 'completed'] as const;
type TaskStatus = (typeof VALID_STATUSES)[number];

// Valid risk levels
const VALID_RISK_LEVELS = ['low', 'medium', 'high'] as const;

type TaskUpdateBody = Partial<
  Omit<Task, 'id' | 'created_at' | 'deliverable_id'>
>;

async function handlePut(context: ApiContext) {
  const { request } = context;
  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const taskId = segments.at(-1);

  if (!taskId) {
    return badRequestResponse('Task ID is required');
  }

  let body: TaskUpdateBody;
  try {
    body = await request.json();
  } catch {
    return badRequestResponse('Invalid JSON body');
  }

  // Validate status if provided
  if (body.status && !VALID_STATUSES.includes(body.status as TaskStatus)) {
    return badRequestResponse(
      `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
    );
  }

  // Validate risk_level if provided
  if (body.risk_level && !VALID_RISK_LEVELS.includes(body.risk_level)) {
    return badRequestResponse(
      `Invalid risk_level. Must be one of: ${VALID_RISK_LEVELS.join(', ')}`
    );
  }

  // Validate estimate if provided
  if (body.estimate !== undefined) {
    if (typeof body.estimate !== 'number' || body.estimate < 0) {
      return badRequestResponse('Estimate must be a positive number');
    }
  }

  // Validate completion_percentage if provided
  if (body.completion_percentage !== undefined) {
    if (
      typeof body.completion_percentage !== 'number' ||
      body.completion_percentage < 0 ||
      body.completion_percentage > 100
    ) {
      return badRequestResponse(
        'Completion percentage must be between 0 and 100'
      );
    }
  }

  try {
    // Authenticate user
    const user = await requireAuth(request);

    // Get task with ownership information
    const taskWithOwnership = await dbService.getTaskWithOwnership(taskId);

    if (!taskWithOwnership) {
      return notFoundResponse('Task not found');
    }

    // Verify ownership
    verifyResourceOwnership(user.id, taskWithOwnership.idea.user_id, 'task');

    // Update the task
    const updates: Partial<Task> = {};

    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.status !== undefined) updates.status = body.status;
    if (body.assignee !== undefined) updates.assignee = body.assignee;
    if (body.estimate !== undefined) updates.estimate = body.estimate;
    if (body.start_date !== undefined) updates.start_date = body.start_date;
    if (body.end_date !== undefined) updates.end_date = body.end_date;
    if (body.actual_hours !== undefined)
      updates.actual_hours = body.actual_hours;
    if (body.completion_percentage !== undefined)
      updates.completion_percentage = body.completion_percentage;
    if (body.priority_score !== undefined)
      updates.priority_score = body.priority_score;
    if (body.complexity_score !== undefined)
      updates.complexity_score = body.complexity_score;
    if (body.risk_level !== undefined) updates.risk_level = body.risk_level;
    if (body.tags !== undefined) updates.tags = body.tags;
    if (body.custom_fields !== undefined)
      updates.custom_fields = body.custom_fields;
    if (body.milestone_id !== undefined)
      updates.milestone_id = body.milestone_id;

    const updatedTask = await dbService.updateTask(taskId, updates);

    return standardSuccessResponse(
      { task: updatedTask },
      context.requestId,
      200,
      context.rateLimit
    );
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to update task', ErrorCode.INTERNAL_ERROR, 500);
  }
}

async function handleDelete(context: ApiContext) {
  const { request } = context;
  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const taskId = segments.at(-1);

  if (!taskId) {
    return badRequestResponse('Task ID is required');
  }

  try {
    // Authenticate user
    const user = await requireAuth(request);

    // Get task with ownership information
    const taskWithOwnership = await dbService.getTaskWithOwnership(taskId);

    if (!taskWithOwnership) {
      return notFoundResponse('Task not found');
    }

    // Verify ownership
    verifyResourceOwnership(user.id, taskWithOwnership.idea.user_id, 'task');

    // Soft delete the task
    await dbService.softDeleteTask(taskId);

    return standardSuccessResponse(
      { message: 'Task deleted successfully', taskId },
      context.requestId,
      200,
      context.rateLimit
    );
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to delete task', ErrorCode.INTERNAL_ERROR, 500);
  }
}

async function handleGet(context: ApiContext) {
  const { request } = context;
  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const taskId = segments.at(-1);

  if (!taskId) {
    return badRequestResponse('Task ID is required');
  }

  try {
    // Authenticate user
    const user = await requireAuth(request);

    // Get task with ownership information
    const taskWithOwnership = await dbService.getTaskWithOwnership(taskId);

    if (!taskWithOwnership) {
      return notFoundResponse('Task not found');
    }

    // Verify ownership
    verifyResourceOwnership(user.id, taskWithOwnership.idea.user_id, 'task');

    return standardSuccessResponse(
      { task: taskWithOwnership },
      context.requestId,
      200,
      context.rateLimit
    );
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch task', ErrorCode.INTERNAL_ERROR, 500);
  }
}

export const GET = withApiHandler(handleGet, { rateLimit: 'lenient' });
export const PUT = withApiHandler(handlePut, { rateLimit: 'moderate' });
export const DELETE = withApiHandler(handleDelete, { rateLimit: 'moderate' });
