import type { LinkPreviewData } from '@labre/affine-model';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { LinkPreviewCacheProvider } from '../../services/link-preview-service/link-preview-cache';
import { LinkPreviewService } from '../../services/link-preview-service/link-preview-service';

const TWEET_URL = 'https://x.com/labre/status/1234567890';

// A cache that never hits, so every query reaches the fetch seam.
const nullCache = (): LinkPreviewCacheProvider => ({
  get: () => undefined,
  set: () => {},
  getPendingRequest: () => undefined,
  setPendingRequest: () => {},
  deletePendingRequest: () => {},
  clear: () => {},
});

const jsonResponse = (body: unknown) => ({
  ok: true,
  json: async () => body,
});

const service = () => new LinkPreviewService(nullCache());

const lastCall = () => {
  const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
  const [url, init] = fetchMock.mock.calls.at(-1) as [string, RequestInit];
  return { url, init };
};

describe('LinkPreviewService fetch seam', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn(async () =>
      jsonResponse({ title: 'ok', tweet: { text: 'hi' } })
    ) as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('injects the host headers on the standard fetch', async () => {
    const s = service();
    s.setEndpoint('https://labre.test/preview');
    s.setHeaders(() => ({ Authorization: 'Bearer jwt' }));

    await s.query('https://example.com');

    const { url, init } = lastCall();
    expect(url).toBe('https://labre.test/preview');
    expect(init.headers).toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer jwt',
    });
  });

  it('awaits an async headers hook', async () => {
    const s = service();
    s.setHeaders(async () => ({ Authorization: 'Bearer async' }));

    await s.query('https://example.com');

    expect(lastCall().init.headers).toMatchObject({
      Authorization: 'Bearer async',
    });
  });

  it('uses a host-configured twitter endpoint and sends the headers there', async () => {
    const s = service();
    s.setTwitterEndpoint('https://labre.test/tweet/');
    s.setHeaders(() => ({ Authorization: 'Bearer jwt' }));

    await s.query(TWEET_URL);

    const { url, init } = lastCall();
    expect(url).toBe('https://labre.test/tweet/1234567890');
    expect(init.headers).toEqual({ Authorization: 'Bearer jwt' });
  });

  it('sends tweet URLs to the standard endpoint when the twitter path is disabled', async () => {
    const s = service();
    s.setEndpoint('https://labre.test/preview');
    s.setTwitterEndpoint(null);

    await s.query(TWEET_URL);

    const { url, init } = lastCall();
    expect(url).toBe('https://labre.test/preview');
    expect(JSON.parse(init.body as string)).toEqual({ url: TWEET_URL });
  });

  it('keeps the default behaviour when nothing is configured', async () => {
    const s = service();

    await s.query('https://example.com');
    expect(lastCall().init.headers).toEqual({
      'Content-Type': 'application/json',
    });

    await s.query(TWEET_URL);
    const tweetCall = lastCall();
    expect(tweetCall.url).toBe('https://api.fxtwitter.com/status/1234567890');
    // The third-party endpoint must never receive the host headers.
    expect(tweetCall.init.headers).toBeUndefined();
  });

  it('never leaks the host headers to the default third-party endpoint', async () => {
    const s = service();
    s.setHeaders(() => ({ Authorization: 'Bearer jwt' }));

    const data: Partial<LinkPreviewData> = await s.query(TWEET_URL);

    expect(lastCall().init.headers).toBeUndefined();
    expect(data.description).toBe('hi');
  });
});
