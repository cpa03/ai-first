import {
  withApiHandler,
  standardSuccessResponse,
  ApiContext,
} from '@/lib/api-handler';
import { dbService, Task } from '@/lib/db';
import { AppError, ErrorCode, ValidationError } from '@/lib/errors';
import { requireAuth, verifyResourceOwnership } from '@/lib/auth';
import { API_ERROR_MESSAGES } from '@/lib/config/error-messages';
import { TASK_CONFIG } from '@/lib/config';
import { STATUS_CODES } from '@/lib/config/constants';

const VALID_STATUSES = [
  TASK_CONFIG.STATUSES.TODO,
  TASK_CONFIG.STATUSES.IN_PROGRESS,
  TASK_CONFIG.STATUSES.COMPLETED,
] as const;
type TaskStatus = (typeof VALID_STATUSES)[number];

const VALID_RISK_LEVELS = [
  TASK_CONFIG.RISK_LEVELS.LOW,
  TASK_CONFIG.RISK_LEVELS.MEDIUM,
  TASK_CONFIG.RISK_LEVELS.HIGH,
] as const;

type TaskUpdateBody = Partial<
  Omit<Task, 'id' | 'created_at' | 'deliverable_id'>
>;

async function handlePut(context: ApiContext) {
  const { request } = context;
  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const taskId = segments.at(-1);

  if (!taskId) {
    throw new ValidationError([
      { field: 'taskId', message: 'Task ID is required' },
    ]);
  }

  let body: TaskUpdateBody;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError([
      { field: 'body', message: 'Invalid JSON body' },
    ]);
  }

  // Validate status if provided
  if (body.status && !VALID_STATUSES.includes(body.status as TaskStatus)) {
    throw new ValidationError([
      {
        field: 'status',
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      },
    ]);
  }

  // Validate risk_level if provided
  if (body.risk_level && !VALID_RISK_LEVELS.includes(body.risk_level)) {
    throw new ValidationError([
      {
        field: 'risk_level',
        message: `Invalid risk_level. Must be one of: ${VALID_RISK_LEVELS.join(', ')}`,
      },
    ]);
  }

  // Validate estimate if provided
  if (body.estimate !== undefined) {
    if (typeof body.estimate !== 'number' || body.estimate < 0) {
      throw new ValidationError([
        { field: 'estimate', message: 'Estimate must be a positive number' },
      ]);
    }
  }

  // Validate completion_percentage if provided
  if (body.completion_percentage !== undefined) {
    if (
      typeof body.completion_percentage !== 'number' ||
      body.completion_percentage < TASK_CONFIG.COMPLETION.MIN ||
      body.completion_percentage > TASK_CONFIG.COMPLETION.MAX
    ) {
      throw new ValidationError([
        {
          field: 'completion_percentage',
          message: API_ERROR_MESSAGES.VALIDATION.COMPLETION_PERCENTAGE_RANGE,
        },
      ]);
    }
  }

  try {
    // Authenticate user
    const user = await requireAuth(request);

    // Get task with ownership information
    const taskWithOwnership = await dbService.getTaskWithOwnership(taskId);

    if (!taskWithOwnership) {
      throw new AppError(
        API_ERROR_MESSAGES.NOT_FOUND.TASK,
        ErrorCode.NOT_FOUND,
        STATUS_CODES.NOT_FOUND
      );
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
      STATUS_CODES.OK,
      context.rateLimit
    );
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      API_ERROR_MESSAGES.INTERNAL.UPDATE_TASK_FAILED,
      ErrorCode.INTERNAL_ERROR,
      STATUS_CODES.INTERNAL_ERROR
    );
  }
}

async function handleDelete(context: ApiContext) {
  const { request } = context;
  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const taskId = segments.at(-1);

  if (!taskId) {
    throw new ValidationError([
      { field: 'taskId', message: 'Task ID is required' },
    ]);
  }

  try {
    // Authenticate user
    const user = await requireAuth(request);

    // Get task with ownership information
    const taskWithOwnership = await dbService.getTaskWithOwnership(taskId);

    if (!taskWithOwnership) {
      throw new AppError(
        API_ERROR_MESSAGES.NOT_FOUND.TASK,
        ErrorCode.NOT_FOUND,
        STATUS_CODES.NOT_FOUND
      );
    }

    // Verify ownership
    verifyResourceOwnership(user.id, taskWithOwnership.idea.user_id, 'task');

    // Soft delete the task
    await dbService.softDeleteTask(taskId);

    return standardSuccessResponse(
      { message: 'Task deleted successfully', taskId },
      context.requestId,
      STATUS_CODES.OK,
      context.rateLimit
    );
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      API_ERROR_MESSAGES.INTERNAL.DELETE_TASK_FAILED,
      ErrorCode.INTERNAL_ERROR,
      STATUS_CODES.INTERNAL_ERROR
    );
  }
}

async function handleGet(context: ApiContext) {
  const { request } = context;
  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const taskId = segments.at(-1);

  if (!taskId) {
    throw new ValidationError([
      { field: 'taskId', message: 'Task ID is required' },
    ]);
  }

  try {
    // Authenticate user
    const user = await requireAuth(request);

    // Get task with ownership information
    const taskWithOwnership = await dbService.getTaskWithOwnership(taskId);

    if (!taskWithOwnership) {
      throw new AppError(
        API_ERROR_MESSAGES.NOT_FOUND.TASK,
        ErrorCode.NOT_FOUND,
        STATUS_CODES.NOT_FOUND
      );
    }

    // Verify ownership
    verifyResourceOwnership(user.id, taskWithOwnership.idea.user_id, 'task');

    return standardSuccessResponse(
      { task: taskWithOwnership },
      context.requestId,
      STATUS_CODES.OK,
      context.rateLimit
    );
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      API_ERROR_MESSAGES.INTERNAL.FETCH_TASK_FAILED,
      ErrorCode.INTERNAL_ERROR,
      STATUS_CODES.INTERNAL_ERROR
    );
  }
}

export const GET = withApiHandler(handleGet, { rateLimit: 'lenient' });
export const PUT = withApiHandler(handlePut, { rateLimit: 'moderate' });
export const DELETE = withApiHandler(handleDelete, { rateLimit: 'moderate' });
