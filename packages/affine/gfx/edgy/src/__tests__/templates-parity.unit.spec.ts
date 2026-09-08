import { snapshotFromAction } from '@labre/affine-gfx-template';
import type { EdgyNodeKind } from '@labre/affine-model';
import type { CommandInvocation } from '@labre/std';
import { describe, expect, it } from 'vitest';

import { edgyCommands } from '../commands';
import { EDGY_LABEL_W, edgyNodeProps } from '../presets';
import { EDGY_ROLE } from '../roles';
import { edgyTemplateCategory } from '../templates';

/**
 * The guard the EDGY palette never had: **a template must be what its command
 * draws.**
 *
 * The templates were written in June 2026 and the toolbox kept moving — the
 * base elements gained their `role`, People started travelling grouped with
 * its name, the labels went through the translation seam — and nothing in the
 * repository compared the two. The existing EDGY spec checks that the dynamic
 * template stamps the metamodel and that the illustrations stay neutral; a
 * "People" template producing two loose, role-less elements passed all of it.
 *
 * So: every single-artefact template is DERIVED (`templateFromCommand` runs
 * the command against a recording surface), and this file re-runs the command
 * and compares. The compositions cannot derive — a journey or an org chart is
 * an arrangement of a dozen artefacts, which no one command draws — so they
 * are checked on COMPOSITION instead: the same preset, and the group the
 * toolbox writes around a person and its name.
 */

type Snapshot = {
  blocks: { children: { props: { elements: Record<string, RawElement> } }[] };
};

type RawElement = {
  type?: string;
  kind?: string;
  role?: string;
  shapeType?: string;
  strokeWidth?: number;
  radius?: number;
  xywh?: string;
  children?: { json?: Record<string, boolean> };
};

/**
 * The invocation a derived template is recorded under.
 *
 * Any value does: an EDGY command's `run` hands the `std` to its action and
 * reads nothing else off the invocation, so the recording cannot depend on it.
 */
const INVOCATION: CommandInvocation = {
  surface: 'senior-menu',
  source: 'internal',
};

/**
 * The five templates written by hand, and why each one is.
 *
 * Four are ILLUSTRATIONS — arrangements no command draws, and deliberately
 * neutral drawings the engine never looks at (a decision
 * `edgy-dynamic.unit.spec.ts` pins). The fifth, "EDGY dynamic", is the one
 * template that cannot derive from its command because the command INSERTS IT:
 * `createEdgyDynamic` hands this very snapshot to the template job, so
 * deriving it from itself would be circular. It carries its `commandId` by
 * hand instead, which is what keeps it in the coverage count below.
 */
const HAND_AUTHORED = [
  'Facets overview',
  'Customer journey',
  'Service blueprint',
  'Organisation chart',
];

/** The one hand-written template that still answers for a command. */
const SELF_INSERTING = 'EDGY dynamic';

const shipped = edgyTemplateCategory.templates;
if (typeof shipped === 'function') {
  throw new Error('the EDGY template category is expected to be eager');
}
const templates = shipped;

const elementsOf = (template: (typeof templates)[number]) =>
  (template.content as unknown as Snapshot).blocks.children[0].props.elements;

const named = (name: string) => {
  const found = templates.find(template => template.name === name);
  if (!found) throw new Error(`no template named "${name}"`);
  return elementsOf(found);
};

/** `id → the groups that claim it`, read off `children.json`. */
function membership(elements: Record<string, RawElement>) {
  const of = new Map<string, string[]>();
  for (const [groupId, element] of Object.entries(elements)) {
    if (element.type !== 'group') continue;
    for (const childId of Object.keys(element.children?.json ?? {})) {
      of.set(childId, [...(of.get(childId) ?? []), groupId]);
    }
  }
  return of;
}

