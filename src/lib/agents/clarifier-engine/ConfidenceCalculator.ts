import { AGENT_CONFIG } from '@/lib/config/constants';

const { CLARIFIER_CONFIDENCE } = AGENT_CONFIG;

export class ConfidenceCalculator {
  calculate(answeredCount: number, totalQuestions: number): number {
    if (totalQuestions === 0) {
      return CLARIFIER_CONFIDENCE.DEFAULT_CONFIDENCE;
    }

    return Math.min(
      CLARIFIER_CONFIDENCE.MAX_CONFIDENCE,
      CLARIFIER_CONFIDENCE.BASE_CONFIDENCE +
        (answeredCount / totalQuestions) *
          CLARIFIER_CONFIDENCE.CONFIDENCE_INCREMENT_PER_ANSWER
    );
  }

  calculateFromAnswers(
    answers: Record<string, string>,
    totalQuestions: number
  ): number {
    const answeredCount = Object.keys(answers).length;
    return this.calculate(answeredCount, totalQuestions);
  }
}
