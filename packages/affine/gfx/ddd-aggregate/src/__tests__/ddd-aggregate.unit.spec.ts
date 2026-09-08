import { contextMapTemplateCategory } from '@labre/affine-gfx-ddd-context-map';
import { coreDomainTemplateCategory } from '@labre/affine-gfx-ddd-core-domain';
import { eventStormingTemplateCategory } from '@labre/affine-gfx-ddd-event-storming';
import { describe, expect, it } from 'vitest';

import { aggregateTemplateCategory } from '../templates';

describe('aggregate template category', () => {
  it('exposes a single Aggregate Design Canvas template', () => {
    expect(aggregateTemplateCategory.name).toBe('Aggregate Design Canvas');
    const names = (
      aggregateTemplateCategory.templates as { name?: string }[]
    ).map(t => t.name);
    expect(names).toEqual(['Aggregate Design Canvas']);
  });
});

/**
 * The three senior-button categories now live beside the commands they derive
 * from, and this package is what registers all four under `ddd-templates`. The
 * check is on the import path as much as on the names: a section that stops
 * reaching this file stops reaching the Templates panel.
 */
describe('the three senior-button categories reach the registrar', () => {
  it('arrive under the names the panel shows', () => {
    expect(eventStormingTemplateCategory.name).toBe('Event Storming');
    expect(coreDomainTemplateCategory.name).toBe('Core Domain Chart');
    expect(contextMapTemplateCategory.name).toBe('Context Map');
  });

  it('each ships at least one template', () => {
    for (const category of [
      eventStormingTemplateCategory,
      coreDomainTemplateCategory,
      contextMapTemplateCategory,
    ]) {
      expect(
        (category.templates as { name?: string }[]).length,
        category.name
      ).toBeGreaterThan(0);
    }
  });
});
