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
import { TASK_VALIDATION } from '@/lib/config/constants';

// Valid task statuses
const VALID_STATUSES = ['todo', 'in_progress', 'completed'] as const;
type TaskStatus = (typeof VALID_STATUSES)[number];

// Valid risk levels
const VALID_RISK_LEVELS = ['low', 'medium', 'high'] as const;

interface CreateTaskBody {
  title: string;
  description?: string;
  status?: TaskStatus;
  assignee?: string;
  estimate?: number;
  risk_level?: (typeof VALID_RISK_LEVELS)[number];
  tags?: string[];
}

async function handlePost(context: ApiContext) {
  const { request } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;
  const deliverableId = pathname.split('/')[3];

  if (!deliverableId) {
    return badRequestResponse('Deliverable ID is required');
  }

  let body: CreateTaskBody;
  try {
    body = await request.json();
  } catch {
    return badRequestResponse('Invalid JSON body');
  }

  // Validate required fields
  if (!body.title || body.title.trim().length === 0) {
    return badRequestResponse('Task title is required');
  }

  if (body.title.length > TASK_VALIDATION.MAX_TITLE_LENGTH) {
    return badRequestResponse(
      `Task title must be less than ${TASK_VALIDATION.MAX_TITLE_LENGTH} characters`
    );
  }

  // Validate status if provided
  if (body.status && !VALID_STATUSES.includes(body.status)) {
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

  try {
    // Authenticate user
    const user = await requireAuth(request);

    // Get deliverable with idea to verify ownership
    const deliverableWithIdea =
      await dbService.getDeliverableWithIdea(deliverableId);

    if (!deliverableWithIdea) {
      return notFoundResponse('Deliverable not found');
    }

    // Verify ownership
    verifyResourceOwnership(
      user.id,
      deliverableWithIdea.idea.user_id,
      'deliverable'
    );

    const newTask = await dbService.createTask({
      deliverable_id: deliverableId,
      title: body.title.trim(),
      description: body.description,
      status: body.status || 'todo',
      assignee: body.assignee,
      estimate: body.estimate || 0,
      start_date: null,
      end_date: null,
      actual_hours: null,
      completion_percentage: 0,
      priority_score: 0,
      complexity_score: 0,
      risk_level: body.risk_level || 'low',
      tags: body.tags || null,
      custom_fields: null,
      milestone_id: null,
    });

    return standardSuccessResponse(
      {
        task: newTask,
        message: 'Task created successfully',
      },
      context.requestId,
      201,
      context.rateLimit
    );
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to create task', ErrorCode.INTERNAL_ERROR, 500);
  }
}

export const POST = withApiHandler(handlePost, { rateLimit: 'moderate' });
