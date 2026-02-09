import {
  withApiHandler,
  standardSuccessResponse,
  notFoundResponse,
  ApiContext,
} from '@/lib/api-handler';
import { dbService } from '@/lib/db';
import { AppError, ErrorCode } from '@/lib/errors';
import { requireAuth, verifyResourceOwnership } from '@/lib/auth';

async function handleGet(context: ApiContext) {
  const { request } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;
  const ideaId = pathname.split('/')[3];

  if (!ideaId) {
    throw new AppError('Idea ID is required', ErrorCode.VALIDATION_ERROR, 400);
  }

  try {
    // Authenticate user
    const user = await requireAuth(request);

    // Verify idea exists and user owns it
    const idea = await dbService.getIdea(ideaId);
    if (!idea) {
      return notFoundResponse('Idea not found');
    }

    verifyResourceOwnership(user.id, idea.user_id, 'idea');

    const deliverablesWithTasks =
      await dbService.getIdeaDeliverablesWithTasks(ideaId);

    if (!deliverablesWithTasks || deliverablesWithTasks.length === 0) {
      return notFoundResponse('No deliverables found for this idea');
    }

    // Calculate overall progress
    let totalTasks = 0;
    let completedTasks = 0;
    let totalHours = 0;
    let completedHours = 0;

    const deliverables = deliverablesWithTasks.map((deliverable) => {
      const tasks = deliverable.tasks || [];
      totalTasks += tasks.length;
      completedTasks += tasks.filter((t) => t.status === 'completed').length;

      tasks.forEach((t) => {
        const est = Number(t.estimate) || 0;
        totalHours += est;
        if (t.status === 'completed') {
          completedHours += est;
        }
      });

      const deliverableCompleted = tasks.filter(
        (t) => t.status === 'completed'
      ).length;
      const deliverableProgress =
        tasks.length > 0 ? (deliverableCompleted / tasks.length) * 100 : 0;

      return {
        ...deliverable,
        progress: Math.round(deliverableProgress),
        completedCount: deliverableCompleted,
        totalCount: tasks.length,
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
      200,
      context.rateLimit
    );
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch tasks', ErrorCode.INTERNAL_ERROR, 500);
  }
}

export const GET = withApiHandler(handleGet, { rateLimit: 'lenient' });
