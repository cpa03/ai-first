import { AIModelConfig } from '@/lib/ai';
import { promptService } from '@/lib/prompt-service';
import { safeJsonParse, isArrayOf, isTask } from '@/lib/validation';
import { createLogger } from '@/lib/logger';
import { IdeaAnalysis, TaskDecomposition } from '../breakdown-engine';

const logger = createLogger('TaskDecomposer');

export interface TaskDecomposerConfig {
  aiConfig: AIModelConfig;
}

export class TaskDecomposer {
  constructor(private config: TaskDecomposerConfig) {}

  async decomposeTasks(analysis: IdeaAnalysis): Promise<TaskDecomposition> {
    const tasks: TaskDecomposition['tasks'] = [];
    let totalHours = 0;

    for (const deliverable of analysis.deliverables) {
      const prompt = promptService.getUserPrompt(
        'breakdown',
        'decompose-tasks',
        {
          deliverableTitle: deliverable.title,
          deliverableDescription: deliverable.description,
          deliverablePriority: deliverable.priority,
          deliverableEstimatedHours: deliverable.estimatedHours,
        }
      );

      try {
        const messages = [
          {
            role: 'system' as const,
            content: promptService.getSystemPrompt(
              'breakdown',
              'decompose-tasks'
            ),
          },
          { role: 'user' as const, content: prompt },
        ];

        const { aiService } = await import('@/lib/ai');
        const response = await aiService.callModel(
          messages,
          this.config.aiConfig
        );
        const deliverableTasks = safeJsonParse<TaskDecomposition['tasks'][0][]>(
          response,
          [],
          (data): data is TaskDecomposition['tasks'][0][] =>
            isArrayOf(data, isTask)
        );

        deliverableTasks.forEach((task: any) => {
          task.deliverableId = deliverable.title;
          tasks.push(task);
          totalHours += task.estimatedHours;
        });
      } catch (error) {
        logger.error(
          `Failed to decompose deliverable: ${deliverable.title}`,
          error
        );
        tasks.push({
          id: `t_${tasks.length + 1}`,
          title: `Complete ${deliverable.title}`,
          description: deliverable.description,
          estimatedHours: deliverable.estimatedHours,
          complexity: 5,
          requiredSkills: ['General'],
          dependencies: [],
          deliverableId: deliverable.title,
        });
        totalHours += deliverable.estimatedHours;
      }
    }

    return {
      tasks,
      totalEstimatedHours: totalHours,
      confidence: analysis.overallConfidence * 0.9,
    };
  }
}
