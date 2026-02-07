import { aiService, AIModelConfig } from '@/lib/ai';
import { dbService } from '@/lib/db';
import { configurationService, AgentConfig } from '@/lib/config-service';
import { createLogger } from '@/lib/logger';
import {
  IdeaAnalyzer,
  TaskDecomposer,
  DependencyAnalyzer,
  TimelineGenerator,
  SessionManager,
  ConfidenceCalculator,
} from './breakdown-engine/index';

const _logger = createLogger('BreakdownEngine');

export interface BreakdownConfig extends AgentConfig {
  estimation_model: string;
  dependency_threshold: number;
}

export interface IdeaAnalysis {
  objectives: Array<{
    title: string;
    description: string;
    confidence: number;
  }>;
  deliverables: Array<{
    title: string;
    description: string;
    priority: number;
    estimatedHours: number;
    confidence: number;
  }>;
  complexity: {
    score: number;
    factors: string[];
    level: 'simple' | 'medium' | 'complex';
  };
  scope: {
    size: 'small' | 'medium' | 'large';
    estimatedWeeks: number;
    teamSize: number;
  };
  riskFactors: Array<{
    factor: string;
    impact: 'low' | 'medium' | 'high';
    probability: number;
  }>;
  successCriteria: string[];
  overallConfidence: number;
}

export interface TaskDecomposition {
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    estimatedHours: number;
    complexity: number;
    requiredSkills: string[];
    dependencies: string[];
    deliverableId: string;
  }>;
  totalEstimatedHours: number;
  confidence: number;
}

export interface DependencyGraph {
  nodes: Array<{
    id: string;
    title: string;
    type: 'task' | 'deliverable' | 'milestone';
    estimatedHours?: number;
  }>;
  edges: Array<{
    from: string;
    to: string;
    type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish';
    lag: number;
  }>;
  criticalPath: string[];
}

export interface Timeline {
  startDate: Date;
  endDate: Date;
  totalWeeks: number;
  milestones: Array<{
    id: string;
    title: string;
    date: Date;
    dependencies: string[];
  }>;
  phases: Array<{
    name: string;
    startDate: Date;
    endDate: Date;
    tasks: string[];
    deliverables: string[];
  }>;
  criticalPath: string[];
  resourceAllocation: Record<string, number>;
}

export interface BreakdownSession {
  id: string;
  ideaId: string;
  analysis: IdeaAnalysis | null;
  tasks: TaskDecomposition | null;
  dependencies: DependencyGraph | null;
  timeline: Timeline | null;
  status: 'analyzing' | 'decomposing' | 'scheduling' | 'completed' | 'failed';
  confidence: number;
  processingTime: number;
  createdAt: Date;
  updatedAt: Date;
}

class BreakdownEngine {
  private config: BreakdownConfig | null = null;
  private aiConfig: AIModelConfig | null = null;

  private ideaAnalyzer?: IdeaAnalyzer;
  private taskDecomposer?: TaskDecomposer;
  private dependencyAnalyzer?: DependencyAnalyzer;
  private timelineGenerator?: TimelineGenerator;
  private sessionManager?: SessionManager;
  private confidenceCalculator?: ConfidenceCalculator;

  async initialize(): Promise<void> {
    this.config =
      await configurationService.loadAgentConfig<BreakdownConfig>(
        'breakdown-engine'
      );
    this.aiConfig =
      await configurationService.loadAIModelConfig('breakdown-engine');

    if (!this.aiConfig) {
      throw new Error('AI configuration not loaded');
    }
    await aiService.initialize(this.aiConfig);
    if (!this.aiConfig) {
      throw new Error('AI configuration not loaded');
    }
    await aiService.initialize(this.aiConfig);

    this.ideaAnalyzer = new IdeaAnalyzer({
      aiConfig: this.aiConfig,
      aiService,
    });
    this.taskDecomposer = new TaskDecomposer({
      aiConfig: this.aiConfig,
      aiService,
    });
    this.dependencyAnalyzer = new DependencyAnalyzer();
    this.timelineGenerator = new TimelineGenerator();
    this.sessionManager = new SessionManager();
    this.confidenceCalculator = new ConfidenceCalculator();
  }

  async startBreakdown(
    ideaId: string,
    refinedIdea: string,
    userResponses: Record<string, string>,
    options: {
      complexity?: 'simple' | 'medium' | 'complex';
      teamSize?: number;
      timelineWeeks?: number;
      constraints?: string[];
    } = {}
  ): Promise<BreakdownSession> {
    const startTime = Date.now();

    if (
      !this.ideaAnalyzer ||
      !this.taskDecomposer ||
      !this.dependencyAnalyzer ||
      !this.timelineGenerator ||
      !this.sessionManager ||
      !this.confidenceCalculator
    ) {
      throw new Error(
        'BreakdownEngine not initialized. Call initialize() first.'
      );
    }

    try {
      await dbService.logAgentAction('breakdown-engine', 'start-breakdown', {
        ideaId,
        options,
      });

      const session: BreakdownSession = {
        id: `bd_${Date.now()}`,
        ideaId,
        analysis: null,
        tasks: null,
        dependencies: null,
        timeline: null,
        status: 'analyzing',
        confidence: 0,
        processingTime: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.sessionManager.storeSession(session);

      session.analysis = await this.ideaAnalyzer.analyzeIdea(
        refinedIdea,
        userResponses,
        options
      );
      session.status = 'decomposing';
      session.updatedAt = new Date();
      await this.sessionManager.storeSession(session);

      session.tasks = await this.taskDecomposer.decomposeTasks(
        session.analysis
      );
      session.status = 'scheduling';
      session.updatedAt = new Date();
      await this.sessionManager.storeSession(session);

      session.dependencies = await this.dependencyAnalyzer.analyzeDependencies(
        session.tasks
      );
      session.updatedAt = new Date();
      await this.sessionManager.storeSession(session);

      session.timeline = await this.timelineGenerator.generateTimeline(
        session.analysis,
        session.tasks,
        session.dependencies,
        options
      );
      session.status = 'completed';
      session.confidence =
        this.confidenceCalculator.calculateOverallConfidence(session);
      session.processingTime = Date.now() - startTime;
      session.updatedAt = new Date();
      await this.sessionManager.storeSession(session);

      await this.sessionManager.persistResults(session);

      await dbService.logAgentAction(
        'breakdown-engine',
        'breakdown-completed',
        {
          ideaId,
          sessionId: session.id,
          processingTime: session.processingTime,
          confidence: session.confidence,
        }
      );

      return session;
    } catch (error) {
      await dbService.logAgentAction('breakdown-engine', 'breakdown-error', {
        ideaId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async getBreakdownSession(ideaId: string): Promise<BreakdownSession | null> {
    if (!this.sessionManager) {
      throw new Error(
        'BreakdownEngine not initialized. Call initialize() first.'
      );
    }

    return await this.sessionManager.getBreakdownSession(ideaId);
  }

  async healthCheck(): Promise<{ status: string; config: boolean }> {
    return {
      status: 'healthy',
      config: !!this.config,
    };
  }
}

export const breakdownEngine = new BreakdownEngine();
