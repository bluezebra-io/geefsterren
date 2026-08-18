import { Button } from '@/components/ui/button';

/**
 * Shown when platform staff are inside an organization they do not belong to.
 *
 * Amber, because it marks both a state and the action that leaves it. Anyone
 * working outside their own tenant should never have to wonder whose data is on
 * screen.
 */
export function PlatformContextBanner({
  message,
  exitLabel,
}: {
  message: string;
  exitLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 bg-[var(--color-surface-brand-soft)] px-8 py-3">
      <p className="text-sm font-medium text-amber-800">{message}</p>
      <form method="post" action="/api/portal/organization" className="shrink-0">
        <input type="hidden" name="intent" value="exit" />
        <Button type="submit" variant="outline" size="sm">
          {exitLabel}
        </Button>
      </form>
    </div>
  );
}
