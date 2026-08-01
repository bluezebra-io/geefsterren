/**
 * Host classification.
 *
 * One deployment serves the marketing site, the public feedback flow and the portal. Which of the
 * three a request belongs to is decided here, from the Host header.
 *
 * The location is never derived from the hostname — only from a QR token or explicit, authorised
 * portal context. There are no location subdomains.
 */

export type HostKind = 'marketing' | 'portal';

function hostnameOf(value: string | undefined | null): string {
  if (!value) return '';
  // Strip the port: `app.geefsterren.nl:3000` and `app.geefsterren.nl` are the same host.
  return value.split(':')[0].trim().toLowerCase();
}

/**
 * Portal hosts are matched by exact hostname rather than by a `startsWith('app.')` test, so a
 * lookalike such as `app.geefsterren.nl.attacker.com` cannot be mistaken for the portal.
 */
export function classifyHost(hostHeader: string | undefined | null, portalUrl: string): HostKind {
  const host = hostnameOf(hostHeader);
  if (!host) return 'marketing';

  const configuredPortalHost = hostnameOf(safeHostname(portalUrl));
  if (configuredPortalHost && host === configuredPortalHost) return 'portal';

  // Local development conveniences. `localhost` alone is the marketing host so both surfaces are
  // reachable without editing /etc/hosts.
  if (host === 'app.localhost' || host === 'portal.localhost') return 'portal';

  return 'marketing';
}

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}
