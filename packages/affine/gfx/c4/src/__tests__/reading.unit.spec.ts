import { readElement, readingProfileFor } from '@labre/affine-block-surface';
import { Bound } from '@labre/global/gfx';
import { GfxPrimitiveElementModel } from '@labre/std/gfx';
import { describe, expect, it } from 'vitest';

import { C4_CONTAINER_READING, C4_READINGS } from '../reading.js';
import { C4_ROLE, C4_ROLES } from '../roles.js';

/**
 * MF3 — what the C4 declaration lets the tool read.
 *
 * The engine's own behaviour is tested in `blocks/surface`, against a made-up
 * framework. This one owns the DATA: that all four LEVELS are readable through
 * four profiles (they are deliberately flat — composition is not
 * specialisation), that the frames are not, and that the name comes off the
 * `c4:title` sibling.
 */

/** The frames: the board and the boundary family. Not artefacts. */
const FRAME_ROLES: string[] = [
  C4_ROLE.board,
  C4_ROLE.boundary,
  C4_ROLE['system-boundary'],
  C4_ROLE['container-boundary'],
];

type Stub = {
  id: string;
  role?: string;
  bound?: [number, number, number, number];
  text?: string;
  source?: string;
  target?: string;
  children?: GfxPrimitiveElementModel[];
};

function element({
  id,
  role,
  bound = [0, 0, 240, 120],
  text,
  source,
  target,
  children,
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
  if (children) define('childElements', children);
  return el;
}

const profileOf = (role: string | undefined) =>
  readingProfileFor(element({ id: 'x', role }), C4_READINGS);

describe('what a C4 diagram is read as', () => {
  it('gives every role-carrying NODE a profile, and the frames none', () => {
    const unread = Object.values(C4_ROLES)
      .filter(def => def.kind === 'node' && !FRAME_ROLES.includes(def.id))
      .filter(def => profileOf(def.id) === null)
      .map(def => def.id);
    expect(unread).toEqual([]);

    for (const role of FRAME_ROLES) {
      expect(profileOf(role), role).toBeNull();
    }
    expect(profileOf(undefined)).toBeNull();
    // The three text tiers are not artefacts either.
    expect(profileOf(C4_ROLE.title)).toBeNull();
    expect(profileOf(C4_ROLE.description)).toBeNull();
  });

  it('gives each LEVEL its own profile, and the database its container’s', () => {
    // The levels are flat by design: filing them in a chain would make "every
    // rule about a system also falls on every container" true, which is the
    // opposite of what C4 says. The database is the one real specialisation.
    expect(profileOf(C4_ROLE.person)?.id).toBe('c4-person');
    expect(profileOf(C4_ROLE.system)?.id).toBe('c4-system');
    expect(profileOf(C4_ROLE.container)?.id).toBe('c4-container');
    expect(profileOf(C4_ROLE.component)?.id).toBe('c4-component');
    expect(profileOf(C4_ROLE.database)?.id).toBe('c4-container');

    expect(
      readElement(
        element({ id: 'd', role: C4_ROLE.database }),
        [],
        C4_CONTAINER_READING
      )!.nodeType
    ).toEqual({
      roleId: C4_ROLE.database,
      labelKey: 'com.labre.c4.role.database',
      specialises: [C4_ROLE.container],
    });

    // Ids are unique: the DI keys on them and throws on a duplicate.
    expect(new Set(C4_READINGS.map(p => p.id)).size).toBe(C4_READINGS.length);
  });

  it('takes the name off the title tier, never the id', () => {
    // A C4 element is a composite: a shape and three tiers of canvas text
    // grouped with it. Without `labelRole` the panel would print an id.
    const node = element({ id: 'n', role: C4_ROLE.container });
    const title = element({ id: 't', role: C4_ROLE.title, text: 'API' });
    const group = element({ id: 'g', children: [node, title] });
    Object.defineProperty(node, 'group', { value: group, configurable: true });

    expect(readElement(node, [node, title], C4_CONTAINER_READING)!.name).toBe(
      'API'
    );
    for (const profile of C4_READINGS) {
      expect(profile.labelRole, profile.id).toBe(C4_ROLE.title);
    }
  });

  it('reads a relationship as what it uses and what uses it', () => {
    // This role's `direction`: the verb is "uses", so the SOURCE is the user.
    const me = element({ id: 'me', role: C4_ROLE.container, text: 'API' });
    const used = element({
      id: 'u',
      role: C4_ROLE.database,
      text: 'Ledger DB',
    });
    const user = element({ id: 'p', role: C4_ROLE.person, text: 'Analyst' });

    const relations = readElement(
      me,
      [
        me,
        used,
        user,
        element({
          id: 'r1',
          role: C4_ROLE.relationship,
          source: 'me',
          target: 'u',
        }),
        element({
          id: 'r2',
          role: C4_ROLE.relationship,
          source: 'p',
          target: 'me',
        }),
      ],
      C4_CONTAINER_READING
    )!.relations;

    expect(relations.map(r => [r.otherName, r.side])).toEqual([
      ['Ledger DB', 'supplier'],
      ['Analyst', 'consumer'],
    ]);
    expect(C4_CONTAINER_READING.relation?.sides).toEqual({
      consumer: {
        labelKey: 'com.labre.c4.reading.relations.consumer',
        labelFallback: 'Used by',
      },
      supplier: {
        labelKey: 'com.labre.c4.reading.relations.supplier',
        labelFallback: 'Uses',
      },
    });
  });

  it('never contradicts the drawing, proposes no nature, reads no phase', () => {
    // A C4 board's vertical axis says nothing: a container drawn above the
    // database it uses is the ordinary way round.
    for (const profile of C4_READINGS) {
      expect(profile.relation?.geometry, profile.id).toBeUndefined();
      expect(profile.nature, profile.id).toBeUndefined();
      expect(profile.frame, profile.id).toBeUndefined();
    }

    const top = element({
      id: 'top',
      role: C4_ROLE.container,
      bound: [0, 0, 240, 120],
    });
    const bottom = element({
      id: 'bot',
      role: C4_ROLE.database,
      bound: [0, 400, 240, 120],
    });
    const reading = readElement(
      bottom,
      [
        top,
        bottom,
        element({
          id: 'r',
          role: C4_ROLE.relationship,
          source: 'bot',
          target: 'top',
        }),
      ],
      C4_CONTAINER_READING
    )!;
    expect(reading.relations.every(r => !r.contradictsGeometry)).toBe(true);
    expect(reading.nature).toBeUndefined();
    expect(reading.naming).toBeUndefined();
    expect(reading.phase).toBeUndefined();
  });
});
