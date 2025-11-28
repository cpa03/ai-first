import { aiService, AIModelConfig } from '@/lib/ai';
import { dbService } from '@/lib/db';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

export interface BreakdownConfig {
  name: string;
  description: string;
  model: string;
  temperature: number;
  max_tokens: number;
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

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      const configPath = path.join(
        process.cwd(),
        'ai',
        'agent-configs',
        'breakdown-engine.yml'
      );
      const configContent = fs.readFileSync(configPath, 'utf8');
      this.config = yaml.load(configContent) as BreakdownConfig;

      this.aiConfig = {
        provider: 'openai',
        model: this.config.model,
        maxTokens: this.config.max_tokens,
        temperature: this.config.temperature,
      };
    } catch (error) {
      console.error('Failed to load breakdown engine config:', error);
      throw new Error('Breakdown engine configuration not found or invalid');
    }
  }

  async initialize(): Promise<void> {
    if (!this.aiConfig) {
      throw new Error('AI configuration not loaded');
    }
    await aiService.initialize(this.aiConfig);
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

      await this.storeSession(session);

      // Step 1: Analyze the idea
      session.analysis = await this.analyzeIdea(
        refinedIdea,
        userResponses,
        options
      );
      session.status = 'decomposing';
      session.updatedAt = new Date();
      await this.storeSession(session);

      // Step 2: Decompose into tasks
      session.tasks = await this.decomposeTasks(session.analysis);
      session.status = 'scheduling';
      session.updatedAt = new Date();
      await this.storeSession(session);

      // Step 3: Analyze dependencies
      session.dependencies = await this.analyzeDependencies(session.tasks);
      session.updatedAt = new Date();
      await this.storeSession(session);

      // Step 4: Generate timeline
      session.timeline = await this.generateTimeline(
        session.analysis,
        session.tasks,
        session.dependencies,
        options
      );
      session.status = 'completed';
      session.confidence = this.calculateOverallConfidence(session);
      session.processingTime = Date.now() - startTime;
      session.updatedAt = new Date();
      await this.storeSession(session);

      // Store results in database
      await this.persistResults(session);

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

  private async analyzeIdea(
    refinedIdea: string,
    userResponses: Record<string, string>,
    options: any
  ): Promise<IdeaAnalysis> {
    if (!this.aiConfig) {
      throw new Error('AI configuration not loaded');
    }

    const prompt = `Analyze the following clarified idea and extract key components:

Idea: "${refinedIdea}"
User Responses: ${JSON.stringify(userResponses, null, 2)}
Options: ${JSON.stringify(options, null, 2)}

Provide a comprehensive analysis including:
1. Main objectives (3-5 specific, measurable goals)
2. Key deliverables (5-10 concrete outputs)
3. Technical complexity assessment (1-10 scale with factors)
4. Estimated scope (size and duration)
5. Risk factors with impact and probability
6. Success criteria (measurable outcomes)

For each item, include a confidence score (0-1) indicating certainty.

Format as JSON:
{
  "objectives": [{"title": "...", "description": "...", "confidence": 0.8}],
  "deliverables": [{"title": "...", "description": "...", "priority": 1, "estimatedHours": 40, "confidence": 0.7}],
  "complexity": {"score": 7, "factors": [...], "level": "complex"},
  "scope": {"size": "medium", "estimatedWeeks": 12, "teamSize": 3},
  "riskFactors": [{"factor": "...", "impact": "medium", "probability": 0.3}],
  "successCriteria": ["..."],
  "overallConfidence": 0.75
}`;

    try {
      const messages = [
        {
          role: 'system' as const,
          content:
            'You are an expert project analyst and systems architect. Analyze ideas and provide structured breakdowns with confidence scoring.',
        },
        { role: 'user' as const, content: prompt },
      ];

      const response = await aiService.callModel(messages, this.aiConfig);
      const analysis = JSON.parse(response) as IdeaAnalysis;

      // Validate and enhance analysis
      return this.validateAnalysis(analysis);
    } catch (error) {
      console.error('Failed to analyze idea:', error);
      throw new Error('Idea analysis failed');
    }
  }

  private async decomposeTasks(
    analysis: IdeaAnalysis
  ): Promise<TaskDecomposition> {
    if (!this.aiConfig) {
      throw new Error('AI configuration not loaded');
    }

    const tasks = [];
    let totalHours = 0;

    for (const deliverable of analysis.deliverables) {
      const prompt = `Break down the following deliverable into specific, actionable tasks:

Deliverable: "${deliverable.title}"
Description: "${deliverable.description}"
Priority: ${deliverable.priority}
Estimated Hours: ${deliverable.estimatedHours}

Generate 3-8 tasks that collectively complete this deliverable. Each task should:
- Have a clear, actionable title starting with a verb
- Include detailed description of what needs to be done
- Estimate hours (1-40 hours per task)
- Identify required skills
- Note any dependencies on other tasks (use task IDs like "t1", "t2")

Format as JSON array:
[
  {
    "id": "t1",
    "title": "Design user interface mockups",
    "description": "Create detailed wireframes and visual designs for all user-facing components",
    "estimatedHours": 16,
    "complexity": 5,
    "requiredSkills": ["UI/UX Design", "Figma"],
    "dependencies": []
  }
]`;

      try {
        const messages = [
          {
            role: 'system' as const,
            content:
              'You are an expert project manager. Break down deliverables into specific, manageable tasks with accurate time estimates.',
          },
          { role: 'user' as const, content: prompt },
        ];

        const response = await aiService.callModel(messages, this.aiConfig);
        const deliverableTasks = JSON.parse(response);

        // Add deliverable ID to each task
        deliverableTasks.forEach((task: any) => {
          task.deliverableId = deliverable.title;
          tasks.push(task);
          totalHours += task.estimatedHours;
        });
      } catch (error) {
        console.error(
          `Failed to decompose deliverable: ${deliverable.title}`,
          error
        );
        // Add fallback task
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
      confidence: analysis.overallConfidence * 0.9, // Slightly lower confidence for tasks
    };
  }

  private async analyzeDependencies(
    taskDecomposition: TaskDecomposition
  ): Promise<DependencyGraph> {
    const nodes = taskDecomposition.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      type: 'task' as const,
      estimatedHours: task.estimatedHours,
    }));

    const edges = [];
    const dependencyMap = new Map<string, string[]>();

    // Build dependency map from task dependencies
    taskDecomposition.tasks.forEach((task) => {
      if (task.dependencies.length > 0) {
        dependencyMap.set(task.id, task.dependencies);
        task.dependencies.forEach((depId) => {
          edges.push({
            from: depId,
            to: task.id,
            type: 'finish_to_start' as const,
            lag: 0,
          });
        });
      }
    });

    // Calculate critical path using simple algorithm
    const criticalPath = this.calculateCriticalPath(nodes, edges);

    return {
      nodes,
      edges,
      criticalPath,
    };
  }

  private calculateCriticalPath(nodes: any[], edges: any[]): string[] {
    // Simplified critical path calculation
    // In production, use proper CPM algorithm
    const taskMap = new Map(nodes.map((n) => [n.id, n]));
    const visited = new Set<string>();
    const path: string[] = [];

    // Find tasks with no dependencies (start tasks)
    const startTasks = nodes.filter(
      (node) => !edges.some((edge) => edge.to === node.id)
    );

    if (startTasks.length > 0) {
      // Simple path following
      let current = startTasks[0].id;
      path.push(current);

      while (current) {
        const nextEdge = edges.find((edge) => edge.from === current);
        if (nextEdge && !visited.has(nextEdge.to)) {
          current = nextEdge.to;
          path.push(current);
          visited.add(current);
        } else {
          break;
        }
      }
    }

    return path.length > 0 ? path : nodes.map((n) => n.id);
  }

  private async generateTimeline(
    analysis: IdeaAnalysis,
    tasks: TaskDecomposition,
    dependencies: DependencyGraph,
    options: any
  ): Promise<Timeline> {
    const startDate = new Date();
    const totalWeeks = Math.ceil(
      tasks.totalEstimatedHours / (40 * (options.teamSize || 1))
    );
    const endDate = new Date(
      startDate.getTime() + totalWeeks * 7 * 24 * 60 * 60 * 1000
    );

    // Generate milestones based on deliverables
    const milestones = analysis.deliverables.map((deliverable, index) => ({
      id: `m_${index + 1}`,
      title: deliverable.title,
      date: new Date(
        startDate.getTime() +
          (index + 1) *
            (totalWeeks / analysis.deliverables.length) *
            7 *
            24 *
            60 *
            60 *
            1000
      ),
      dependencies: [] as string[],
    }));

    // Create phases (simplified)
    const phases = [
      {
        name: 'Planning & Design',
        startDate,
        endDate: new Date(
          startDate.getTime() + totalWeeks * 0.2 * 7 * 24 * 60 * 60 * 1000
        ),
        tasks: tasks.tasks
          .slice(0, Math.ceil(tasks.tasks.length * 0.2))
          .map((t) => t.id),
        deliverables: analysis.deliverables.slice(0, 1).map((d) => d.title),
      },
      {
        name: 'Development',
        startDate: new Date(
          startDate.getTime() + totalWeeks * 0.2 * 7 * 24 * 60 * 60 * 1000
        ),
        endDate: new Date(
          startDate.getTime() + totalWeeks * 0.8 * 7 * 24 * 60 * 60 * 1000
        ),
        tasks: tasks.tasks
          .slice(
            Math.ceil(tasks.tasks.length * 0.2),
            Math.ceil(tasks.tasks.length * 0.8)
          )
          .map((t) => t.id),
        deliverables: analysis.deliverables.slice(1, -1).map((d) => d.title),
      },
      {
        name: 'Testing & Deployment',
        startDate: new Date(
          startDate.getTime() + totalWeeks * 0.8 * 7 * 24 * 60 * 60 * 1000
        ),
        endDate,
        tasks: tasks.tasks
          .slice(Math.ceil(tasks.tasks.length * 0.8))
          .map((t) => t.id),
        deliverables: analysis.deliverables.slice(-1).map((d) => d.title),
      },
    ];

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

  private validateAnalysis(analysis: any): IdeaAnalysis {
    // Ensure required fields exist and have valid values
    if (!analysis.objectives || !Array.isArray(analysis.objectives)) {
      analysis.objectives = [];
    }
    if (!analysis.deliverables || !Array.isArray(analysis.deliverables)) {
      analysis.deliverables = [];
    }
    if (!analysis.complexity) {
      analysis.complexity = { score: 5, factors: [], level: 'medium' };
    }
    if (!analysis.scope) {
      analysis.scope = { size: 'medium', estimatedWeeks: 8, teamSize: 2 };
    }
    if (!analysis.riskFactors || !Array.isArray(analysis.riskFactors)) {
      analysis.riskFactors = [];
    }
    if (!analysis.successCriteria || !Array.isArray(analysis.successCriteria)) {
      analysis.successCriteria = [];
    }
    if (typeof analysis.overallConfidence !== 'number') {
      analysis.overallConfidence = 0.7;
    }

    return analysis as IdeaAnalysis;
  }

  private calculateOverallConfidence(session: BreakdownSession): number {
    const weights = {
      analysis: 0.3,
      tasks: 0.3,
      dependencies: 0.2,
      timeline: 0.2,
    };

    let confidence = 0;
    if (session.analysis)
      confidence += session.analysis.overallConfidence * weights.analysis;
    if (session.tasks) confidence += session.tasks.confidence * weights.tasks;
    if (session.dependencies) confidence += 0.8 * weights.dependencies; // Dependencies are usually reliable
    if (session.timeline) confidence += 0.7 * weights.timeline; // Timeline has more uncertainty

    return Math.round(confidence * 100) / 100;
  }

  private async storeSession(session: BreakdownSession): Promise<void> {
    await dbService.storeVector({
      idea_id: session.ideaId,
      vector_data: session,
      reference_type: 'breakdown_session',
      reference_id: session.id,
    });
  }

  private async persistResults(session: BreakdownSession): Promise<void> {
    if (!session.analysis || !session.tasks) return;

    try {
      // Store deliverables
      for (const deliverable of session.analysis.deliverables) {
        await dbService.createDeliverable({
          idea_id: session.ideaId,
          title: deliverable.title,
          description: deliverable.description,
          priority: deliverable.priority,
          estimate_hours: deliverable.estimatedHours,
        });
      }

      // Store tasks
      const deliverables = await dbService.getDeliverables(session.ideaId);
      const deliverableMap = new Map(deliverables.map((d) => [d.title, d.id]));

      for (const task of session.tasks.tasks) {
        const deliverableId = deliverableMap.get(task.deliverableId);
        if (deliverableId) {
          await dbService.createTask({
            deliverable_id: deliverableId,
            title: task.title,
            description: task.description,
            estimate: task.estimatedHours,
            status: 'todo',
          });
        }
      }

      // Update idea status
      await dbService.updateIdea(session.ideaId, { status: 'breakdown' });
    } catch (error) {
      console.error('Failed to persist breakdown results:', error);
      throw error;
    }
  }

  async getBreakdownSession(ideaId: string): Promise<BreakdownSession | null> {
    try {
      const vectors = await dbService.getVectors(ideaId, 'breakdown_session');
      if (vectors.length === 0) return null;

      const session = vectors[0].vector_data as BreakdownSession;
      session.createdAt = new Date(session.createdAt);
      session.updatedAt = new Date(session.updatedAt);

      return session;
    } catch (error) {
      console.error('Failed to get breakdown session:', error);
      return null;
    }
  }

  async healthCheck(): Promise<{ status: string; config: boolean }> {
    return {
      status: 'healthy',
      config: !!this.config,
    };
  }
}

export const breakdownEngine = new BreakdownEngine();
