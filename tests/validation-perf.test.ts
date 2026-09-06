import { validateUserResponses } from '@/lib/validation';

describe('validateUserResponses performance', () => {
  it('measures validation speed for user responses', () => {
    const responses = {
      q1: 'I want a mobile application for tracking habits',
      q2: 'Target audience is young professionals aged 20-35',
      q3: 'Key features include daily reminders, streak tracking, and dark mode',
      q4: 'Budget is under $10,000 with a 3 month timeline',
    };

    const start = performance.now();
    const iterations = 5000;
    for (let i = 0; i < iterations; i++) {
      validateUserResponses(responses);
    }
    const elapsed = performance.now() - start;
    console.log(
      `5k validateUserResponses took ${elapsed.toFixed(2)}ms (${(elapsed / iterations).toFixed(5)}ms / op)`
    );
    expect(elapsed).toBeGreaterThan(0);
  });
});
