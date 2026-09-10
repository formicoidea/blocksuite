import { afterEach, describe, expect, it } from 'vitest';

import {
  defaultImageProxyMiddleware,
  ImageProxyService,
} from '../../../adapters/middlewares/proxy';
import { DEFAULT_IMAGE_PROXY_ENDPOINT } from '../../../consts';

/**
 * `ImageProxyService` is the ONE seam governing every remote-image fetch the
 * library performs on the host's behalf (link-card favicons and og:images,
 * image import, canvas export — see `docs/integrate/04-host-seams.md`). Two
 * contracts are pinned here:
 *
 * - an empty proxy means « fetch direct »: `buildUrl` hands the image URL
 *   back untouched instead of producing a dangling `?url=…`;
 * - the default transformer middleware reads the proxy URL at run time, so a
 *   `setImageProxyURL` made after module load reaches every job that uses it
 *   (it used to capture the module-load value forever).
 */
const REMOTE = 'https://example.com/a.png';
const service = () => new ImageProxyService({} as never);
const configsOf = (middleware: typeof defaultImageProxyMiddleware) => {
  const adapterConfigs = new Map<string, string>();
  middleware({ adapterConfigs } as never);
  return adapterConfigs;
};

// The middleware URL is module-wide: every test starts from the default.
afterEach(() => {
  service().setImageProxyURL(DEFAULT_IMAGE_PROXY_ENDPOINT);
});

describe('ImageProxyService.buildUrl', () => {
  it('routes through the proxy by default', () => {
    expect(service().buildUrl(REMOTE)).toBe(
      `${DEFAULT_IMAGE_PROXY_ENDPOINT}?url=${encodeURIComponent(REMOTE)}`
    );
  });

  it('does not proxy twice', () => {
    const svc = service();
    const proxied = svc.buildUrl(REMOTE);
    expect(svc.buildUrl(proxied)).toBe(proxied);
  });

  it('returns the URL untouched when the proxy is empty', () => {
    const svc = service();
    svc.setImageProxyURL('');
    expect(svc.buildUrl(REMOTE)).toBe(REMOTE);
  });
});

describe('defaultImageProxyMiddleware', () => {
  it('sets the default proxy until told otherwise', () => {
    expect(configsOf(defaultImageProxyMiddleware).get('imageProxy')).toBe(
      DEFAULT_IMAGE_PROXY_ENDPOINT
    );
  });

  it('follows setImageProxyURL made after module load', () => {
    service().setImageProxyURL('');
    expect(configsOf(defaultImageProxyMiddleware).get('imageProxy')).toBe('');

    service().setImageProxyURL('https://proxy.test/image');
    expect(configsOf(defaultImageProxyMiddleware).get('imageProxy')).toBe(
      'https://proxy.test/image'
    );
  });
});
