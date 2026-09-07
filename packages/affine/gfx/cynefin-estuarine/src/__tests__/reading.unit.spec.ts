import { readElement, readingProfileFor } from '@labre/affine-block-surface';
import { Bound } from '@labre/global/gfx';
import { GfxPrimitiveElementModel } from '@labre/std/gfx';
import { describe, expect, it } from 'vitest';

import { ESTUARINE_READING } from '../estuarine/reading';
import { ESTUARINE_ROLE } from '../estuarine/roles';

/**
 * MF3 — what the Estuarine declaration lets the tool read, and what Cynefin
 * deliberately does not.
 *
 * The engine's own behaviour is tested in `blocks/surface`. This one owns the
 * DATA, and above all the ADR 0013 line: a constraint hexagon is readable
 * because it carries a role; a free element on a Cynefin board is not, because
 * that framework declares none and never will. Reading is not validation — this
 * profile carries no rule and no verdict — which is why the two facts sit side
 * by side without contradicting each other (see that ADR's amendment of
 * 2026-09-07).
 */

type Stub = { id: string; role?: string; text?: string };

function element({ id, role, text }: Stub): GfxPrimitiveElementModel {
  const el = Object.create(
    GfxPrimitiveElementModel.prototype
  ) as GfxPrimitiveElementModel;
  const define = (key: string, value: unknown) =>
    Object.defineProperty(el, key, { value, configurable: true });

  define('id', id);
  define('role', role);
  define('text', text);
  define('group', null);
  define('elementBound', new Bound(0, 0, 120, 104));
  return el;
}

describe('what an Estuarine board is read as', () => {
  it('reads a constraint, and says what it is called', () => {
    const reading = readElement(
      element({ id: 'c', role: ESTUARINE_ROLE.constraint, text: 'Budget' }),
      [],
      ESTUARINE_READING
    )!;
    expect(reading.name).toBe('Budget');
    expect(reading.nodeType).toEqual({
      roleId: ESTUARINE_ROLE.constraint,
      labelKey: 'com.labre.estuarine.role.constraint',
      // A root role: the vocabulary is two flat entries, by design.
      specialises: [],
    });
  });

  it('reads neither the map nor an element Cynefin left neutral', () => {
    // The map is the frame the constraints are measured against, so a reading
    // must never be about it. And a sticky dropped on a Cynefin board carries
    // NO role at all (ADR 0013: the four domains are the participants'
    // judgement, not a notation), so nothing here can read it — which is the
    // decision working, not a gap.
    expect(
      readingProfileFor(element({ id: 'm', role: ESTUARINE_ROLE.map }), [
        ESTUARINE_READING,
      ])
    ).toBeNull();
    expect(
      readingProfileFor(element({ id: 'n' }), [ESTUARINE_READING])
    ).toBeNull();
  });

  it('declares no relation, no nature and no phase', () => {
    // No edge role in the vocabulary: an arrow between two hexagons is a plain
    // connector and carries no verb, so there is no sentence to read off it.
    // And the energy/time plane declares no zones — reading a "position" off
    // the three reference curves would be the engine inventing a fact.
    expect(ESTUARINE_READING.relation).toBeUndefined();
    expect(ESTUARINE_READING.nature).toBeUndefined();
    expect(ESTUARINE_READING.frame).toBeUndefined();

    const reading = readElement(
      element({ id: 'c', role: ESTUARINE_ROLE.constraint }),
      [],
      ESTUARINE_READING
    )!;
    expect(reading.relations).toEqual([]);
    expect(reading.nature).toBeUndefined();
    expect(reading.naming).toBeUndefined();
    expect(reading.phase).toBeUndefined();
  });
});
