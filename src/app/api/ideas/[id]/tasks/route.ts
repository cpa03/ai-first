import {
  withApiHandler,
  standardSuccessResponse,
  ApiContext,
} from '@/lib/api-handler';
import { dbService } from '@/lib/db';
import { AppError, ErrorCode } from '@/lib/errors';
import { requireAuth, verifyResourceOwnership } from '@/lib/auth';
import { API_ERROR_MESSAGES } from '@/lib/config/error-messages';
import { STATUS_CODES } from '@/lib/config/constants';
import { IDEA_STATUS_CONFIG } from '@/lib/config';

async function handleGet(context: ApiContext) {
  const { request, params } = context;

  // PERFORMANCE: Use context.params.id for faster access
  // instead of manual URL parsing and segment extraction.
  const ideaId = params.id;

  if (!ideaId) {
    throw new AppError(
      API_ERROR_MESSAGES.VALIDATION.IDEA_ID_REQUIRED,
      ErrorCode.VALIDATION_ERROR,
      STATUS_CODES.BAD_REQUEST
    );
  }

  try {
    // Authenticate user
    const user = await requireAuth(request);

    // Verify idea exists and user owns it
    const idea = await dbService.getIdea(ideaId);
    if (!idea) {
      throw new AppError(
        API_ERROR_MESSAGES.NOT_FOUND.IDEA,
        ErrorCode.NOT_FOUND,
        STATUS_CODES.NOT_FOUND
      );
    }

    verifyResourceOwnership(user.id, idea.user_id, 'idea');

    const deliverablesWithTasks =
      await dbService.getIdeaDeliverablesWithTasks(ideaId);

    if (!deliverablesWithTasks || deliverablesWithTasks.length === 0) {
      throw new AppError(
        API_ERROR_MESSAGES.DELIVERABLE.NO_DELIVERABLES_FOUND,
        ErrorCode.NOT_FOUND,
        STATUS_CODES.NOT_FOUND
      );
    }

    // PERFORMANCE: Use a single pass over deliverables and tasks to calculate all stats
    // This reduces complexity from O(3N) to O(N) where N is the number of tasks.
    let totalTasks = 0;
    let completedTasks = 0;
    let totalHours = 0;
    let completedHours = 0;

    const deliverables = deliverablesWithTasks.map((deliverable) => {
      const tasks = deliverable.tasks || [];
      let deliverableCompleted = 0;
      let deliverableTotalHours = 0;
      let deliverableCompletedHours = 0;

      tasks.forEach((t) => {
        const est = Number(t.estimate) || 0;
        deliverableTotalHours += est;
        if (t.status === IDEA_STATUS_CONFIG.TYPES.COMPLETED) {
          deliverableCompleted++;
          deliverableCompletedHours += est;
        }
      });

      totalTasks += tasks.length;
      completedTasks += deliverableCompleted;
      totalHours += deliverableTotalHours;
      completedHours += deliverableCompletedHours;

      // Round deliverable hours to 1 decimal place for the response
      const dTotalHours = Math.round(deliverableTotalHours * 10) / 10;
      const dCompletedHours = Math.round(deliverableCompletedHours * 10) / 10;

      const deliverableProgress =
        tasks.length > 0 ? (deliverableCompleted / tasks.length) * 100 : 0;

      return {
        ...deliverable,
        progress: Math.round(deliverableProgress),
        completedCount: deliverableCompleted,
        totalCount: tasks.length,
        totalHours: dTotalHours,
        completedHours: dCompletedHours,
      };
    });

    const overallProgress =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return standardSuccessResponse(
      {
        ideaId,
        deliverables,
        summary: {
          totalDeliverables: deliverables.length,
          totalTasks,
          completedTasks,
          totalHours: Math.round(totalHours * 10) / 10,
          completedHours: Math.round(completedHours * 10) / 10,
          overallProgress: Math.round(overallProgress),
        },
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
      API_ERROR_MESSAGES.INTERNAL.FETCH_TASKS_FAILED,
      ErrorCode.INTERNAL_ERROR,
      STATUS_CODES.INTERNAL_ERROR
    );
  }
}

export const GET = withApiHandler(handleGet, { rateLimit: 'lenient' });
