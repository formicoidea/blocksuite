import { ViewExtensionProvider } from '@labre/affine-ext-loader';
import { contextMapTemplateCategory } from '@labre/affine-gfx-ddd-context-map';
import { coreDomainTemplateCategory } from '@labre/affine-gfx-ddd-core-domain';
import { eventStormingTemplateCategory } from '@labre/affine-gfx-ddd-event-storming';
import { extendTemplateCategory } from '@labre/affine-gfx-template';

import { aggregateTemplateCategory } from './templates';

/**
 * DDD Templates sections — flag-gated (`ddd-templates`). Registers ALL four DDD
 * Templates-panel categories (Event Storming, Core Domain Chart, Context Map and
 * the standalone Aggregate Design Canvas) under the single `ddd-templates` flag,
 * so the catalogue stays available even when individual senior buttons are off.
 *
 * The three senior-button categories are imported from the packages that OWN
 * the commands they derive from — a template is the command, so it lives beside
 * it. They used to be built in `ddd-shared`, which is the only reason they could
 * quietly stop being what the toolbox draws.
 */
export class DddTemplatesViewExtension extends ViewExtensionProvider {
  override name = 'affine-ddd-templates';

  override effect(): void {
    super.effect();
    extendTemplateCategory(eventStormingTemplateCategory);
    extendTemplateCategory(coreDomainTemplateCategory);
    extendTemplateCategory(contextMapTemplateCategory);
    extendTemplateCategory(aggregateTemplateCategory);
  }
}
