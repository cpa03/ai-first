import { dbService } from '@/lib/db';
import { ValidationError } from '@/lib/errors';
import {
  withApiHandler,
  standardSuccessResponse,
  ApiContext,
} from '@/lib/api-handler';

async function handleGet(context: ApiContext) {
  const { request } = context;
  const url = new URL(request.url);

  const deliverableId = url.searchParams.get('deliverableId');
  const status = url.searchParams.get('status');
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);

  if (!deliverableId) {
    throw new ValidationError([
      { field: 'deliverableId', message: 'deliverableId is required' },
    ]);
  }

  let tasks = await dbService.getDeliverableTasks(deliverableId);

  if (status && status !== 'all') {
    tasks = tasks.filter((task) => task.status === status);
  }

  const total = tasks.length;
  const paginatedTasks = tasks.slice(offset, offset + limit);

  const formattedTasks = paginatedTasks.map((task) => ({
    id: task.id,
    deliverableId: task.deliverable_id,
    title: task.title,
    description: task.description,
    assignee: task.assignee,
    status: task.status,
    estimate: task.estimate,
    startDate: task.start_date,
    endDate: task.end_date,
    actualHours: task.actual_hours,
    completionPercentage: task.completion_percentage,
    priorityScore: task.priority_score,
    complexityScore: task.complexity_score,
    riskLevel: task.risk_level,
    tags: task.tags,
    customFields: task.custom_fields,
    milestoneId: task.milestone_id,
    createdAt: task.created_at,
  }));

  return standardSuccessResponse(
    {
      tasks: formattedTasks,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    },
    context.requestId
  );
}

async function handlePost(context: ApiContext) {
  const { request } = context;
  const body = await request.json();

  const {
    deliverableId,
    title,
    description,
    assignee,
    status,
    estimate,
    startDate,
    endDate,
    tags,
    customFields,
    milestoneId,
  } = body;

  if (!deliverableId) {
    throw new ValidationError([
      { field: 'deliverableId', message: 'deliverableId is required' },
    ]);
  }

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw new ValidationError([
      {
        field: 'title',
        message: 'title is required and must be a non-empty string',
      },
    ]);
  }

  const validStatuses = ['todo', 'in_progress', 'completed'];
  const taskStatus = status && validStatuses.includes(status) ? status : 'todo';

  const newTask = {
    deliverable_id: deliverableId,
    title: title.trim(),
    description: description || null,
    assignee: assignee || null,
    status: taskStatus as 'todo' | 'in_progress' | 'completed',
    estimate: estimate || 0,
    start_date: startDate || null,
    end_date: endDate || null,
    actual_hours: null,
    completion_percentage: 0,
    priority_score: 0,
    complexity_score: 1,
    risk_level: 'low' as 'low' | 'medium' | 'high',
    tags: tags || null,
    custom_fields: customFields || null,
    milestone_id: milestoneId || null,
    deleted_at: null,
  };

  const savedTask = await dbService.createTask(newTask);

  return standardSuccessResponse(
    {
      id: savedTask.id,
      deliverableId: savedTask.deliverable_id,
      title: savedTask.title,
      description: savedTask.description,
      assignee: savedTask.assignee,
      status: savedTask.status,
      estimate: savedTask.estimate,
      createdAt: savedTask.created_at,
    },
    context.requestId,
    201
  );
}

export const GET = withApiHandler(handleGet, { rateLimit: 'lenient' });
export const POST = withApiHandler(handlePost, { rateLimit: 'moderate' });
