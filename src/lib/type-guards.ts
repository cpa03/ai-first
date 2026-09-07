/**
 * Type Guard Utilities
 *
 * Provides runtime type validation and type narrowing for core data structures.
 * Performance-optimized for high-frequency payload validation.
 */

export function isArrayOf<T>(
  value: unknown,
  itemValidator: (item: unknown) => item is T
): value is T[] {
  if (!Array.isArray(value)) return false;
  // PERFORMANCE: Fast for-loop avoids callback allocations and iterator overhead of Array.prototype.every
  const len = value.length;
  for (let i = 0; i < len; i++) {
    if (!itemValidator(value[i])) return false;
  }
  return true;
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function hasProperty<K extends string>(
  obj: unknown,
  prop: K
): obj is Record<K, unknown> {
  return isObject(obj) && prop in obj;
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isClarifierQuestion(data: unknown): data is {
  id: string;
  question: string;
  type: 'open' | 'multiple_choice' | 'yes_no';
  options?: string[];
  required: boolean;
} {
  if (!isObject(data)) return false;
  // PERFORMANCE: Once isObject is verified, direct 'in' operator checks avoid repeating isObject inside hasProperty
  if (!('id' in data) || typeof data.id !== 'string') return false;
  if (!('question' in data) || typeof data.question !== 'string') return false;
  if (!('type' in data) || typeof data.type !== 'string') return false;

  // PERFORMANCE: Inline equality checks eliminate per-invocation array allocations (['open', 'multiple_choice', 'yes_no'])
  const type = data.type;
  if (type !== 'open' && type !== 'multiple_choice' && type !== 'yes_no') {
    return false;
  }

  if ('options' in data && !isArrayOf(data.options, isString)) {
    return false;
  }
  if (!('required' in data) || typeof data.required !== 'boolean') {
    return false;
  }
  return true;
}

export function isTask(data: unknown): data is {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  complexity: number;
} {
  if (!isObject(data)) return false;
  // PERFORMANCE: Direct property access & type check avoids redundant isObject calls
  if (!('id' in data) || typeof data.id !== 'string') return false;
  if (!('title' in data) || typeof data.title !== 'string') return false;
  if (!('description' in data) || typeof data.description !== 'string') {
    return false;
  }
  if (
    !('estimatedHours' in data) ||
    typeof data.estimatedHours !== 'number' ||
    Number.isNaN(data.estimatedHours)
  ) {
    return false;
  }
  if (
    !('complexity' in data) ||
    typeof data.complexity !== 'number' ||
    Number.isNaN(data.complexity)
  ) {
    return false;
  }
  return true;
}

export function isIdeaAnalysis(data: unknown): data is {
  objectives: Array<{ title: string; description: string; confidence: number }>;
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
} {
  if (!isObject(data)) return false;
  // PERFORMANCE: Direct property check avoids redundant isObject evaluations
  if (!('objectives' in data) || !isArrayOf(data.objectives, isObject)) {
    return false;
  }
  if (!('deliverables' in data) || !isArrayOf(data.deliverables, isObject)) {
    return false;
  }
  if (!('complexity' in data) || !isObject(data.complexity)) return false;
  if (!('scope' in data) || !isObject(data.scope)) return false;
  if (!('riskFactors' in data) || !isArrayOf(data.riskFactors, isObject)) {
    return false;
  }
  if (
    !('successCriteria' in data) ||
    !isArrayOf(data.successCriteria, isString)
  ) {
    return false;
  }
  return true;
}
