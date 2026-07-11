import {
  withApiHandler,
  standardSuccessResponse,
  ApiContext,
} from '@/lib/api-handler';
import { dbService } from '@/lib/db';
import { sanitizeHtml } from '@/lib/validation';
import { AppError, ErrorCode, ValidationError } from '@/lib/errors';
import { requireAuth, verifyResourceOwnership } from '@/lib/auth';
import { TASK_VALIDATION, STATUS_CODES } from '@/lib/config/constants';
import { API_ERROR_MESSAGES } from '@/lib/config/error-messages';
import { TASK_CONFIG } from '@/lib/config';
import { RESOURCE_TYPES } from '@/lib/config/modular-constants';

const VALID_STATUSES = TASK_CONFIG.VALID_STATUSES;
type TaskStatus = (typeof VALID_STATUSES)[number];

const VALID_RISK_LEVELS = TASK_CONFIG.VALID_RISK_LEVELS;

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
    throw new ValidationError([
      {
        field: 'deliverableId',
        message: API_ERROR_MESSAGES.ROUTE_VALIDATION.DELIVERABLE_ID_REQUIRED,
      },
    ]);
  }

  let body: CreateTaskBody;
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
  if (!body.title || body.title.trim().length === 0) {
    throw new ValidationError([
      {
        field: 'title',
        message: API_ERROR_MESSAGES.ROUTE_VALIDATION.TITLE_REQUIRED,
      },
    ]);
  }

  if (body.title.length > TASK_VALIDATION.MAX_TITLE_LENGTH) {
    throw new ValidationError([
      {
        field: 'title',
        message: `Task title must be less than ${TASK_VALIDATION.MAX_TITLE_LENGTH} characters`,
      },
    ]);
  }

  // Validate status if provided
  if (body.status && !VALID_STATUSES.includes(body.status)) {
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

  // Validate risk_level if provided
  if (body.risk_level && !VALID_RISK_LEVELS.includes(body.risk_level)) {
    throw new ValidationError([
      {
        field: 'risk_level',
        message:
          API_ERROR_MESSAGES.VALIDATION.INVALID_RISK_LEVEL_WITH_VALUES(
            VALID_RISK_LEVELS
          ),
      },
    ]);
  }

  // Validate estimate if provided
  if (body.estimate !== undefined) {
    if (typeof body.estimate !== 'number' || body.estimate < 0) {
      throw new ValidationError([
        {
          field: 'estimate',
          message: API_ERROR_MESSAGES.VALIDATION.INVALID_ESTIMATE,
        },
      ]);
    }
  }

  try {
    // Authenticate user
    const user = await requireAuth(request);

    // Get deliverable with idea to verify ownership
    const deliverableWithIdea =
      await dbService.getDeliverableWithIdea(deliverableId);

    if (!deliverableWithIdea) {
      throw new AppError(
        API_ERROR_MESSAGES.NOT_FOUND.DELIVERABLE,
        ErrorCode.NOT_FOUND,
        STATUS_CODES.NOT_FOUND
      );
    }

    // Verify ownership
    verifyResourceOwnership(
      user.id,
      deliverableWithIdea.idea.user_id,
      RESOURCE_TYPES.DELIVERABLE
    );

    const newTask = await dbService.createTask({
      deliverable_id: deliverableId,
      title: sanitizeHtml(body.title.trim()),
      description: body.description
        ? sanitizeHtml(body.description)
        : body.description,
      status: body.status || TASK_CONFIG.STATUSES.TODO,
      assignee: body.assignee ? sanitizeHtml(body.assignee) : body.assignee,
      estimate: body.estimate || TASK_CONFIG.DEFAULTS.ESTIMATE,
      start_date: null,
      end_date: null,
      actual_hours: null,
      completion_percentage: TASK_CONFIG.DEFAULTS.COMPLETION_PERCENTAGE,
      priority_score: TASK_CONFIG.DEFAULTS.PRIORITY_SCORE,
      complexity_score: TASK_CONFIG.DEFAULTS.COMPLEXITY_SCORE,
      risk_level: body.risk_level || TASK_CONFIG.DEFAULTS.RISK_LEVEL,
      tags: body.tags ? body.tags.map((tag) => sanitizeHtml(tag)) : null,
      custom_fields: null,
      milestone_id: null,
    });

    return standardSuccessResponse(
      {
        task: newTask,
        message: API_ERROR_MESSAGES.ROUTE_SUCCESS.TASK_CREATED,
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
