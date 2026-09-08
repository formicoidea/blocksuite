import { snapshotFromAction } from '@labre/affine-gfx-template';
import type { C4BoundaryVariant, C4NodeKind } from '@labre/affine-model';
import type { CommandInvocation } from '@labre/std';
import { describe, expect, it } from 'vitest';

import { c4Commands } from '../commands';
import { BOUNDARY_LABEL, NODE_LABEL } from '../consts';
import { C4_BOUNDARY_ROLE, C4_ROLE } from '../roles';
import { c4TemplateCategory } from '../templates';
import { C4_TYPE_PLACEHOLDER } from '../type-line';

/**
 * The guard C4's palette is born with: **a template must be what its command
 * draws.**
 *
 * C4 shipped on 28/08/2026 with no Templates category at all — the only
 * framework without one — and the audit of 09/09/2026 spelled out why writing
 * one by hand would have been the wrong fix: a component is FIVE elements whose
 * painting order, roles and verbatim placeholders all have to agree with
 * `actions.ts`, and every other framework's hand-written palette had already
 * drifted from its toolbox. So the category is DERIVED, and this file re-runs
 * each command against the same recording surface and compares.
 *
 * Nothing here is hand-authored, which is what {@link HAND_AUTHORED} being empty
 * says: C4 ships no composed scene, so every template in the panel is a command.
 */

/** A template's stored snapshot, as far as this file reads it. */
type Snapshot = {
  blocks: { children: { props: { elements: Record<string, RawElement> } }[] };
};

type RawElement = {
  type?: string;
  kind?: string;
  role?: string;
  variant?: string;
  name?: string;
  index?: string;
  text?: { delta?: { insert?: string }[] };
  children?: { json?: Record<string, boolean> };
};

/**
 * The invocation a derived template is recorded under.
 *
 * Any value does: a C4 command's `run` hands the `GfxController` to its action
 * and reads nothing else off the invocation. Spelled out rather than cast, so
 * the day one does the failure is a comparison rather than a crash.
 */
const INVOCATION: CommandInvocation = {
  surface: 'senior-menu',
  source: 'internal',
};

/**
 * The templates written by hand — none.
 *
 * C4's palette is thirteen commands, twelve of which DRAW something; the
 * thirteenth arms the connector tool and has no artefact to record. There is no
 * composed scene to hand-author, so this list is empty and a future entry that
 * is not derived has to declare itself here.
 */
const HAND_AUTHORED: string[] = [];

const shipped = c4TemplateCategory.templates;
if (typeof shipped === 'function') {
  throw new Error('the C4 template category is expected to be eager');
}
const templates = shipped;

const elementsOf = (template: (typeof templates)[number]) =>
  (template.content as unknown as Snapshot).blocks.children[0].props.elements;

const named = (name: string) => {
  const found = templates.find(template => template.name === name);
  if (!found) throw new Error(`no template named "${name}"`);
  return elementsOf(found);
};

const textOf = (element: RawElement) =>
  (element.text?.delta ?? []).map(op => op.insert ?? '').join('');

describe('the C4 palette covers the toolbox', () => {
  const artefacts = c4Commands.filter(command => command.kind === 'artefact');

  it('ships one derived template per artefact command', () => {
    expect(artefacts.length).toBeGreaterThan(0);
    for (const command of artefacts) {
      const derived = templates.filter(
        template => template.commandId === command.id
      );
      expect(
        derived.map(template => template.name),
        `templates for ${command.id}`
      ).toHaveLength(1);
    }
  });

  it('names every template that is NOT derived', () => {
    const free = templates
      .filter(template => template.commandId === undefined)
      .map(template => template.name);
    expect([...free].sort()).toEqual([...HAND_AUTHORED].sort());
  });
});

describe('every derived template is what its command draws', () => {
  for (const template of templates) {
    if (template.commandId === undefined) continue;
    const command = c4Commands.find(entry => entry.id === template.commandId);

    it(`${template.name} re-runs identically`, () => {
      expect(command, template.commandId).toBeDefined();
      expect(template.content).toEqual(
        snapshotFromAction(
          std => command!.run(std, INVOCATION),
          template.name ?? 'Template'
        )
      );
    });
  }
});

/**
 * The component, spelled out: the one artefact of this pack a hand-written
 * template would have got wrong, in five different ways at once.
 */
