import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

/**
 * Opens a participant's organization.
 *
 * A plain form post to a route handler, so it needs no client JavaScript and has
 * no hydration to race. See `app/api/portal/organization/route.ts` for why this
 * is not a Server Action.
 */
export function OpenOrganizationButton({
  organizationId,
  label,
}: {
  organizationId: string;
  label: string;
}) {
  return (
    <form method="post" action="/api/portal/organization" className="shrink-0">
      <input type="hidden" name="organizationId" value={organizationId} />
      <Button type="submit" variant="outline" size="sm">
        {label}
        <ArrowRight aria-hidden="true" className="size-4" />
      </Button>
    </form>
  );
}
