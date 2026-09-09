import { Container, DuplicateServiceDefinitionError } from '@labre/global/di';
import type { BlockStdScope } from '@labre/std';
import { describe, expect, it } from 'vitest';

import {
  TemplateCategoryExtension,
  templateManagerFor,
} from '../contribute.js';
import type { Template, TemplateCategory } from '../toolbar/template-type.js';

/**
 * The contribution seam itself, away from any framework: what a category
 * registered on a container does to the catalogue ONE editor reads.
 *
 * The two shapes of `TemplateCategory.templates` are both exercised, because
 * they are both shipped — a hand-written pack is an array, a derived one
 * (`snapshotFromAction`) is a thunk that builds its snapshots on demand — and
 * the manager is the only place that has to stop caring which it got.
 */

const template = (name: string): Template => ({
  name,
  content: {},
  type: 'template',
});

/** A pack written out, the way `builtin/other.ts` does it. */
const eager: TemplateCategory = {
  name: 'Eager',
  templates: [template('Xyzzy diagram'), template('Plain rectangle')],
};

/** A pack built on demand, the way a framework's derived templates are. */
const lazy: TemplateCategory = {
  name: 'Lazy',
  templates: () => Promise.resolve([template('Lazy xyzzy')]),
};

/** A container with those two categories on it, and the std that reads it. */
function stdWith(...categories: TemplateCategory[]) {
  const container = new Container();
  TemplateCategoryExtension(...categories).setup(container);
  return { provider: container.provider() } as unknown as BlockStdScope;
}

describe('templateManagerFor', () => {
  it('lists the built-in categories first, then the contributed ones', async () => {
    // `Other` is not contributed by anyone and is always there; the two
    // registered categories follow, in registration order. That order is the
    // panel's tab order, so the generic diagrams stay on the left whatever a
    // framework adds.
    const catalogue = templateManagerFor(stdWith(eager, lazy));

    expect(await catalogue.categories()).toEqual(['Other', 'Eager', 'Lazy']);
  });

  it('lists a contributed category, whichever shape its pack has', async () => {
    const catalogue = templateManagerFor(stdWith(eager, lazy));

    expect((await catalogue.list('Eager')).map(t => t.name)).toEqual([
      'Xyzzy diagram',
      'Plain rectangle',
    ]);
    // The thunk is awaited, not returned — a caller never learns which of the
    // two shapes it was handed.
    expect((await catalogue.list('Lazy')).map(t => t.name)).toEqual([
      'Lazy xyzzy',
    ]);
  });

  it('still delegates an unknown name to the built-in catalogue', async () => {
    // `Other` is the case that matters: the manager owns only what the
    // container gave it, and everything else is a question for
    // `builtInTemplates` — including a host's `extend(...)` categories, which
    // are built in as far as this seam is concerned.
    const catalogue = templateManagerFor(stdWith(eager));

    expect((await catalogue.list('Other')).length).toBeGreaterThan(0);
  });

  it('searches both halves, case-insensitively, by substring', async () => {
    const catalogue = templateManagerFor(stdWith(eager, lazy));

    // Two hits across two categories, and the keyword matches in the middle of
    // a name: the panel's search box is a substring filter, not a prefix one.
    expect((await catalogue.search('XYZ')).map(t => t.name)).toEqual([
      'Xyzzy diagram',
      'Lazy xyzzy',
    ]);
  });

  it('restricts a search to one category when it is named', async () => {
    const catalogue = templateManagerFor(stdWith(eager, lazy));

    expect((await catalogue.search('xyzzy', 'Lazy')).map(t => t.name)).toEqual([
      'Lazy xyzzy',
    ]);
    // …and a name nobody registered narrows to nothing rather than falling back
    // to the whole catalogue.
    expect(await catalogue.search('xyzzy', 'Nowhere')).toEqual([]);
  });
});

describe('TemplateCategoryExtension', () => {
  it('refuses two extensions claiming the same category name', () => {
    // One identifier per NAME is what keeps the panel from showing a category
    // twice — and it fails at SETUP, loudly, rather than by listing it twice.
    // The hazard is real: 0.38.0 shipped a package registering the three DDD
    // categories its siblings also own.
    const container = new Container();
    TemplateCategoryExtension(eager).setup(container);

    expect(() =>
      TemplateCategoryExtension({ name: 'Eager', templates: [] }).setup(
        container
      )
    ).toThrowError(DuplicateServiceDefinitionError);
  });
});
