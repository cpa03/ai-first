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
import { TASK_VALIDATION, STATUS_CODES } from '@/lib/config/constants';
import { API_ERROR_MESSAGES } from '@/lib/config/error-messages';
import { TASK_CONFIG } from '@/lib/config';

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
  const segments = url.pathname.split('/').filter(Boolean);
  const deliverableId = segments.at(-2);

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
      status: body.status || TASK_CONFIG.STATUSES.TODO,
      assignee: body.assignee,
      estimate: body.estimate || TASK_CONFIG.DEFAULTS.ESTIMATE,
      start_date: null,
      end_date: null,
      actual_hours: null,
      completion_percentage: TASK_CONFIG.DEFAULTS.COMPLETION_PERCENTAGE,
      priority_score: TASK_CONFIG.DEFAULTS.PRIORITY_SCORE,
      complexity_score: TASK_CONFIG.DEFAULTS.COMPLEXITY_SCORE,
      risk_level: body.risk_level || TASK_CONFIG.DEFAULTS.RISK_LEVEL,
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
      STATUS_CODES.CREATED,
      context.rateLimit
    );
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      API_ERROR_MESSAGES.INTERNAL.CREATE_TASK_FAILED,
      ErrorCode.INTERNAL_ERROR,
      STATUS_CODES.INTERNAL_ERROR
    );
  }
}

export const POST = withApiHandler(handlePost, { rateLimit: 'moderate' });
