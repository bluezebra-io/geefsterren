import { exitOrganizationAction } from '@/features/organizations/actions';
import { Button } from '@/components/ui/button';

/**
 * Shown when platform staff are inside an organization they do not belong to.
 *
 * Amber, because it marks an action and a state the user must be able to leave.
 * Anyone acting outside their own tenant should never have to wonder whose data
 * is on screen.
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
      <form action={exitOrganizationAction}>
        <Button type="submit" variant="outline" size="sm">
          {exitLabel}
        </Button>
      </form>
    </div>
  );
}
