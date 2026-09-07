import { readElement, readingProfileFor } from '@labre/affine-block-surface';
import { Bound } from '@labre/global/gfx';
import { GfxPrimitiveElementModel } from '@labre/std/gfx';
import { describe, expect, it } from 'vitest';

import { CORE_DOMAIN_READING, CORE_DOMAIN_READINGS } from '../reading.js';
import { CORE_DOMAIN_ROLE, CORE_DOMAIN_ROLES } from '../roles.js';

/**
 * MF3 — what the Core Domain Chart declaration lets the tool read.
 *
 * The engine's own behaviour is tested in `blocks/surface`, against a made-up
 * framework. This one owns the DATA: that both node families are readable, that
 * the chart is not, and that the movement is read the way `roles.ts` declares
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

const profileOf = (role: string | undefined) =>
  readingProfileFor(element({ id: 'x', role }), CORE_DOMAIN_READINGS);

describe('what a Core Domain Chart is read as', () => {
  it('gives every role-carrying NODE a profile, and the chart none', () => {
    const unread = Object.values(CORE_DOMAIN_ROLES)
      .filter(def => def.kind === 'node' && def.id !== CORE_DOMAIN_ROLE.chart)
      .filter(def => profileOf(def.id) === null)
      .map(def => def.id);
    expect(unread).toEqual([]);

    expect(profileOf(CORE_DOMAIN_ROLE.chart)).toBeNull();
    expect(profileOf(undefined)).toBeNull();
  });

  it('keeps the two families apart, as the vocabulary does', () => {
    // A sub-domain is PLOTTED at a (differentiation, complexity) position; a
    // Team Topologies marker annotates the chart. Neither specialises the
    // other, so neither `appliesTo` may cover both.
    expect(profileOf(CORE_DOMAIN_ROLE.platform)?.id).toBe('core-domain');
    expect(profileOf(CORE_DOMAIN_ROLE.collaboration)?.id).toBe(
      'core-domain-marker'
    );
    expect(new Set(CORE_DOMAIN_READINGS.map(p => p.id)).size).toBe(
      CORE_DOMAIN_READINGS.length
    );
  });

  it('reads a dot through its specialisation', () => {
    expect(
      readElement(
        element({ id: 'd', role: CORE_DOMAIN_ROLE.bcCurrent }),
        [],
        CORE_DOMAIN_READING
      )!.nodeType
    ).toEqual({
      roleId: CORE_DOMAIN_ROLE.bcCurrent,
      labelKey: 'com.labre.core-domain.role.bc-current',
      specialises: [CORE_DOMAIN_ROLE.subdomain],
    });
  });

  it('reads a movement as where it goes and where it came from', () => {
    // ADR 0010 tier 2 on this role: the verb is "is moving to", so the SOURCE
    // is where the context stands today.
    const me = element({
      id: 'me',
      role: CORE_DOMAIN_ROLE.bcCurrent,
      text: 'Billing',
    });
    const future = element({
      id: 'f',
      role: CORE_DOMAIN_ROLE.bcFuture,
      text: 'Billing (target)',
    });

    const relations = readElement(
      me,
      [
        me,
        future,
        element({
          id: 'm',
          role: CORE_DOMAIN_ROLE.movement,
          source: 'me',
          target: 'f',
        }),
      ],
      CORE_DOMAIN_READING
    )!.relations;

    expect(relations.map(r => [r.otherName, r.side])).toEqual([
      ['Billing (target)', 'supplier'],
    ]);
    expect(CORE_DOMAIN_READING.relation?.sides).toEqual({
      consumer: {
        labelKey: 'com.labre.core-domain.reading.relations.consumer',
        labelFallback: 'Moved from',
      },
      supplier: {
        labelKey: 'com.labre.core-domain.reading.relations.supplier',
        labelFallback: 'Moves to',
      },
    });
  });

  it('never contradicts the drawing, proposes no nature, reads no phase', () => {
    // The chart's two axes are a PLANE, not a set of declared zones with ids: a
    // movement drawn upwards is a claim about complexity, not an ordering the
    // engine may second-guess, and a phase read off it would be invented. The
    // variant-scoped 2D zones are a follow-up.
    for (const profile of CORE_DOMAIN_READINGS) {
      expect(profile.relation?.geometry, profile.id).toBeUndefined();
      expect(profile.nature, profile.id).toBeUndefined();
      expect(profile.frame, profile.id).toBeUndefined();
    }

    const low = element({
      id: 'lo',
      role: CORE_DOMAIN_ROLE.bcCurrent,
      bound: [0, 300, 40, 40],
    });
    const high = element({
      id: 'hi',
      role: CORE_DOMAIN_ROLE.bcFuture,
      bound: [0, 0, 40, 40],
    });
    const reading = readElement(
      low,
      [
        low,
        high,
        element({
          id: 'm',
          role: CORE_DOMAIN_ROLE.movement,
          source: 'lo',
          target: 'hi',
        }),
      ],
      CORE_DOMAIN_READING
    )!;
    expect(reading.relations.every(r => !r.contradictsGeometry)).toBe(true);
    expect(reading.nature).toBeUndefined();
    expect(reading.naming).toBeUndefined();
    expect(reading.phase).toBeUndefined();
  });
});
