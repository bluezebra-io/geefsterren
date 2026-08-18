import { Star } from '@/components/ui/logo';
import { Badge, Card, CardBody, CardHeader, CardSubtitle, CardTitle, EmptyState } from '@/components/ui';
import type { QuestionResult } from '@/features/feedback/queries';
import type { PortalMessages } from '@/lib/i18n/scope';
import { cn } from '@/lib/utils';

/**
 * Results per question.
 *
 * Two rules from the design system are load-bearing here:
 *
 * - Every number carries its base. A conditional question is only asked of some
 *   respondents, so a share is of the people who answered *that* question, and
 *   the count it is based on is printed beside it. Without that, "37%" on a
 *   follow-up looks like 37% of all guests.
 * - A low score is data, not an error, so the score distribution never uses
 *   coral. The rating scale keeps its own ramp and the bars stay ink.
 */

const RATING_COLOUR: Record<number, string> = {
  1: 'var(--color-rating-1)',
  2: 'var(--color-rating-2)',
  3: 'var(--color-rating-3)',
  4: 'var(--color-rating-4)',
  5: 'var(--color-rating-5)',
};

function Bar({ share, tone = 'ink' }: { share: number; tone?: 'ink' | 'amber' }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-cream-200">
      <div
        className={cn('h-full rounded-full', tone === 'amber' ? 'bg-amber-500' : 'bg-ink-700')}
        style={{ width: `${Math.max(0, Math.min(100, share))}%` }}
      />
    </div>
  );
}

export function QuestionResults({
  results,
  t,
  totalResponses,
}: {
  results: QuestionResult[];
  t: PortalMessages;
  totalResponses: number;
}) {
  if (results.length === 0) {
    return (
      <EmptyState title={t.results.emptyTitle} description={t.results.emptyBody} />
    );
  }

  return (
    <div className="space-y-5">
      {results.map((question) => {
        const answered = question.respondentCount;
        const isRating = question.questionType === 'rating';
        const isFreeText = question.questionType === 'long_text' || question.questionType === 'short_text';

        return (
          <Card key={question.questionId}>
            <CardHeader>
              <div className="min-w-0">
                <CardTitle>{question.label}</CardTitle>
                <CardSubtitle>
                  {/* The evidence line the design system requires on every number. */}
                  {t.results.basedOn
                    .replace('{answered}', String(answered))
                    .replace('{total}', String(totalResponses))}
                </CardSubtitle>
              </div>
              {question.category ? <Badge tone="neutral">{question.category}</Badge> : null}
            </CardHeader>

            <CardBody>
              {answered === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)]">{t.results.noAnswers}</p>
              ) : isRating ? (
                <div className="flex items-baseline gap-3">
                  <Star className="size-6 text-[var(--color-rating-star)]" />
                  <span className="tabular text-4xl leading-none font-bold tracking-snug text-[var(--color-text-primary)]">
                    {question.averageRating?.toLocaleString('nl-NL', {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}
                  </span>
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {t.results.averageOfFive}
                  </span>
                </div>
              ) : isFreeText ? (
                <p className="tabular text-sm text-[var(--color-text-secondary)]">
                  {t.results.writtenAnswers.replace('{count}', String(answered))}
                </p>
              ) : (
                <ul className="space-y-3">
                  {[...question.options]
                    .sort((a, b) => b.count - a.count)
                    .map((option) => (
                      <li key={option.optionId}>
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="text-sm text-[var(--color-text-primary)]">
                            {option.label}
                          </span>
                          <span className="tabular shrink-0 text-sm text-[var(--color-text-secondary)]">
                            {option.count}
                            {option.share === null
                              ? null
                              : ` · ${option.share.toLocaleString('nl-NL', {
                                  maximumFractionDigits: 1,
                                })}%`}
                          </span>
                        </div>
                        <div className="mt-1.5">
                          <Bar share={option.share ?? 0} />
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}

/** Score distribution, 1 to 5, with the rating ramp. */
export function ScoreDistribution({
  distribution,
  total,
  t,
}: {
  distribution: Array<{ score: 1 | 2 | 3 | 4 | 5; count: number }>;
  total: number;
  t: PortalMessages;
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{t.results.distributionTitle}</CardTitle>
          <CardSubtitle>
            {t.results.basedOn.replace('{answered}', String(total)).replace('{total}', String(total))}
          </CardSubtitle>
        </div>
      </CardHeader>
      <CardBody>
        <ul className="space-y-3">
          {[...distribution].reverse().map((entry) => {
            const share = total > 0 ? (entry.count / total) * 100 : 0;
            return (
              <li key={entry.score} className="flex items-center gap-3">
                <span className="tabular flex w-10 shrink-0 items-center gap-1 text-sm font-semibold text-[var(--color-text-secondary)]">
                  {entry.score}
                  <Star className="size-3.5" style={{ color: RATING_COLOUR[entry.score] }} />
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-cream-200">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${share}%`, background: RATING_COLOUR[entry.score] }}
                  />
                </div>
                <span className="tabular w-20 shrink-0 text-right text-sm text-[var(--color-text-secondary)]">
                  {entry.count} · {share.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}%
                </span>
              </li>
            );
          })}
        </ul>
      </CardBody>
    </Card>
  );
}
