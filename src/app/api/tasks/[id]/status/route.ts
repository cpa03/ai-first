import {
  withApiHandler,
  standardSuccessResponse,
  ApiContext,
} from '@/lib/api-handler';
import { dbService } from '@/lib/db';
import { AppError, ErrorCode, ValidationError } from '@/lib/errors';
import { requireAuth, verifyResourceOwnership } from '@/lib/auth';
import { TASK_CONFIG } from '@/lib/config';
import { STATUS_CODES } from '@/lib/config/constants';
import { API_ERROR_MESSAGES } from '@/lib/config/error-messages';

const VALID_STATUSES = [
  TASK_CONFIG.STATUSES.TODO,
  TASK_CONFIG.STATUSES.IN_PROGRESS,
  TASK_CONFIG.STATUSES.COMPLETED,
] as const;
type TaskStatus = (typeof VALID_STATUSES)[number];

interface StatusUpdateBody {
  status: TaskStatus;
}

async function handlePatch(context: ApiContext) {
  const { request } = context;
  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const taskId = segments.at(-2);

  if (!taskId) {
    throw new ValidationError([
      { field: 'taskId', message: 'Task ID is required' },
    ]);
  }

  let body: StatusUpdateBody;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError([
      { field: 'body', message: 'Invalid JSON body' },
    ]);
  }

  // Validate required fields
  if (!body.status) {
    throw new ValidationError([
      { field: 'status', message: 'Status is required' },
    ]);
  }

  // Validate status
  if (!VALID_STATUSES.includes(body.status)) {
    throw new ValidationError([
      {
        field: 'status',
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      },
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

    // Calculate completion percentage based on status
    const completionPercentage =
      body.status === TASK_CONFIG.STATUSES.COMPLETED
        ? TASK_CONFIG.COMPLETION.PERCENTAGES.COMPLETED
        : body.status === TASK_CONFIG.STATUSES.IN_PROGRESS
          ? TASK_CONFIG.COMPLETION.PERCENTAGES.IN_PROGRESS
          : TASK_CONFIG.COMPLETION.PERCENTAGES.NOT_STARTED;

    const updatedTask = await dbService.updateTask(taskId, {
      status: body.status,
      completion_percentage: completionPercentage,
    });

    return standardSuccessResponse(
      {
        task: updatedTask,
        message: `Task status updated to ${body.status}`,
      },
      context.requestId,
      STATUS_CODES.OK,
      context.rateLimit
    );
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      'Failed to update task status',
      ErrorCode.INTERNAL_ERROR,
      STATUS_CODES.INTERNAL_ERROR
    );
  }
}

export const PATCH = withApiHandler(handlePatch, { rateLimit: 'moderate' });
