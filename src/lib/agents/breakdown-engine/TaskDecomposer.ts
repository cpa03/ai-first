import { AIModelConfig, aiService } from '@/lib/ai';
import { promptService } from '@/lib/prompt-service';
import { safeJsonParse } from '@/lib/validation';
import { isArrayOf, isTask } from '@/lib/type-guards';
import { createLogger } from '@/lib/logger';
import { IdeaAnalysis, TaskDecomposition } from '../breakdown-engine';

const logger = createLogger('TaskDecomposer');

export interface TaskDecomposerConfig {
  aiConfig: AIModelConfig;
  aiService?: typeof aiService;
}

export class TaskDecomposer {
  private readonly injectedAiService: typeof aiService;

  constructor(private config: TaskDecomposerConfig) {
    this.injectedAiService = config.aiService || aiService;
  }

  async decomposeTasks(analysis: IdeaAnalysis): Promise<TaskDecomposition> {
    const decompositionPromises = analysis.deliverables.map(
      async (deliverable) => {
        const prompt = await promptService.getUserPrompt(
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
          const systemPrompt = await promptService.getSystemPrompt(
            'breakdown',
            'decompose-tasks'
          );
          const messages = [
            {
              role: 'system' as const,
              content: systemPrompt,
            },
            { role: 'user' as const, content: prompt },
          ];

          const response = await this.injectedAiService.callModel(
            messages,
            this.config.aiConfig
          );
          const deliverableTasks = safeJsonParse<
            TaskDecomposition['tasks'][0][]
          >(response, [], (data): data is TaskDecomposition['tasks'][0][] =>
            isArrayOf(data, isTask)
          );

          deliverableTasks.forEach((task: TaskDecomposition['tasks'][0]) => {
            task.deliverableId = deliverable.title;
          });

          const tasksTotalHours = deliverableTasks.reduce(
            (sum, task) => sum + task.estimatedHours,
            0
          );
          return {
            tasks: deliverableTasks,
            totalHours: tasksTotalHours,
            success: true,
          };
        } catch (error) {
          logger.error(
            `Failed to decompose deliverable: ${deliverable.title}`,
            error
          );
          const fallbackTask = {
            id: '',
            title: `Complete ${deliverable.title}`,
            description: deliverable.description,
            estimatedHours: deliverable.estimatedHours,
            complexity: 5,
            requiredSkills: ['General'],
            dependencies: [],
            deliverableId: deliverable.title,
          };
          return {
            tasks: [fallbackTask],
            totalHours: deliverable.estimatedHours,
            success: false,
          };
        }
      }
    );

    const results = await Promise.all(decompositionPromises);

    const tasks: TaskDecomposition['tasks'] = [];
    let totalHours = 0;

    results.forEach((result, _index) => {
      result.tasks.forEach(
        (task: TaskDecomposition['tasks'][0], _taskIndex: number) => {
          if (task.id === '') {
            task.id = `t_${tasks.length + 1}`;
          }
          tasks.push(task);
        }
      );
      totalHours += result.totalHours;
    });

    return {
      tasks,
      totalEstimatedHours: totalHours,
      confidence: analysis.overallConfidence * 0.9,
    };
  }
}
