/**
 * The link toolbar's "Card view" / "Embed view" conversions are creation
 * tools: they must vanish when the host switched the target block's tooling
 * off. Under the reversed flag contract (ADR 0009) a flag gates the block's
 * view extension, so the observable signal is `std.getView(flavour)` — a
 * conversion whose target has no registered view would replace the link with
 * a block that paints as nothing.
 */
import {
  EmbedIframeService,
  EmbedOptionProvider,
  type ToolbarAction,
  type ToolbarActionGroup,
  type ToolbarContext,
} from '@labre/affine-shared/services';
import { describe, expect, it } from 'vitest';

import { AffineLink } from '../link-node/affine-link.js';
import { builtinInlineLinkToolbarConfig } from '../link-node/configs/toolbar.js';

const URL = 'https://labre.example/doc';

type Setup = {
  /** Flavours whose view extension is registered. */
  views: string[];
  /** What `EmbedOptionProvider` answers for the url. */
  options?: { flavour: string; viewType: 'card' | 'embed' };
  /** Whether `EmbedIframeService` can embed the url. */
  iframe?: boolean;
};

function contextFor({ views, options, iframe = false }: Setup) {
  // A link node that never touched the DOM: `instanceof` is all the config
  // checks, the rest are plain readable fields.
  const target = Object.create(AffineLink.prototype);
  Object.defineProperties(target, {
    link: { value: URL },
    block: { value: { model: { parent: {}, flavour: 'affine:paragraph' } } },
    inlineEditor: { value: {} },
    selfInlineRange: { value: { index: 0, length: 1 } },
  });

  return {
    message$: { peek: () => ({ element: target }) },
    std: {
      getView: (flavour: string) =>
        views.includes(flavour) ? () => null : null,
      get: (id: unknown) => {
        if (id === EmbedOptionProvider) {
          return { getEmbedBlockOptions: () => options ?? null };
        }
        if (id === EmbedIframeService) return { canEmbed: () => iframe };
        throw new Error(`unexpected provider ${String(id)}`);
      },
    },
  } as unknown as ToolbarContext;
}

const group = builtinInlineLinkToolbarConfig.actions.find(
  action => action.id === 'c.conversions'
) as ToolbarActionGroup<ToolbarAction>;

function offered(ctx: ToolbarContext, id: string) {
  const action = group.actions.find(action => action.id === id)!;
  return typeof action.when === 'function' ? action.when(ctx) : action.when;
}

describe('link toolbar conversions honor block flags', () => {
  it('offers Card view when the bookmark view is registered', () => {
    expect(offered(contextFor({ views: ['affine:bookmark'] }), 'card')).toBe(
      true
    );
  });

  it('hides Card view when the bookmark view is off', () => {
    expect(offered(contextFor({ views: [] }), 'card')).toBe(false);
  });

  it('gates Card view on the embed flavour it would actually create', () => {
    const options = {
      flavour: 'affine:embed-github',
      viewType: 'card',
    } as const;
    expect(
      offered(contextFor({ views: ['affine:bookmark'], options }), 'card')
    ).toBe(false);
    expect(
      offered(contextFor({ views: ['affine:embed-github'], options }), 'card')
    ).toBe(true);
  });

  it('offers Embed view for an embed block whose view is registered', () => {
    const options = {
      flavour: 'affine:embed-youtube',
      viewType: 'embed',
    } as const;
    expect(
      offered(contextFor({ views: ['affine:embed-youtube'], options }), 'embed')
    ).toBe(true);
    expect(offered(contextFor({ views: [], options }), 'embed')).toBe(false);
  });

  it('offers Embed view for an iframe only with the iframe view', () => {
    expect(
      offered(
        contextFor({ views: ['affine:embed-iframe'], iframe: true }),
        'embed'
      )
    ).toBe(true);
    expect(offered(contextFor({ views: [], iframe: true }), 'embed')).toBe(
      false
    );
  });

  it('never offers Embed view for a url nothing can embed', () => {
    expect(
      offered(
        contextFor({ views: ['affine:embed-iframe', 'affine:embed-youtube'] }),
        'embed'
      )
    ).toBe(false);
  });
});
