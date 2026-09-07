import { readElement, readingProfileFor } from '@labre/affine-block-surface';
import { Bound } from '@labre/global/gfx';
import { GfxPrimitiveElementModel } from '@labre/std/gfx';
import { describe, expect, it } from 'vitest';

import { EVENT_STORMING_READING } from '../reading.js';
import { ES_ROLE, EVENT_STORMING_ROLES } from '../roles.js';

/**
 * MF3 — what the Event Storming declaration lets the tool read.
 *
 * The engine's own behaviour is tested in `blocks/surface`, against a made-up
 * framework. This one owns the DATA: that the nine sticky kinds are read
 * through their parent, that the roll is not, and that the flow is read the way
 * `roles.ts` declares it.
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
  bound = [0, 0, 120, 80],
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
  readingProfileFor(element({ id: 'x', role }), [EVENT_STORMING_READING]);

describe('what an Event Storming board is read as', () => {
  it('gives every role-carrying NODE a profile, and the board none', () => {
    const unread = Object.values(EVENT_STORMING_ROLES)
      .filter(def => def.kind === 'node' && def.id !== ES_ROLE.board)
      .filter(def => profileOf(def.id) === null)
      .map(def => def.id);
    expect(unread).toEqual([]);

    // The roll is the frame the stickies are stuck to.
    expect(profileOf(ES_ROLE.board)).toBeNull();
    expect(profileOf(ES_ROLE.flow)).toBeNull();
    expect(profileOf(undefined)).toBeNull();
  });

  it('reads the two kinds OUTSIDE the grammar like the other seven', () => {
    // Being outside `es.forbidden-arc`'s alphabet means no rule judges a
    // hotspot, not that nobody may ask what it is.
    expect(profileOf(ES_ROLE.hotspot)?.id).toBe('event-storming');
    expect(profileOf(ES_ROLE.constraint)?.id).toBe('event-storming');
  });

  it('reads a sticky through its specialisation', () => {
    expect(
      readElement(
        element({ id: 's', role: ES_ROLE.domainEvent, text: 'Order placed' }),
        [],
        EVENT_STORMING_READING
      )!.nodeType
    ).toEqual({
      roleId: ES_ROLE.domainEvent,
      labelKey: 'com.labre.event-storming.role.domain-event',
      specialises: [ES_ROLE.sticky],
    });
  });

  it('reads a flow as what follows and what it follows', () => {
    // ADR 0010 tier 2 on this role: the verb is "leads to", so the SOURCE is
    // what happens first.
    const me = element({
      id: 'me',
      role: ES_ROLE.command,
      text: 'Place order',
    });
    const next = element({
      id: 'n',
      role: ES_ROLE.domainEvent,
      text: 'Order placed',
    });
    const prev = element({ id: 'p', role: ES_ROLE.actor, text: 'Customer' });

    const relations = readElement(
      me,
      [
        me,
        next,
        prev,
        element({ id: 'f1', role: ES_ROLE.flow, source: 'me', target: 'n' }),
        element({ id: 'f2', role: ES_ROLE.flow, source: 'p', target: 'me' }),
      ],
      EVENT_STORMING_READING
    )!.relations;

    expect(relations.map(r => [r.otherName, r.side])).toEqual([
      ['Order placed', 'supplier'],
      ['Customer', 'consumer'],
    ]);
    expect(EVENT_STORMING_READING.relation?.sides).toEqual({
      consumer: {
        labelKey: 'com.labre.event-storming.reading.relations.consumer',
        labelFallback: 'Follows',
      },
      supplier: {
        labelKey: 'com.labre.event-storming.reading.relations.supplier',
        labelFallback: 'Leads to',
      },
    });
  });

  it('never contradicts the drawing, proposes no nature, reads no phase', () => {
    // The roll's timeline runs left to right and is stated by the FLOW, not by
    // the vertical axis: two stickies one above the other are two branches, not
    // a disagreement. `es.against-timeline` is where the timeline is judged.
    expect(EVENT_STORMING_READING.relation?.geometry).toBeUndefined();
    expect(EVENT_STORMING_READING.nature).toBeUndefined();
    expect(EVENT_STORMING_READING.frame).toBeUndefined();

    const low = element({
      id: 'lo',
      role: ES_ROLE.command,
      bound: [0, 300, 120, 80],
    });
    const high = element({
      id: 'hi',
      role: ES_ROLE.domainEvent,
      bound: [0, 0, 120, 80],
    });
    const reading = readElement(
      low,
      [
        low,
        high,
        element({ id: 'f', role: ES_ROLE.flow, source: 'lo', target: 'hi' }),
      ],
      EVENT_STORMING_READING
    )!;
    expect(reading.relations.every(r => !r.contradictsGeometry)).toBe(true);
    expect(reading.nature).toBeUndefined();
    expect(reading.naming).toBeUndefined();
    expect(reading.phase).toBeUndefined();
  });
});
