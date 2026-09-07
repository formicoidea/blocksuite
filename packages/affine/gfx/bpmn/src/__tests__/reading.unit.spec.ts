import { readElement, readingProfileFor } from '@labre/affine-block-surface';
import { Bound } from '@labre/global/gfx';
import { GfxPrimitiveElementModel } from '@labre/std/gfx';
import { describe, expect, it } from 'vitest';

import { BPMN_READING, BPMN_READINGS } from '../reading.js';
import { BPMN_ROLE, BPMN_ROLES } from '../roles.js';

/**
 * MF3 — what the BPMN declaration lets the tool read.
 *
 * The engine's own behaviour is tested in `blocks/surface`, against a made-up
 * framework, so that neither suite can hide a framework assumption inside the
 * engine. This one owns the DATA: that the four profiles cover the four
 * parent-less node families the vocabulary actually has, that the pool is not
 * one of them, and that the sequence flow is read the way `roles.ts` declares
 * it.
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
  bound = [0, 0, 100, 80],
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

const profileOf = (role: string | undefined) =>
  readingProfileFor(element({ id: 'x', role }), BPMN_READINGS);

describe('what a BPMN process is read as', () => {
  it('gives every role-carrying NODE family a profile, and the pool none', () => {
    // The exhaustive claim, walked out of the vocabulary itself rather than
    // listed by hand: a family added to `roles.ts` and forgotten here fails.
    const unread = Object.values(BPMN_ROLES)
      .filter(def => def.kind === 'node' && def.id !== BPMN_ROLE.pool)
      .filter(def => profileOf(def.id) === null)
      .map(def => def.id);
    expect(unread).toEqual([]);

    // …and the frame stays out: a reading is about an artefact, never about
    // the lane it is drawn in.
    expect(profileOf(BPMN_ROLE.pool)).toBeNull();
    expect(profileOf(undefined)).toBeNull();
  });

  it('reads a task through the three hops of its chain', () => {
    const reading = readElement(
      element({ id: 't', role: BPMN_ROLE.taskUser }),
      [],
      BPMN_READING
    )!;
    expect(reading.nodeType).toEqual({
      roleId: BPMN_ROLE.taskUser,
      labelKey: 'com.labre.bpmn.role.user-task',
      specialises: [BPMN_ROLE.task, BPMN_ROLE.activity, BPMN_ROLE.flowObject],
    });
  });

  it('sends the paperwork and the commentary to their own profiles', () => {
    // `roles.ts` argues the forest at length: a data object is never executed,
    // commentary is never evidence, and §10.4 exempts the group from every
    // containment constraint there is. One `appliesTo` could not cover them
    // without a root the notation does not have.
    expect(profileOf(BPMN_ROLE.dataStore)?.id).toBe('bpmn-data');
    expect(profileOf(BPMN_ROLE.textAnnotation)?.id).toBe('bpmn-annotation');
    expect(profileOf(BPMN_ROLE.group)?.id).toBe('bpmn-group');
    expect(profileOf(BPMN_ROLE.gatewayExclusive)?.id).toBe('bpmn');
    // Ids are unique, because the DI keys on them and throws on a duplicate.
    expect(new Set(BPMN_READINGS.map(p => p.id)).size).toBe(
      BPMN_READINGS.length
    );
  });

  it('reads a sequence flow as what follows and what came before', () => {
    // ADR 0010 tier 2 on this role: the verb is "is followed by", so the SOURCE
    // is what happens first.
    const me = element({ id: 'me', role: BPMN_ROLE.task, text: 'Check stock' });
    const next = element({ id: 'n', role: BPMN_ROLE.task, text: 'Ship' });
    const prev = element({
      id: 'p',
      role: BPMN_ROLE.startEvent,
      text: 'Order received',
    });

    const relations = readElement(
      me,
      [
        me,
        next,
        prev,
        element({
          id: 'f1',
          role: BPMN_ROLE.sequenceFlow,
          source: 'me',
          target: 'n',
        }),
        element({
          id: 'f2',
          role: BPMN_ROLE.sequenceFlow,
          source: 'p',
          target: 'me',
        }),
      ],
      BPMN_READING
    )!.relations;

    expect(relations.map(r => [r.otherName, r.side])).toEqual([
      ['Ship', 'supplier'],
      ['Order received', 'consumer'],
    ]);
    expect(BPMN_READING.relation?.sides).toEqual({
      consumer: {
        labelKey: 'com.labre.bpmn.reading.relations.consumer',
        labelFallback: 'Preceded by',
      },
      supplier: {
        labelKey: 'com.labre.bpmn.reading.relations.supplier',
        labelFallback: 'Followed by',
      },
    });
  });

  it('reads neither the message flow nor the association', () => {
    // Only the sequence flow orders anything. A message flow says who told
    // whom, an association says "this note is about that" — both read the same
    // from either end, which is why the association declares no direction.
    const me = element({ id: 'me', role: BPMN_ROLE.task });
    const other = element({ id: 'o', role: BPMN_ROLE.task, text: 'Other' });

    for (const role of [BPMN_ROLE.messageFlow, BPMN_ROLE.association]) {
      const relations = readElement(
        me,
        [me, other, element({ id: 'e', role, source: 'me', target: 'o' })],
        BPMN_READING
      )!.relations;
      expect(relations, role).toEqual([]);
    }
  });

  it('never contradicts the drawing, proposes no nature, reads no phase', () => {
    // A pool's lanes are participants, not an ordered axis: two tasks side by
    // side contradict nothing, and a phase read off a lane would be invented.
    for (const profile of BPMN_READINGS) {
      expect(profile.relation?.geometry, profile.id).toBeUndefined();
      expect(profile.nature, profile.id).toBeUndefined();
      expect(profile.frame, profile.id).toBeUndefined();
    }

    const above = element({
      id: 'a',
      role: BPMN_ROLE.task,
      bound: [0, 0, 60, 40],
    });
    const below = element({
      id: 'b',
      role: BPMN_ROLE.task,
      bound: [0, 400, 60, 40],
    });
    const reading = readElement(
      below,
      [
        above,
        below,
        element({
          id: 'f',
          role: BPMN_ROLE.sequenceFlow,
          source: 'b',
          target: 'a',
        }),
      ],
      BPMN_READING
    )!;
    expect(reading.relations.every(r => !r.contradictsGeometry)).toBe(true);
    expect(reading.nature).toBeUndefined();
    expect(reading.naming).toBeUndefined();
    expect(reading.phase).toBeUndefined();
  });
});
