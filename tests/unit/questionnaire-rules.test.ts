import { describe, expect, it } from 'vitest';

import {
  conditionSchema,
  evaluateCondition,
  resolveAssignmentForLocation,
  selectVisibleQuestions,
  type ConditionContext,
} from '@/features/questionnaires/service';

const ctx = (overrides: Partial<ConditionContext> = {}): ConditionContext => ({
  overallScore: null,
  answers: {},
  ...overrides,
});

describe('evaluateCondition — the shapes the specification documents', () => {
  it('shows a follow-up below five stars', () => {
    const condition = { all: [{ field: 'overall_score', operator: 'lt', value: 5 }] } as const;
    const parsed = conditionSchema.parse(condition);

    for (const score of [1, 2, 3, 4]) {
      expect(evaluateCondition(parsed, ctx({ overallScore: score }))).toBe(true);
    }
    expect(evaluateCondition(parsed, ctx({ overallScore: 5 }))).toBe(false);
  });

  it('handles the nested answer example', () => {
    const parsed = conditionSchema.parse({
      all: [
        { field: 'overall_score', operator: 'lte', value: 3 },
        { field: 'answer.delivery_problem', operator: 'eq', value: true },
      ],
    });

    expect(
      evaluateCondition(parsed, ctx({ overallScore: 2, answers: { delivery_problem: true } })),
    ).toBe(true);
    expect(
      evaluateCondition(parsed, ctx({ overallScore: 2, answers: { delivery_problem: false } })),
    ).toBe(false);
    // Score no longer qualifies, even though the answer does.
    expect(
      evaluateCondition(parsed, ctx({ overallScore: 4, answers: { delivery_problem: true } })),
    ).toBe(false);
  });
});

describe('evaluateCondition — groups', () => {
  it('any passes when one child passes', () => {
    const parsed = conditionSchema.parse({
      any: [
        { field: 'overall_score', operator: 'eq', value: 1 },
        { field: 'overall_score', operator: 'eq', value: 5 },
      ],
    });
    expect(evaluateCondition(parsed, ctx({ overallScore: 5 }))).toBe(true);
    expect(evaluateCondition(parsed, ctx({ overallScore: 3 }))).toBe(false);
  });

  it('not inverts', () => {
    const parsed = conditionSchema.parse({
      not: { field: 'overall_score', operator: 'eq', value: 5 },
    });
    expect(evaluateCondition(parsed, ctx({ overallScore: 4 }))).toBe(true);
    expect(evaluateCondition(parsed, ctx({ overallScore: 5 }))).toBe(false);
  });
});

describe('evaluateCondition — missing and mistyped data fails closed', () => {
  it('is false when the score is not given yet', () => {
    const parsed = conditionSchema.parse({ field: 'overall_score', operator: 'lt', value: 5 });
    expect(evaluateCondition(parsed, ctx({ overallScore: null }))).toBe(false);
  });

  it('is false for an unknown field', () => {
    const parsed = conditionSchema.parse({ field: 'nonsense', operator: 'eq', value: 1 });
    expect(evaluateCondition(parsed, ctx({ overallScore: 3 }))).toBe(false);
  });

  it('is false for an answer that was never given', () => {
    const parsed = conditionSchema.parse({ field: 'answer.missing', operator: 'eq', value: 'x' });
    expect(evaluateCondition(parsed, ctx())).toBe(false);
  });

  it('refuses to order non-numbers instead of coercing them', () => {
    // '10' < 5 would be true under string coercion in some comparisons; the
    // evaluator must not produce confident nonsense.
    const parsed = conditionSchema.parse({ field: 'answer.size', operator: 'lt', value: 5 });
    expect(evaluateCondition(parsed, ctx({ answers: { size: '10' } }))).toBe(false);
  });
});

describe('evaluateCondition — set operators', () => {
  it('in matches a scalar against a list', () => {
    const parsed = conditionSchema.parse({
      field: 'overall_score',
      operator: 'in',
      value: [1, 2, 3],
    });
    expect(evaluateCondition(parsed, ctx({ overallScore: 2 }))).toBe(true);
    expect(evaluateCondition(parsed, ctx({ overallScore: 4 }))).toBe(false);
  });

  it('includes matches a list answer against a scalar', () => {
    const parsed = conditionSchema.parse({
      field: 'answer.improvement_topics',
      operator: 'includes',
      value: 'temperature',
    });
    expect(
      evaluateCondition(parsed, ctx({ answers: { improvement_topics: ['taste', 'temperature'] } })),
    ).toBe(true);
    expect(
      evaluateCondition(parsed, ctx({ answers: { improvement_topics: ['taste'] } })),
    ).toBe(false);
  });
});

