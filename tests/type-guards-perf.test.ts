import {
  isArrayOf,
  isObject,
  isString,
  hasProperty,
  isNumber,
  isBoolean,
  isClarifierQuestion,
  isTask,
  isIdeaAnalysis,
} from '@/lib/type-guards';

describe('Type Guards Correctness', () => {
  describe('isArrayOf', () => {
    it('should validate arrays of matching types', () => {
      expect(isArrayOf(['a', 'b', 'c'], isString)).toBe(true);
      expect(isArrayOf([1, 2, 3], isNumber)).toBe(true);
      expect(isArrayOf([], isString)).toBe(true);
    });

    it('should reject non-arrays or arrays with non-matching types', () => {
      expect(isArrayOf('not-an-array', isString)).toBe(false);
      expect(isArrayOf(['a', 1, 'c'], isString)).toBe(false);
      expect(isArrayOf([null], isString)).toBe(false);
    });
  });

  describe('isObject', () => {
    it('should identify valid objects', () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ key: 'value' })).toBe(true);
    });

    it('should reject null, arrays, and primitives', () => {
      expect(isObject(null)).toBe(false);
      expect(isObject([])).toBe(false);
      expect(isObject('string')).toBe(false);
      expect(isObject(123)).toBe(false);
      expect(isObject(undefined)).toBe(false);
    });
  });

  describe('isString, isNumber, isBoolean, hasProperty', () => {
    it('should correctly validate primitives and property presence', () => {
      expect(isString('hello')).toBe(true);
      expect(isString(123)).toBe(false);

      expect(isNumber(123)).toBe(true);
      expect(isNumber(NaN)).toBe(false);
      expect(isNumber('123')).toBe(false);

      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
      expect(isBoolean('true')).toBe(false);

      expect(hasProperty({ a: 1 }, 'a')).toBe(true);
      expect(hasProperty({ a: 1 }, 'b')).toBe(false);
      expect(hasProperty(null, 'a')).toBe(false);
    });
  });

  describe('isClarifierQuestion', () => {
    it('should validate valid clarifier questions', () => {
      const valid1 = {
        id: 'q1',
        question: 'What is your goal?',
        type: 'open',
        required: true,
      };

      const valid2 = {
        id: 'q2',
        question: 'Select a plan',
        type: 'multiple_choice',
        options: ['Free', 'Pro', 'Enterprise'],
        required: false,
      };

      expect(isClarifierQuestion(valid1)).toBe(true);
      expect(isClarifierQuestion(valid2)).toBe(true);
    });

    it('should reject invalid clarifier questions', () => {
      expect(isClarifierQuestion(null)).toBe(false);
      expect(isClarifierQuestion({ id: 'q1' })).toBe(false);
      expect(
        isClarifierQuestion({
          id: 'q1',
          question: 'q',
          type: 'invalid_type',
          required: true,
        })
      ).toBe(false);
      expect(
        isClarifierQuestion({
          id: 'q1',
          question: 'q',
          type: 'open',
          options: 'not-an-array',
          required: true,
        })
      ).toBe(false);
    });
  });

  describe('isTask', () => {
    it('should validate valid tasks', () => {
      const task = {
        id: 't1',
        title: 'Build UI',
        description: 'Create frontend components',
        estimatedHours: 10,
        complexity: 3,
      };
      expect(isTask(task)).toBe(true);
    });

    it('should reject invalid tasks', () => {
      expect(isTask(null)).toBe(false);
      expect(
        isTask({
          id: 't1',
          title: 'Build UI',
          description: 'Desc',
          estimatedHours: NaN,
          complexity: 3,
        })
      ).toBe(false);
      expect(
        isTask({
          id: 't1',
          title: 'Build UI',
        })
      ).toBe(false);
    });
  });

  describe('isIdeaAnalysis', () => {
    it('should validate valid idea analysis objects', () => {
      const analysis = {
        objectives: [{ title: 'Obj 1', description: 'Desc', confidence: 0.9 }],
        deliverables: [
          {
            title: 'Del 1',
            description: 'Desc',
            priority: 1,
            estimatedHours: 5,
            confidence: 0.9,
          },
        ],
        complexity: { score: 5, factors: ['A'], level: 'medium' },
        scope: { size: 'medium', estimatedWeeks: 2, teamSize: 3 },
        riskFactors: [{ factor: 'Risk 1', impact: 'high', probability: 0.3 }],
        successCriteria: ['Criterion 1'],
        overallConfidence: 0.85,
      };
      expect(isIdeaAnalysis(analysis)).toBe(true);
    });

    it('should reject invalid idea analysis objects', () => {
      expect(isIdeaAnalysis(null)).toBe(false);
      expect(isIdeaAnalysis({ objectives: 'invalid' })).toBe(false);
    });
  });
});

describe('Type Guards Performance Benchmark', () => {
  it('should run 100,000 validations efficiently', () => {
    const validQuestions = Array.from({ length: 100 }, (_, i) => ({
      id: `q_${i}`,
      question: `Question ${i}?`,
      type: i % 3 === 0 ? 'open' : i % 3 === 1 ? 'multiple_choice' : 'yes_no',
      options: i % 3 === 1 ? ['Opt 1', 'Opt 2'] : undefined,
      required: i % 2 === 0,
    }));

    const validTasks = Array.from({ length: 100 }, (_, i) => ({
      id: `t_${i}`,
      title: `Task ${i}`,
      description: `Description ${i}`,
      estimatedHours: i + 1,
      complexity: (i % 5) + 1,
    }));

    const start = performance.now();

    for (let r = 0; r < 1000; r++) {
      for (let i = 0; i < validQuestions.length; i++) {
        isClarifierQuestion(validQuestions[i]);
      }
      for (let i = 0; i < validTasks.length; i++) {
        isTask(validTasks[i]);
      }
    }

    const duration = performance.now() - start;
    console.log(
      `[Benchmark] 200,000 type guard checks executed in ${duration.toFixed(2)}ms`
    );

    expect(duration).toBeLessThan(1000); // Expect sub-second completion for 200k validations
  });
});
