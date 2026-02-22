import type { AgentConfig } from '@/lib/config-service';

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
