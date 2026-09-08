import { ViewExtensionProvider } from '@labre/affine-ext-loader';
import { extendTemplateCategory } from '@labre/affine-gfx-template';

import { aggregateTemplateCategory } from './templates';

/**
 * The Aggregate Design Canvas category — flag-gated (`ddd-templates`).
 *
 * ONLY this one. The three senior-button categories (Event Storming, Core
 * Domain Chart, Context Map) are registered by the framework that owns the
 * commands they derive from, under that framework's own flag, exactly like
 * Wardley, C4, BPMN or EDGY do. This package used to register all four, which
 * made the aggregate bundle import three sibling FRAMEWORK bundles — a
 * dependency the bundle layout does not allow (a framework bundle depends on
 * core and on shared bundles only, `scripts/build-bundles.mjs`), and the
 * publish of 0.38.0 stopped on it.
 */
export class DddTemplatesViewExtension extends ViewExtensionProvider {
  override name = 'affine-ddd-templates';

  override effect(): void {
    super.effect();
    extendTemplateCategory(aggregateTemplateCategory);
  }
}
