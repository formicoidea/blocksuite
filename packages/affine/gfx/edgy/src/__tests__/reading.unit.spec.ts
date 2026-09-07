import { readElement, readingProfileFor } from '@labre/affine-block-surface';
import { Bound } from '@labre/global/gfx';
import { GfxPrimitiveElementModel } from '@labre/std/gfx';
import { describe, expect, it } from 'vitest';

import { EDGY_READING } from '../reading';
import { EDGY_ROLE, EDGY_VERB_ROLE } from '../roles';

/**
 * MF3 — what the EDGY declaration lets the tool read.
 *
 * The engine's own behaviour is tested in `blocks/surface`, against a made-up
 * framework, so that neither suite can hide a framework assumption inside the
 * engine. This one owns the DATA: that the profile points at the real roles and
 * the real relation edge, that the sixteen artefact roles are read through their
 * common parent, and that the three frames are not.
 */

type Stub = {
  id: string;
  role?: string;
  bound?: [number, number, number, number];
  text?: string;
  source?: string;
  target?: string;
};

function element({
  id,
  role,
  bound = [0, 0, 40, 40],
  text,
  source,
  target,
}: Stub): GfxPrimitiveElementModel {
  const el = Object.create(
    GfxPrimitiveElementModel.prototype
  ) as GfxPrimitiveElementModel;
  const define = (key: string, value: unknown) =>
    Object.defineProperty(el, key, { value, configurable: true });

  define('id', id);
  define('role', role);
  define('text', text);
  define('group', null);
  define('elementBound', new Bound(...bound));
  if (source !== undefined) define('source', { id: source });
  if (target !== undefined) define('target', { id: target });
  return el;
}

const read = (
  subject: GfxPrimitiveElementModel,
  rest: GfxPrimitiveElementModel[] = []
) => readElement(subject, [subject, ...rest], EDGY_READING);

describe('what an EDGY board is read as', () => {
  it('reads an element, and one of the twelve through its chain', () => {
    expect(read(element({ id: 'a', role: EDGY_ROLE.element }))).not.toBeNull();

    // `journey` is an activity, an activity is an element — two hops, both
    // declared as data, and the panel says the whole chain.
    expect(
      read(element({ id: 'j', role: EDGY_ROLE.journey }))!.nodeType
    ).toEqual({
      roleId: EDGY_ROLE.journey,
      labelKey: 'com.labre.edgy.role.journey',
      specialises: [EDGY_ROLE.activity, EDGY_ROLE.element],
    });
  });

  it('reads no frame, no relation and no neutral element', () => {
    // A reading is about an artefact, never about the sheet it is drawn on —
    // which is exactly why the three background roles are not children of
    // `edgy:element`.
    for (const role of [
      EDGY_ROLE.background,
      EDGY_ROLE.facets,
      EDGY_ROLE.board,
      EDGY_ROLE.relation,
      EDGY_VERB_ROLE.expresses,
      undefined,
    ]) {
      expect(
        readingProfileFor(element({ id: 'x', role }), [EDGY_READING]),
        role ?? 'neutral'
      ).toBeNull();
    }
  });

  it('reads a relation from both ends, and names each side its own way', () => {
    const me = element({ id: 'me', role: EDGY_ROLE.process, text: 'Ordering' });
    const out = element({ id: 'out', role: EDGY_ROLE.asset, text: 'Ledger' });
    const into = element({
      id: 'in',
      role: EDGY_ROLE.organisation,
      text: 'Ops',
    });
    const leaving = element({
      id: 'e1',
      role: EDGY_VERB_ROLE.requires,
      source: 'me',
      target: 'out',
    });
    const arriving = element({
      id: 'e2',
      role: EDGY_VERB_ROLE.performs,
      source: 'in',
      target: 'me',
    });

    // ADR 0010 tier 1: the source is the subject of the verb. The 22 verb roles
    // specialise `edgy:relation`, so the profile names the parent and reaches
    // every one of them through `roleIsA`.
    const relations = read(me, [out, into, leaving, arriving])!.relations;
    expect(relations.map(r => [r.otherName, r.side])).toEqual([
      ['Ledger', 'supplier'],
      ['Ops', 'consumer'],
    ]);

    expect(EDGY_READING.relation?.sides).toEqual({
      consumer: {
        labelKey: 'com.labre.edgy.reading.relations.consumer',
        labelFallback: 'Incoming relations',
      },
      supplier: {
        labelKey: 'com.labre.edgy.reading.relations.supplier',
        labelFallback: 'Outgoing relations',
      },
    });
  });

  it('never contradicts the drawing: an EDGY board has no vertical order', () => {
    // The facets diagram is a Venn, not an axis. "Above" states nothing here,
    // so the framework declares no `geometry` and the engine keeps quiet — the
    // opt-in Wardley alone takes.
    expect(EDGY_READING.relation?.geometry).toBeUndefined();

    const me = element({
      id: 'me',
      role: EDGY_ROLE.process,
      bound: [0, 300, 40, 40],
    });
    const other = element({
      id: 'o',
      role: EDGY_ROLE.asset,
      bound: [0, 0, 40, 40],
    });
    const edge = element({
      id: 'e',
      role: EDGY_VERB_ROLE.requires,
      source: 'me',
      target: 'o',
    });

    expect(
      read(me, [other, edge])!.relations.every(r => !r.contradictsGeometry)
    ).toBe(true);
  });

  it('proposes no nature and reads no phase', () => {
    // EDGY ships no type-3 tag pack — its kinds ARE the roles — and declares no
    // frame, so both sections are absent rather than empty.
    const reading = read(element({ id: 'a', role: EDGY_ROLE.people }))!;
    expect(reading.nature).toBeUndefined();
    expect(reading.naming).toBeUndefined();
    expect(reading.phase).toBeUndefined();
    expect(EDGY_READING.nature).toBeUndefined();
    expect(EDGY_READING.frame).toBeUndefined();
  });
});