describe('a component template is the five elements the button draws', () => {
  const KINDS: [string, C4NodeKind][] = [
    ['Person', 'person'],
    ['Person (external)', 'person-ext'],
    ['Software system', 'system'],
    ['Software system (external)', 'system-ext'],
    ['Container', 'container'],
    ['Component', 'component'],
    ['Database', 'database'],
    ['Mobile app', 'mobile'],
    ['Web browser', 'browser'],
  ];

  for (const [name, kind] of KINDS) {
    describe(name, () => {
      const elements = named(name);
      const entries = Object.entries(elements);
      const of = (role: string) =>
        entries.find(([, element]) => element.role === role);

      it('is a bodyless shape, three tiers and the group over them', () => {
        expect(entries).toHaveLength(5);

        const shape = entries.find(([, el]) => el.type === 'c4Node');
        const group = entries.find(([, el]) => el.type === 'group');
        expect(shape && group).toBeTruthy();

        // NO text on the shape: the name is the `c4:title` child, and the shape
        // is a body and nothing else (`actions.ts`).
        expect(shape![1].kind).toBe(kind);
        expect(shape![1].text).toBeUndefined();

        // The wrapper round a box is not a second box (`roles.ts`).
        expect(group![1].role).toBeUndefined();
      });

      it('writes the three tiers with the stencil’s own prompts', () => {
        const title = of(C4_ROLE.title);
        const typeLine = of(C4_ROLE['type-line']);
        const description = of(C4_ROLE.description);
        expect(title && typeLine && description).toBeTruthy();

        for (const tier of [title!, typeLine!, description!]) {
          expect(tier[1].type, tier[0]).toBe('text');
        }
        expect(textOf(title![1])).toBe(NODE_LABEL[kind]);
        // Verbatim, or the exporter reads a technology called "technology".
        expect(textOf(typeLine![1])).toBe(C4_TYPE_PLACEHOLDER[kind]);
      });

      it('stacks the four in creation order', () => {
        const shape = entries.find(([, el]) => el.type === 'c4Node')!;
        const indexes = [
          shape,
          of(C4_ROLE.title)!,
          of(C4_ROLE['type-line'])!,
          of(C4_ROLE.description)!,
        ].map(([id, element]) => {
          expect(element.index, `index of ${id}`).toBeTypeOf('string');
          return element.index!;
        });
        expect([...indexes].sort()).toEqual(indexes);
      });

      it('groups exactly those four and nothing else', () => {
        const group = entries.find(([, el]) => el.type === 'group')!;
        const members = [
          entries.find(([, el]) => el.type === 'c4Node')!,
          of(C4_ROLE.title)!,
          of(C4_ROLE['type-line'])!,
          of(C4_ROLE.description)!,
        ].map(([id]) => id);
        expect(Object.keys(group[1].children?.json ?? {}).sort()).toEqual(
          [...members].sort()
        );
      });
    });
  }
});

/**
 * The warning `createC4Boundary` writes to the attention of a template, honoured:
 * the child role and the variant are two spellings of one fact, and a boundary
 * that carried one without the other would paint one thing and be judged as
 * another.
 */
describe('a boundary template writes the role AND the variant', () => {
  const VARIANTS: [string, C4BoundaryVariant][] = [
    ['System boundary', 'system'],
    ['Container boundary', 'container'],
  ];

  for (const [name, variant] of VARIANTS) {
    it(`${name} says "${variant}" twice`, () => {
      const entries = Object.entries(named(name));
      expect(entries).toHaveLength(1);
      const [, boundary] = entries[0];
      expect(boundary.type).toBe('c4Boundary');
      expect(boundary.variant).toBe(variant);
      expect(boundary.role).toBe(C4_BOUNDARY_ROLE[variant]);
      expect(boundary.name).toBe(BOUNDARY_LABEL[variant]);
    });
  }
});

/**
 * The sheet. Its name is seeded through `translateKey`, and the recording `std`
 * offers no i18n service — so a derived board carries the English fallback,
 * which is what a host with no catalogue would draw anyway.
 */
describe('the board template', () => {
  it('is one sheet, named in the English fallback', () => {
    const entries = Object.entries(named('C4 board'));
    expect(entries).toHaveLength(1);
    const [, board] = entries[0];
    expect(board.type).toBe('c4Board');
    expect(board.role).toBe(C4_ROLE.board);
    expect(board.name).toBe('C4 diagram');
  });
});
