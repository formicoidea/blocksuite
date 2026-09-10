import { ImageProxyService } from '@labre/affine-shared/adapters';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ExportManager } from '../extensions/export-manager/export-manager.js';

/**
 * The canvas PNG/PDF export rasterises every block with html2canvas and, in
 * `replaceImgSrcWithSvg`, fetches each `<img>` of the clone first. Both
 * resolve the image proxy through {@link ImageProxyService} — the one seam a
 * host uses to say « no third party » (`setImageProxyURL('')`, issue #258).
 * The stub std provides NOTHING but that service: any other lookup throws, so
 * a future private constant or side channel fails loudly here.
 */
const REMOTE = 'https://example.com/a.png';

const stdWith = (imageProxyURL: string) =>
  ({
    get: (key: unknown) => {
      if (key !== ImageProxyService) {
        throw new Error(`unexpected lookup ${String(key)}`);
      }
      return { imageProxyURL };
    },
  }) as never;

const pngResponse = () =>
  new Response(
    new Blob([new Uint8Array([137, 80, 78, 71])], { type: 'image/png' }),
    {
      status: 200,
    }
  );

const withRemoteImage = () => {
  const element = document.createElement('div');
  const img = document.createElement('img');
  img.setAttribute('src', REMOTE);
  element.append(img);
  return element;
};

const fetchedUrls = (spy: { mock: { calls: unknown[][] } }) =>
  spy.mock.calls.map(([input]) => String(input));

describe('ExportManager resolves the image proxy through ImageProxyService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches a remote image from its origin when the proxy is empty', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => pngResponse());

    await new ExportManager(stdWith('')).replaceImgSrcWithSvg(
      withRemoteImage()
    );

    expect(fetchedUrls(fetchSpy)).toEqual([REMOTE]);
    expect(fetchedUrls(fetchSpy).some(url => url.includes('workers.dev'))).toBe(
      false
    );
  });

  it('routes a remote image through the proxy the host configured', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => pngResponse());

    await new ExportManager(
      stdWith('https://proxy.test/image')
    ).replaceImgSrcWithSvg(withRemoteImage());

    expect(fetchedUrls(fetchSpy)).toEqual([
      `https://proxy.test/image?url=${encodeURIComponent(REMOTE)}`,
    ]);
  });
});
