import { BreakdownSession } from '../breakdown-engine';

export class ConfidenceCalculator {
  calculateOverallConfidence(session: BreakdownSession): number {
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
    if (session.dependencies) confidence += 0.8 * weights.dependencies;
    if (session.timeline) confidence += 0.7 * weights.timeline;

    return Math.round(confidence * 100) / 100;
  }
}
