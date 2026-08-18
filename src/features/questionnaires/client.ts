import type { ResolvedQuestion } from '@/features/feedback/resolve';

import { selectVisibleQuestions } from './service';

/**
 * Client-side view of the branching.
 *
 * Deliberately the *same* evaluator the server uses. If the browser decided
 * visibility on its own, the flow could show a question the server then refuses
 * to store, and the guest would never know their answer was dropped.
 *
 * This is only a convenience wrapper; the server re-evaluates on submit, because
 * anything the browser sends is a suggestion.
 */
export function questionsForScoreClient(
  questions: ResolvedQuestion[],
  overallScore: number | null,
  selections: Record<string, string[]>,
): ResolvedQuestion[] {
  return selectVisibleQuestions(questions, { overallScore, answers: selections });
}
