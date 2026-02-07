import {
  withApiHandler,
  standardSuccessResponse,
  badRequestResponse,
  notFoundResponse,
  ApiContext,
} from '@/lib/api-handler';
import { dbService } from '@/lib/db';
import { AppError, ErrorCode } from '@/lib/errors';
import { requireAuth, verifyResourceOwnership } from '@/lib/auth';

// Valid task statuses
const VALID_STATUSES = ['todo', 'in_progress', 'completed'] as const;
type TaskStatus = (typeof VALID_STATUSES)[number];

interface StatusUpdateBody {
  status: TaskStatus;
}

async function handlePatch(context: ApiContext) {
  const { request } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;
  const taskId = pathname.split('/')[3];

  if (!taskId) {
    return badRequestResponse('Task ID is required');
  }

  let body: StatusUpdateBody;
  try {
    body = await request.json();
  } catch {
    return badRequestResponse('Invalid JSON body');
  }

  // Validate required fields
  if (!body.status) {
    return badRequestResponse('Status is required');
  }

  // Validate status
  if (!VALID_STATUSES.includes(body.status)) {
    return badRequestResponse(
      `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
    );
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

    // Calculate completion percentage based on status
    const completionPercentage =
      body.status === 'completed'
        ? 100
        : body.status === 'in_progress'
          ? 50
          : 0;

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
      200,
      context.rateLimit
    );
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      'Failed to update task status',
      ErrorCode.INTERNAL_ERROR,
      500
    );
  }
}

export const PATCH = withApiHandler(handlePatch, { rateLimit: 'moderate' });
