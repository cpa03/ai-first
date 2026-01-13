export class ConfidenceCalculator {
  calculate(answeredCount: number, totalQuestions: number): number {
    if (totalQuestions === 0) {
      return 0.5;
    }

    return Math.min(0.9, 0.3 + (answeredCount / totalQuestions) * 0.6);
  }

  calculateFromAnswers(
    answers: Record<string, any>,
    totalQuestions: number
  ): number {
    const answeredCount = Object.keys(answers).length;
    return this.calculate(answeredCount, totalQuestions);
  }
}