describe('the EDGY palette covers the toolbox', () => {
  const artefacts = edgyCommands.filter(command => command.kind === 'artefact');

  it('ships one template per artefact command', () => {
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

  it('names every template that answers for no command', () => {
    const free = templates
      .filter(template => template.commandId === undefined)
      .map(template => template.name);
    expect([...free].sort()).toEqual([...HAND_AUTHORED].sort());
  });
});

describe('every derived template is what its command draws', () => {
  for (const template of templates) {
    if (template.commandId === undefined) continue;
    // The self-inserting one is the command's SOURCE, not its recording: it is
    // what `createEdgyDynamic` pushes through the template job, so re-running
    // the command here would only insert this object into a fake surface the
    // job cannot write to. Its composition is checked below and in
    // `edgy-dynamic.unit.spec.ts`.
    if (template.name === SELF_INSERTING) continue;
    const command = edgyCommands.find(entry => entry.id === template.commandId);

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
 * The case the audit reported, spelled out: a person dropped from the palette
 * must arrive as the THREE elements the button produces, not as two loose ones
 * that walk apart the first time somebody drags the glyph.
 */
describe('People, the reported case', () => {
  const elements = named('People');

  it('is a glyph, its name, and the group that carries both', () => {
    const entries = Object.entries(elements);
    expect(entries).toHaveLength(3);

    const node = entries.find(([, el]) => el.type === 'edgyNode');
    const label = entries.find(([, el]) => el.type === 'text');
    const group = entries.find(([, el]) => el.type === 'group');
    expect(node && label && group).toBeTruthy();

    expect(node![1].kind).toBe('people');
    expect(node![1].shapeType).toBe('ellipse');
    expect(node![1].role).toBe(EDGY_ROLE.people);

    const [, , width] = JSON.parse(label![1].xywh!) as number[];
    expect(width).toBe(EDGY_LABEL_W);

    expect(Object.keys(group![1].children?.json ?? {}).sort()).toEqual(
      [node![0], label![0]].sort()
    );
  });
});

describe('the compositions are drawn with the same preset', () => {
  for (const name of [...HAND_AUTHORED, SELF_INSERTING]) {
    describe(name, () => {
      const elements = named(name);
      const nodes = Object.entries(elements).filter(
        ([, element]) => element.type === 'edgyNode'
      );

      it('draws every node from `edgyNodeProps`', () => {
        expect(nodes.length).toBeGreaterThan(0);
        for (const [id, element] of nodes) {
          const preset = edgyNodeProps(element.kind as EdgyNodeKind, {
            xywh: element.xywh ?? '',
          });
          expect(
            {
              type: element.type,
              shapeType: element.shapeType,
              strokeWidth: element.strokeWidth,
              radius: element.radius,
            },
            id
          ).toEqual({
            type: preset.type,
            shapeType: preset.shapeType,
            strokeWidth: preset.strokeWidth,
            radius: preset.radius,
          });
        }
      });

      it(
        name === SELF_INSERTING
          ? 'stamps every node with its role'
          : 'stays a neutral illustration',
        () => {
          for (const [id, element] of nodes) {
            if (name === SELF_INSERTING) {
              // The OFFICIAL element, which specialises the kind — so the
              // preset's `EDGY_ROLE[kind]` is the floor, never the answer.
              expect(element.role, id).toBeDefined();
            } else {
              expect(element.role, id).toBeUndefined();
            }
          }
        }
      );
    });
  }

  it('groups the person of the journey with its name', () => {
    const elements = named('Customer journey');
    const groupsOf = membership(elements);
    for (const [id, element] of Object.entries(elements)) {
      if (element.type !== 'edgyNode' || element.kind !== 'people') continue;
      const groups = groupsOf.get(id) ?? [];
      expect(groups, `groups of ${id}`).toHaveLength(1);
      const siblings = Object.keys(
        elements[groups[0]].children?.json ?? {}
      ).filter(childId => childId !== id);
      expect(siblings, `siblings of ${id}`).toHaveLength(1);
      expect(elements[siblings[0]].type, siblings[0]).toBe('text');
    }
  });
});
