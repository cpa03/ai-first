import { createLogger } from '@/lib/logger';
import {
  IdeaAnalysis,
  TaskDecomposition,
  DependencyGraph,
  Timeline,
} from '../breakdown-engine';

const logger = createLogger('TimelineGenerator');

const HOURS_PER_WEEK = 40;
const MILLISECONDS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
const PHASE_PLANNING_RATIO = 0.2;
const PHASE_DEVELOPMENT_RATIO = 0.8;

export class TimelineGenerator {
  generateTimeline(
    analysis: IdeaAnalysis,
    tasks: TaskDecomposition,
    dependencies: DependencyGraph,
    options: {
      complexity?: 'simple' | 'medium' | 'complex';
      teamSize?: number;
      timelineWeeks?: number;
      constraints?: string[];
    }
  ): Timeline {
    const startDate = new Date();
    const totalWeeks = Math.ceil(
      tasks.totalEstimatedHours / (HOURS_PER_WEEK * (options.teamSize || 1))
    );
    const endDate = new Date(
      startDate.getTime() + totalWeeks * MILLISECONDS_PER_WEEK
    );

    const milestones = this.generateMilestones(analysis, startDate, totalWeeks);
    const phases = this.generatePhases(analysis, tasks, startDate, totalWeeks);

    return {
      startDate,
      endDate,
      totalWeeks,
      milestones,
      phases,
      criticalPath: dependencies.criticalPath,
      resourceAllocation: { default: options.teamSize || 1 },
    };
  }

  private generateMilestones(
    analysis: IdeaAnalysis,
    startDate: Date,
    totalWeeks: number
  ): Array<{
    id: string;
    title: string;
    date: Date;
    dependencies: string[];
  }> {
    return analysis.deliverables.map((deliverable, index) => ({
      id: `m_${index + 1}`,
      title: deliverable.title,
      date: new Date(
        startDate.getTime() +
          (index + 1) *
            (totalWeeks / analysis.deliverables.length) *
            MILLISECONDS_PER_WEEK
      ),
      dependencies: [] as string[],
    }));
  }

  private generatePhases(
    analysis: IdeaAnalysis,
    tasks: TaskDecomposition,
    startDate: Date,
    totalWeeks: number
  ): Array<{
    name: string;
    startDate: Date;
    endDate: Date;
    tasks: string[];
    deliverables: string[];
  }> {
    return [
      {
        name: 'Planning & Design',
        startDate,
        endDate: new Date(
          startDate.getTime() +
            totalWeeks * PHASE_PLANNING_RATIO * MILLISECONDS_PER_WEEK
        ),
        tasks: tasks.tasks
          .slice(0, Math.ceil(tasks.tasks.length * PHASE_PLANNING_RATIO))
          .map((t) => t.id),
        deliverables: analysis.deliverables.slice(0, 1).map((d) => d.title),
      },
      {
        name: 'Development',
        startDate: new Date(
          startDate.getTime() +
            totalWeeks * PHASE_PLANNING_RATIO * MILLISECONDS_PER_WEEK
        ),
        endDate: new Date(
          startDate.getTime() +
            totalWeeks * PHASE_DEVELOPMENT_RATIO * MILLISECONDS_PER_WEEK
        ),
        tasks: tasks.tasks
          .slice(
            Math.ceil(tasks.tasks.length * PHASE_PLANNING_RATIO),
            Math.ceil(tasks.tasks.length * PHASE_DEVELOPMENT_RATIO)
          )
          .map((t) => t.id),
        deliverables: analysis.deliverables.slice(1, -1).map((d) => d.title),
      },
      {
        name: 'Testing & Deployment',
        startDate: new Date(
          startDate.getTime() +
            totalWeeks * PHASE_DEVELOPMENT_RATIO * MILLISECONDS_PER_WEEK
        ),
        endDate: new Date(
          startDate.getTime() + totalWeeks * MILLISECONDS_PER_WEEK
        ),
        tasks: tasks.tasks
          .slice(Math.ceil(tasks.tasks.length * PHASE_DEVELOPMENT_RATIO))
          .map((t) => t.id),
        deliverables: analysis.deliverables.slice(-1).map((d) => d.title),
      },
    ];
  }
}