describe('selectVisibleQuestions', () => {
  const questions = [
    { id: 'c', questionKey: 'comment', displayOrder: 40, conditionJson: null },
    {
      id: 'b',
      questionKey: 'improvement_topics',
      displayOrder: 20,
      conditionJson: { all: [{ field: 'overall_score', operator: 'lt', value: 5 }] },
    },
    {
      id: 'p',
      questionKey: 'positive_topics',
      displayOrder: 30,
      conditionJson: { all: [{ field: 'overall_score', operator: 'gte', value: 5 }] },
    },
    { id: 'a', questionKey: 'overall_score', displayOrder: 10, conditionJson: null },
  ];

  it('returns unconditional questions in display order', () => {
    const visible = selectVisibleQuestions(questions, ctx({ overallScore: null }));
    expect(visible.map((q) => q.questionKey)).toEqual(['overall_score', 'comment']);
  });

  it('a five-star guest is not asked what went wrong', () => {
    const visible = selectVisibleQuestions(questions, ctx({ overallScore: 5 }));
    expect(visible.map((q) => q.questionKey)).toEqual([
      'overall_score',
      'positive_topics',
      'comment',
    ]);
  });

  it('a lower score gets the diagnostic follow-up instead', () => {
    const visible = selectVisibleQuestions(questions, ctx({ overallScore: 2 }));
    expect(visible.map((q) => q.questionKey)).toEqual([
      'overall_score',
      'improvement_topics',
      'comment',
    ]);
  });

  it('hides a question whose condition is malformed', () => {
    const broken = [
      { id: 'x', questionKey: 'broken', displayOrder: 5, conditionJson: { operator: 'nope' } },
    ];
    expect(selectVisibleQuestions(broken, ctx({ overallScore: 3 }))).toEqual([]);
  });

  it('is deterministic — the same input always gives the same questionnaire', () => {
    const first = selectVisibleQuestions(questions, ctx({ overallScore: 3 }));
    const second = selectVisibleQuestions(questions, ctx({ overallScore: 3 }));
    expect(first.map((q) => q.id)).toEqual(second.map((q) => q.id));
  });
});

describe('resolveAssignmentForLocation', () => {
  const LOCATION = 'loc-1';
  const OTHER = 'loc-2';
  const now = new Date('2026-08-05T12:00:00Z');
  const base = { status: 'active' as const, activeFrom: '2026-01-01T00:00:00Z', activeUntil: null };

  it('falls back to the organization-wide assignment', () => {
    const result = resolveAssignmentForLocation(
      [{ id: 'org', locationId: null, questionnaireVersionId: 'v1', ...base }],
      LOCATION,
      now,
    );
    expect(result?.questionnaireVersionId).toBe('v1');
  });

  it('prefers the location-specific assignment', () => {
    const result = resolveAssignmentForLocation(
      [
        { id: 'org', locationId: null, questionnaireVersionId: 'v1', ...base },
        { id: 'own', locationId: LOCATION, questionnaireVersionId: 'v2', ...base },
      ],
      LOCATION,
      now,
    );
    expect(result?.questionnaireVersionId).toBe('v2');
  });

  it('ignores another location assignment', () => {
    const result = resolveAssignmentForLocation(
      [{ id: 'other', locationId: OTHER, questionnaireVersionId: 'v9', ...base }],
      LOCATION,
      now,
    );
    expect(result).toBeNull();
  });

  it('ignores inactive assignments', () => {
    const result = resolveAssignmentForLocation(
      [{ id: 'org', locationId: null, questionnaireVersionId: 'v1', ...base, status: 'inactive' }],
      LOCATION,
      now,
    );
    expect(result).toBeNull();
  });

  it('respects the active period at both ends', () => {
    const notYet = resolveAssignmentForLocation(
      [
        {
          id: 'future',
          locationId: null,
          questionnaireVersionId: 'v1',
          status: 'active',
          activeFrom: '2026-09-01T00:00:00Z',
          activeUntil: null,
        },
      ],
      LOCATION,
      now,
    );
    expect(notYet).toBeNull();

    const expired = resolveAssignmentForLocation(
      [
        {
          id: 'past',
          locationId: null,
          questionnaireVersionId: 'v1',
          status: 'active',
          activeFrom: '2026-01-01T00:00:00Z',
          activeUntil: '2026-02-01T00:00:00Z',
        },
      ],
      LOCATION,
      now,
    );
    expect(expired).toBeNull();
  });

  it('returns null when nothing is assigned', () => {
    expect(resolveAssignmentForLocation([], LOCATION, now)).toBeNull();
  });
});
