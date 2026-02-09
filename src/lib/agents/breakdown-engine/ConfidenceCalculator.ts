import { BreakdownSession } from '../breakdown-engine';
import { AGENT_CONFIG } from '@/lib/config/constants';

const { BREAKDOWN_CONFIDENCE_WEIGHTS, BREAKDOWN_FALLBACK_CONFIDENCE } =
  AGENT_CONFIG;

export class ConfidenceCalculator {
  calculateOverallConfidence(session: BreakdownSession): number {
    let confidence = 0;
    if (session.analysis)
      confidence +=
        session.analysis.overallConfidence *
        BREAKDOWN_CONFIDENCE_WEIGHTS.ANALYSIS;
    if (session.tasks)
      confidence +=
        session.tasks.confidence * BREAKDOWN_CONFIDENCE_WEIGHTS.TASKS;
    if (session.dependencies)
      confidence +=
        BREAKDOWN_FALLBACK_CONFIDENCE.DEPENDENCIES *
        BREAKDOWN_CONFIDENCE_WEIGHTS.DEPENDENCIES;
    if (session.timeline)
      confidence +=
        BREAKDOWN_FALLBACK_CONFIDENCE.TIMELINE *
        BREAKDOWN_CONFIDENCE_WEIGHTS.TIMELINE;

    return Math.round(confidence * 100) / 100;
  }
}
