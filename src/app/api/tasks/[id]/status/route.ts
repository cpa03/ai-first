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
import { RESOURCE_TYPES } from '@/lib/config/modular-constants';

const VALID_STATUSES = TASK_CONFIG.VALID_STATUSES;
type TaskStatus = (typeof VALID_STATUSES)[number];

interface StatusUpdateBody {
  status: TaskStatus;
}

async function handlePatch(context: ApiContext) {
  const { request, params } = context;

  // PERFORMANCE: Use context.params.id for faster access
  // instead of manual URL parsing and segment extraction.
  const taskId = params.id;

  if (!taskId) {
    throw new ValidationError([
      {
        field: 'taskId',
        message: API_ERROR_MESSAGES.ROUTE_VALIDATION.TASK_ID_REQUIRED,
      },
    ]);
  }

  let body: StatusUpdateBody;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError([
      {
        field: 'body',
        message: API_ERROR_MESSAGES.ROUTE_VALIDATION.INVALID_JSON_BODY,
      },
    ]);
  }

  // Validate required fields
  if (!body.status) {
    throw new ValidationError([
      {
        field: 'status',
        message: API_ERROR_MESSAGES.ROUTE_VALIDATION.STATUS_REQUIRED,
      },
    ]);
  }

  // Validate status
  if (!VALID_STATUSES.includes(body.status)) {
    throw new ValidationError([
      {
        field: 'status',
        message:
          API_ERROR_MESSAGES.VALIDATION.INVALID_STATUS_WITH_VALUES(
            VALID_STATUSES
          ),
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
    verifyResourceOwnership(
      user.id,
      taskWithOwnership.idea.user_id,
      RESOURCE_TYPES.TASK
    );

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
      API_ERROR_MESSAGES.INTERNAL.UPDATE_TASK_STATUS_FAILED,
      ErrorCode.INTERNAL_ERROR,
      STATUS_CODES.INTERNAL_ERROR
    );
  }
}

export const PATCH = withApiHandler(handlePatch, { rateLimit: 'moderate' });
