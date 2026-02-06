import {
  withApiHandler,
  ApiContext,
  standardSuccessResponse,
} from '@/lib/api-handler';
import { ValidationError } from '@/lib/errors';
import { dbService } from '@/lib/db';

async function handleGet(context: ApiContext) {
  const { request } = context;

  const url = new URL(request.url);
  const taskId = url.pathname.split('/').at(-2);

  if (!taskId) {
    throw new ValidationError([
      { field: 'id', message: 'Task ID is required' },
    ]);
  }

  const task = await dbService.getTask(taskId);

  if (!task) {
    return standardSuccessResponse(null, context.requestId, 404);
  }

  return standardSuccessResponse(
    {
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
    },
    context.requestId
  );
}

async function handlePatch(context: ApiContext) {
  const { request } = context;

  const url = new URL(request.url);
  const taskId = url.pathname.split('/').at(-2);

  if (!taskId) {
    throw new ValidationError([
      { field: 'id', message: 'Task ID is required' },
    ]);
  }

  const body = await request.json();
  const {
    title,
    description,
    assignee,
    status,
    estimate,
    startDate,
    endDate,
    actualHours,
    completionPercentage,
    priorityScore,
    complexityScore,
    riskLevel,
    tags,
    customFields,
    milestoneId,
  } = body;

  const existingTask = await dbService.getTask(taskId);
  if (!existingTask) {
    return standardSuccessResponse(null, context.requestId, 404);
  }

  const updates: {
    title?: string;
    description?: string;
    assignee?: string;
    status?: 'todo' | 'in_progress' | 'completed';
    estimate?: number;
    start_date?: string | null;
    end_date?: string | null;
    actual_hours?: number | null;
    completion_percentage?: number;
    priority_score?: number;
    complexity_score?: number;
    risk_level?: 'low' | 'medium' | 'high';
    tags?: string[] | null;
    custom_fields?: Record<string, unknown> | null;
    milestone_id?: string | null;
    updated_at?: string;
  } = {
    updated_at: new Date().toISOString(),
  };

  if (title !== undefined) {
    updates.title = title.trim();
  }

  if (description !== undefined) {
    updates.description = description;
  }

  if (assignee !== undefined) {
    updates.assignee = assignee;
  }

  if (status !== undefined) {
    const validStatuses = ['todo', 'in_progress', 'completed'];
    if (validStatuses.includes(status)) {
      updates.status = status;
    }
  }

  if (estimate !== undefined) {
    updates.estimate = estimate;
  }

  if (startDate !== undefined) {
    updates.start_date = startDate;
  }

  if (endDate !== undefined) {
    updates.end_date = endDate;
  }

  if (actualHours !== undefined) {
    updates.actual_hours = actualHours;
  }

  if (completionPercentage !== undefined) {
    updates.completion_percentage = completionPercentage;
  }

  if (priorityScore !== undefined) {
    updates.priority_score = priorityScore;
  }

  if (complexityScore !== undefined) {
    updates.complexity_score = complexityScore;
  }

  if (riskLevel !== undefined) {
    const validRiskLevels = ['low', 'medium', 'high'];
    if (validRiskLevels.includes(riskLevel)) {
      updates.risk_level = riskLevel;
    }
  }

  if (tags !== undefined) {
    updates.tags = tags;
  }

  if (customFields !== undefined) {
    updates.custom_fields = customFields;
  }

  if (milestoneId !== undefined) {
    updates.milestone_id = milestoneId;
  }

  const updatedTask = await dbService.updateTask(taskId, updates);

  return standardSuccessResponse(
    {
      id: updatedTask.id,
      deliverableId: updatedTask.deliverable_id,
      title: updatedTask.title,
      description: updatedTask.description,
      assignee: updatedTask.assignee,
      status: updatedTask.status,
      estimate: updatedTask.estimate,
      startDate: updatedTask.start_date,
      endDate: updatedTask.end_date,
      actualHours: updatedTask.actual_hours,
      completionPercentage: updatedTask.completion_percentage,
      priorityScore: updatedTask.priority_score,
      complexityScore: updatedTask.complexity_score,
      riskLevel: updatedTask.risk_level,
      tags: updatedTask.tags,
      customFields: updatedTask.custom_fields,
      milestoneId: updatedTask.milestone_id,
      createdAt: updatedTask.created_at,
      updatedAt: updatedTask.updated_at,
    },
    context.requestId
  );
}

async function handleDelete(context: ApiContext) {
  const { request } = context;

  const url = new URL(request.url);
  const taskId = url.pathname.split('/').at(-2);

  if (!taskId) {
    throw new ValidationError([
      { field: 'id', message: 'Task ID is required' },
    ]);
  }

  const existingTask = await dbService.getTask(taskId);
  if (!existingTask) {
    return standardSuccessResponse(null, context.requestId, 404);
  }

  await dbService.softDeleteTask(taskId);

  return standardSuccessResponse(
    {
      message: 'Task deleted successfully',
      id: taskId,
    },
    context.requestId
  );
}

export const GET = withApiHandler(handleGet, { rateLimit: 'moderate' });
export const PATCH = withApiHandler(handlePatch, { rateLimit: 'moderate' });
export const DELETE = withApiHandler(handleDelete, { rateLimit: 'moderate' });
