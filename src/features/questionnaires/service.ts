import { z } from 'zod';

/**
 * Questionnaire rules: which questions a respondent sees, and which
 * questionnaire version a location asks.
 *
 * Pure functions, no I/O — this is the layer the mandatory unit tests exercise.
 *
 * Branching is **configuration-driven and deterministic**. AI never decides which
 * question to show: the same answers must always produce the same questionnaire,
 * or two respondents' results are not comparable and the aggregate means nothing.
 */

/* ----------------------------------------------------------- conditions --- */

export const CONDITION_OPERATORS = [
  'eq',
  'neq',
  'lt',
  'lte',
  'gt',
  'gte',
  'in',
  'includes',
] as const;

export type ConditionOperator = (typeof CONDITION_OPERATORS)[number];

const comparisonSchema = z.object({
  /** `overall_score`, or `answer.<question_key>` for an earlier answer. */
  field: z.string().min(1).max(120),
  operator: z.enum(CONDITION_OPERATORS),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.union([z.string(), z.number()]))]),
});

export type Comparison = z.infer<typeof comparisonSchema>;

/**
 * A condition is either a comparison or a group. Groups nest, so
 * `{ all: [...] }` and `{ any: [...] }` can be combined.
 *
 * Typed by hand rather than with `z.lazy` inference, because a recursive Zod
 * type infers as `any` and that would defeat the point of validating at all.
 */
export type Condition =
  | Comparison
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition };

export const conditionSchema: z.ZodType<Condition> = z.lazy(() =>
  z.union([
    comparisonSchema,
    z.object({ all: z.array(conditionSchema).min(1) }),
    z.object({ any: z.array(conditionSchema).min(1) }),
    z.object({ not: conditionSchema }),
  ]),
);

/** What a condition may look at: the score, plus answers given so far. */
export type ConditionContext = {
  overallScore: number | null;
  /** Keyed by `question_key`. A multiple choice holds the selected option keys. */
  answers: Record<string, string | number | boolean | string[] | null | undefined>;
};

function resolveField(field: string, context: ConditionContext) {
  if (field === 'overall_score') return context.overallScore;
  if (field.startsWith('answer.')) return context.answers[field.slice('answer.'.length)];
  // An unknown field is a configuration mistake, not a runtime decision to make
  // up. Returning undefined makes the comparison fail rather than guess.
  return undefined;
}

function compare(operator: ConditionOperator, left: unknown, right: Comparison['value']): boolean {
  switch (operator) {
    case 'eq':
      return left === right;
    case 'neq':
      return left !== right;
    case 'lt':
    case 'lte':
    case 'gt':
    case 'gte': {
      // Only numbers order meaningfully. Comparing a string to a number here
      // would silently coerce and produce confident nonsense.
      if (typeof left !== 'number' || typeof right !== 'number') return false;
      if (operator === 'lt') return left < right;
      if (operator === 'lte') return left <= right;
      if (operator === 'gt') return left > right;
      return left >= right;
    }
    case 'in':
      return Array.isArray(right) && right.some((candidate) => candidate === left);
    case 'includes':
      return Array.isArray(left) && left.some((candidate) => candidate === right);
  }
}

/**
 * Evaluates one condition.
 *
 * Missing data fails the comparison. A follow-up that depends on an answer we do
 * not have should not be asked — and failing closed keeps the outcome
 * predictable instead of depending on evaluation order.
 */
export function evaluateCondition(condition: Condition, context: ConditionContext): boolean {
  if ('all' in condition) {
    return condition.all.every((child) => evaluateCondition(child, context));
  }
  if ('any' in condition) {
    return condition.any.some((child) => evaluateCondition(child, context));
  }
  if ('not' in condition) {
    return !evaluateCondition(condition.not, context);
  }

  const left = resolveField(condition.field, context);
  if (left === undefined || left === null) return false;
  return compare(condition.operator, left, condition.value);
}

export type QuestionForEvaluation = {
  id: string;
  questionKey: string;
  displayOrder: number;
  conditionJson: unknown;
};

/**
 * The questions a respondent should see, in display order.
 *
 * A question without a condition is always shown. A malformed condition is
 * treated as "do not show": shipping a broken condition should lose one
 * follow-up question, not corrupt every response with a question the
 * configuration never intended.
 */
export function selectVisibleQuestions<T extends QuestionForEvaluation>(
  questions: T[],
  context: ConditionContext,
): T[] {
  return [...questions]
    .sort((a, b) => a.displayOrder - b.displayOrder || a.questionKey.localeCompare(b.questionKey))
    .filter((question) => {
      if (question.conditionJson === null || question.conditionJson === undefined) return true;

      const parsed = conditionSchema.safeParse(question.conditionJson);
      if (!parsed.success) return false;

      return evaluateCondition(parsed.data, context);
    });
}

/* ---------------------------------------------------------- assignments --- */

export type AssignmentForResolution = {
  id: string;
  /** null means the assignment covers every location in the organization. */
  locationId: string | null;
  questionnaireVersionId: string;
  status: 'active' | 'inactive';
  activeFrom: string;
  activeUntil: string | null;
};

/**
 * Which questionnaire version a location asks right now.
 *
 * Most specific wins: a location's own assignment beats the organization-wide
 * one. That is what lets an operator run a different questionnaire at one branch
 * without unpicking the default for everybody else.
 */
export function resolveAssignmentForLocation(
  assignments: AssignmentForResolution[],
  locationId: string,
  at: Date,
): AssignmentForResolution | null {
  const moment = at.getTime();

  const applicable = assignments.filter((assignment) => {
    if (assignment.status !== 'active') return false;
    if (assignment.locationId !== null && assignment.locationId !== locationId) return false;
    if (new Date(assignment.activeFrom).getTime() > moment) return false;
    if (assignment.activeUntil !== null && new Date(assignment.activeUntil).getTime() <= moment) {
      return false;
    }
    return true;
  });

  return (
    applicable.find((assignment) => assignment.locationId === locationId) ??
    applicable.find((assignment) => assignment.locationId === null) ??
    null
  );
}
