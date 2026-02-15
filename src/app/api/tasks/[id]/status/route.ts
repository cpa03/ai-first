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
import { API_ROUTE_CONFIG } from '@/lib/config/constants';

const { TASK_STATUSES, COMPLETION_PERCENTAGES } = API_ROUTE_CONFIG;
type TaskStatus = (typeof TASK_STATUSES)[number];

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
  if (!TASK_STATUSES.includes(body.status)) {
    return badRequestResponse(
      `Invalid status. Must be one of: ${TASK_STATUSES.join(', ')}`
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
        ? COMPLETION_PERCENTAGES.COMPLETED
        : body.status === 'in_progress'
          ? COMPLETION_PERCENTAGES.IN_PROGRESS
          : COMPLETION_PERCENTAGES.TODO;

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
