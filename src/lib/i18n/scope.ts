import type { Messages } from './messages/en';

/**
 * Message scopes.
 *
 * Client Components cannot read the catalogue directly, so a server layout has
 * to hand it across the boundary — and everything handed across is serialised
 * into the HTML. Sending the whole catalogue put every portal string, including
 * role labels and portal error messages, into the public homepage payload.
 *
 * So each surface gets only the slices it uses. This is mostly about weight on
 * the consumer pages, which the design system expects to work on older phones
 * and slow connections, and partly about not publishing internal copy for no
 * reason.
 *
 * The `satisfies` checks below keep the picks honest: a slice added to one scope
 * that does not exist in `Messages` is a type error.
 */

const PUBLIC_KEYS = ['brand', 'common', 'marketing', 'guest'] as const satisfies readonly (keyof Messages)[];

const PORTAL_KEYS = [
  'brand',
  'common',
  'auth',
  'nav',
  'roles',
  'status',
  'overview',
  'locations',
  'readiness',
  'users',
  'errors',
  'platform',
  'results',
  'qr',
  'questionnaires',
  'campaigns',
] as const satisfies readonly (keyof Messages)[];

export type PublicMessages = Pick<Messages, (typeof PUBLIC_KEYS)[number]>;
export type PortalMessages = Pick<Messages, (typeof PORTAL_KEYS)[number]>;

function pick<K extends keyof Messages>(messages: Messages, keys: readonly K[]): Pick<Messages, K> {
  const result = {} as Pick<Messages, K>;
  for (const key of keys) result[key] = messages[key];
  return result;
}

export function pickPublicMessages(messages: Messages): PublicMessages {
  return pick(messages, PUBLIC_KEYS);
}

export function pickPortalMessages(messages: Messages): PortalMessages {
  return pick(messages, PORTAL_KEYS);
}
