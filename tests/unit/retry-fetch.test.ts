import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchWithClockSkewRetry } from '@/lib/supabase/retry-fetch';

const SKEW_BODY = JSON.stringify({
  code: 'PGRST303',
  details: null,
  hint: null,
  message: 'JWT issued at future',
});

function skew() {
  return new Response(SKEW_BODY, { status: 401 });
}

/** Runs the call with timers faked, so the backoff costs no real time. */
async function call(init?: RequestInit) {
  const promise = fetchWithClockSkewRetry('http://db.test/rest/v1/organizations', init);
  await vi.runAllTimersAsync();
  return promise;
}

describe('fetchWithClockSkewRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('retries a clock-skew rejection and returns the successful retry', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(skew())
      .mockResolvedValueOnce(new Response('[{"id":"1"}]', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const response = await call();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe('[{"id":"1"}]');
  });

  it('gives up after two retries rather than looping', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async () => skew());
    vi.stubGlobal('fetch', fetchMock);

    const response = await call();

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(response.status).toBe(401);
  });

  it('passes a genuine 401 straight through with its body intact', async () => {
    // Reading the body to inspect the code consumes it, so this pins that the caller still gets it.
    const body = JSON.stringify({ code: 'PGRST301', message: 'JWT expired' });
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(body, { status: 401 }));
    vi.stubGlobal('fetch', fetchMock);

    const response = await call();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(401);
    await expect(response.text()).resolves.toBe(body);
  });

  it('does not retry other failures', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('{"code":"42501"}', { status: 403 }));
    vi.stubGlobal('fetch', fetchMock);

    expect((await call()).status).toBe(403);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not replay a streamed body', async () => {
    // Sending it twice is impossible, so retrying would fail in a more confusing way than the 401.
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(skew());
    vi.stubGlobal('fetch', fetchMock);

    const response = await call({ method: 'POST', body: new ReadableStream() });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(401);
  });
});
