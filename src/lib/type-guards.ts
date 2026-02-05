export function isArrayOf<T>(
  value: unknown,
  itemValidator: (item: unknown) => item is T
): value is T[] {
  return Array.isArray(value) && value.every(itemValidator);
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
  return typeof value === 'number' && !isNaN(value);
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
  if (!hasProperty(data, 'id') || !isString(data.id)) return false;
  if (!hasProperty(data, 'question') || !isString(data.question)) return false;
  if (!hasProperty(data, 'type') || !isString(data.type)) return false;
  const typeValues = ['open', 'multiple_choice', 'yes_no'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!typeValues.includes((data as Record<string, unknown>).type as string))
    return false;
  if (hasProperty(data, 'options') && !isArrayOf(data.options, isString)) {
    return false;
  }
  if (!hasProperty(data, 'required') || !isBoolean(data.required)) {
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
  if (!hasProperty(data, 'id') || !isString(data.id)) return false;
  if (!hasProperty(data, 'title') || !isString(data.title)) return false;
  if (!hasProperty(data, 'description') || !isString(data.description))
    return false;
  if (!hasProperty(data, 'estimatedHours') || !isNumber(data.estimatedHours)) {
    return false;
  }
  if (!hasProperty(data, 'complexity') || !isNumber(data.complexity)) {
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
  if (
    !hasProperty(data, 'objectives') ||
    !isArrayOf(data.objectives, isObject)
  ) {
    return false;
  }
  if (
    !hasProperty(data, 'deliverables') ||
    !isArrayOf(data.deliverables, isObject)
  ) {
    return false;
  }
  if (!hasProperty(data, 'complexity') || !isObject(data.complexity))
    return false;
  if (!hasProperty(data, 'scope') || !isObject(data.scope)) return false;
  if (
    !hasProperty(data, 'riskFactors') ||
    !isArrayOf(data.riskFactors, isObject)
  ) {
    return false;
  }
  if (
    !hasProperty(data, 'successCriteria') ||
    !isArrayOf(data.successCriteria, isString)
  ) {
    return false;
  }
  return true;
}
