import 'server-only';

import { logger } from '@/lib/observability/logger';

/**
 * Backoff before each retry. Two attempts spanning ~1.3s, because the skew this covers is bounded
 * by one second: `iat` is stamped in whole seconds, so the validating clock has to be behind by at
 * most the fraction of a second that was truncated away.
 */
const RETRY_DELAYS_MS = [450, 850];

const CLOCK_SKEW_CODE = 'PGRST303';

/**
 * Retries a request when PostgREST rejects a just-minted token as issued in the future.
 *
 * PostgREST compares a token's `iat` against its own clock. GoTrue stamps `iat` as a whole second,
 * truncating the fraction away, so a validating clock that runs even slightly behind can read a
 * moment *earlier* than the stamp and refuse the token with `PGRST303 JWT issued at future`. It hits
 * the first request after signing in and clears itself a moment later, which is why it presented as
 * "the portal randomly fails": locally it turned a working page into a hard 500 and turned a working
 * form into "Could not create this campaign".
 *
 * Retrying is safe precisely because the request is refused at the JWT gate, before any statement
 * runs — so repeating a write cannot apply it twice. That is why the condition is this narrow: only
 * this code, and only when the body can be sent again. A genuine 401 stays a 401.
 */
export const fetchWithClockSkewRetry: typeof fetch = async (input, init) => {
  let response = await fetch(input, init);

  // A streamed body cannot be sent a second time. supabase-js sends strings, so this is a guard
  // against a future caller rather than a case we expect to hit.
  const replayable =
    init?.body === undefined || init?.body === null || typeof init.body === 'string';

  for (const delay of RETRY_DELAYS_MS) {
    if (response.status !== 401 || !replayable) return response;

    // Recognising the code means reading the body, which consumes it, so an unrelated 401 has to be
    // rebuilt from what was read rather than handed back empty.
    const body = await response.text();
    if (!body.includes(CLOCK_SKEW_CODE)) {
      return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }

    // Logged because persistent drift is an infrastructure fault worth seeing, not a quirk to
    // absorb silently: if this appears often, two machines need their clocks fixed.
    logger.warn('retrying request rejected as issued in the future', { delay_ms: delay });
    await new Promise((resolve) => setTimeout(resolve, delay));
    response = await fetch(input, init);
  }

  if (response.status === 401) {
    logger.error('request still rejected as issued in the future after retries', {
      attempts: RETRY_DELAYS_MS.length + 1,
    });
  }

  return response;
};
