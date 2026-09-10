import type { TransformerMiddleware } from '@labre/store';
import { StoreExtension } from '@labre/store';

import { DEFAULT_IMAGE_PROXY_ENDPOINT } from '../../consts';

export const customImageProxyMiddleware = (
  imageProxyURL: string
): TransformerMiddleware => {
  return ({ adapterConfigs }) => {
    adapterConfigs.set('imageProxy', imageProxyURL);
  };
};

// Module-wide so that transformer jobs built outside a store (playground
// panels, host-side importers) follow `setImageProxyURL` too.
let imageProxyMiddlewareURL = DEFAULT_IMAGE_PROXY_ENDPOINT;

export const setImageProxyMiddlewareURL = (url: string) => {
  imageProxyMiddlewareURL = url;
};

/**
 * Reads the URL at run time: a `setImageProxyURL` made after module load
 * reaches every job using this middleware.
 */
export const defaultImageProxyMiddleware: TransformerMiddleware = ({
  adapterConfigs,
}) => {
  adapterConfigs.set('imageProxy', imageProxyMiddlewareURL);
};

/**
 * The ONE seam governing every remote-image fetch the library performs on the
 * host's behalf: link-card favicons and og:images, image import, canvas
 * PNG/PDF export, copy-as-image. An empty URL means « fetch direct ».
 * See `docs/integrate/04-host-seams.md`.
 */
// TODO(@mirone): this should be configured when setup instead of runtime
export class ImageProxyService extends StoreExtension {
  static override key = 'image-proxy';

  private _imageProxyURL = DEFAULT_IMAGE_PROXY_ENDPOINT;

  setImageProxyURL(url: string) {
    this._imageProxyURL = url;
    setImageProxyMiddlewareURL(url);
  }

  buildUrl(imageUrl: string) {
    if (!this.imageProxyURL || imageUrl.startsWith(this.imageProxyURL)) {
      return imageUrl;
    }

    return `${this.imageProxyURL}?url=${encodeURIComponent(imageUrl)}`;
  }

  get imageProxyURL() {
    return this._imageProxyURL;
  }
}
