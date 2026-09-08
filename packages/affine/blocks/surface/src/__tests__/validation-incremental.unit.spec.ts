import { Bound } from '@labre/global/gfx';
import type { GfxPrimitiveElementModel, RoleDefs } from '@labre/std/gfx';
import { signal } from '@preact/signals-core';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  evaluateRules,
  type IncrementalContext,
  ValidationManager,
  type ValidationProfile,
  type ValidationRule,
  ValidationRuleIdentifier,
  type Violation,
} from '../extensions/validation.js';

/**
 * The dirty set (PF5.13), on its own terms.
 *
 * `no-overlap` is the only family that is not element-local, and the only one
 * that can be asked to re-judge PART of a surface. The contract it has to keep
 * is short and absolute: **an incremental pass returns exactly what a full pass
 * would**. It is a way of not doing work, never a different answer — so every
 * test here compares the two rather than asserting a hand-written expectation.
 *
 * The two failures this suite exists for were both invisible to a "nothing
 * moved" check: a frame DELETED (nothing on the surface looks dirty, so the
 * findings attributed to it silently vanished), and a dirty set large enough
 * that the shortcut cost eight times the sweep it replaced.
 */

const ROLES: RoleDefs = {
  'test:frame': { id: 'test:frame', kind: 'node', labelKey: 'test.frame' },
  'test:node': { id: 'test:node', kind: 'node', labelKey: 'test.node' },
  'test:edge': { id: 'test:edge', kind: 'edge', labelKey: 'test.edge' },
};

const RULE: ValidationRule = {
  id: 'test.no-overlap',
  framework: 'test',
  family: 'no-overlap',
  severity: 'warning',
  roles: ROLES,
  messageKey: 'com.labre.test.no-overlap',
  version: 1,
  backgroundRole: 'test:frame',
  overlap: [['test:node', 'test:node']],
};

function element(
  id: string,
  xywh: [number, number, number, number],
  role?: string,
  extra: Record<string, unknown> = {}
): GfxPrimitiveElementModel {
  return {
    id,
    role,
    ...extra,
    get elementBound() {
      return new Bound(...xywh);
    },
  } as unknown as GfxPrimitiveElementModel;
}

const frame = () => element('map', [0, 0, 1600, 900], 'test:frame');
const node = (id: string, x: number) =>
  element(id, [x, 400, 20, 20], 'test:node');

const key = (violation: Violation) =>
  `${violation.ruleId}|${violation.elementIds.join('+')}|${violation.backgroundId ?? '-'}`;

const keys = (violations: readonly Violation[]) => violations.map(key).sort();

/** Both passes over the same surface, which must agree. */
function bothWays(
  elements: GfxPrimitiveElementModel[],
  incremental: IncrementalContext
) {
  return {
    full: keys(evaluateRules([RULE], elements)),
    incremental: keys(evaluateRules([RULE], elements, [], incremental)),
  };
}

describe('an incremental pass answers exactly what a full pass would', () => {
  it('when nothing moved at all', () => {
    const elements = [frame(), node('a', 400), node('b', 410)];
    const previous = evaluateRules([RULE], elements);

    const { full, incremental } = bothWays(elements, {
      dirty: new Set(['a']),
      previous,
    });
    expect(incremental).toEqual(full);
    expect(full).toHaveLength(1);
  });

  it('when an element moved into a collision', () => {
    const before = [frame(), node('a', 400), node('b', 800)];
    const previous = evaluateRules([RULE], before);
    expect(previous).toEqual([]);

    const after = [frame(), node('a', 400), node('b', 410)];
    const { full, incremental } = bothWays(after, {
      dirty: new Set(['b']),
      previous,
    });
    expect(incremental).toEqual(full);
    expect(full).toHaveLength(1);
  });

  it('when an element was removed', () => {
    const before = [frame(), node('a', 400), node('b', 410)];
    const previous = evaluateRules([RULE], before);

    const after = [frame(), node('a', 400)];
    const { full, incremental } = bothWays(after, {
      dirty: new Set(['b']),
      previous,
    });
    expect(incremental).toEqual(full);
    expect(full).toEqual([]);
  });

  it('when the frame MOVED', () => {
    const elements = [
      element('map', [200, 200, 1600, 900], 'test:frame'),
      node('a', 400),
      node('b', 410),
    ];
    const previous = evaluateRules(
      [RULE],
      [frame(), node('a', 400), node('b', 410)]
    );

    const { full, incremental } = bothWays(elements, {
      dirty: new Set(['map']),
      previous,
    });
    expect(incremental).toEqual(full);
  });

  it('when the frame was DELETED, and the collision is still live', () => {
    // The regression this suite was written for. With the map gone nothing on
    // the surface carries the frame role, so "is a current background dirty"
    // sees nothing, no couple is re-tested — and the carried finding used to be
    // dropped for naming a `backgroundId` that had just become dirty. Net
    // result: a live overlap disappeared from the board until the next full
    // pass or the next nudge of one of the two elements.
    const before = [frame(), node('a', 400), node('b', 410)];
    const previous = evaluateRules([RULE], before);
    expect(previous).toHaveLength(1);
    expect(previous[0].backgroundId).toBe('map');

    const after = [node('a', 400), node('b', 410)];
    const { full, incremental } = bothWays(after, {
      dirty: new Set(['map']),
      previous,
    });

    expect(incremental).toEqual(full);
    // The overlap survives its map: it never depended on the frame for
    // anything but attribution, and it loses only that.
    expect(full).toHaveLength(1);
    expect(
      evaluateRules([RULE], after, [], {
        dirty: new Set(['map']),
        previous,
      })[0].backgroundId
    ).toBeUndefined();
  });

  it('when EVERYTHING moved at once', () => {
    // Past the crossover the family gives up on being clever and sweeps. The
    // answer must not depend on which branch it took.
    // Three 20-wide nodes in a heap, every pair genuinely overlapping.
    const elements = [frame(), node('a', 400), node('b', 410), node('c', 415)];
    const previous = evaluateRules([RULE], elements);

    const { full, incremental } = bothWays(elements, {
      dirty: new Set(['a', 'b', 'c']),
      previous,
    });
    expect(incremental).toEqual(full);
    expect(full).toHaveLength(3);
  });

  it('and reports each colliding couple exactly once', () => {
    // Two dirty elements that collide are reachable from both ends of the
    // scan. Reported twice, one bubble would say the same thing twice.
    const elements = [frame(), node('a', 400), node('b', 410), node('c', 900)];
    const previous: Violation[] = [];

    const raised = evaluateRules([RULE], elements, [], {
      dirty: new Set(['a', 'b']),
      previous,
    });
    expect(keys(raised)).toEqual(['test.no-overlap|a+b|map']);
  });
});

/**
 * The BOUND: past the crossover the family gives up on being clever and sweeps.
 *
 * The cost of the two branches — and therefore that the bound is worth having —
 * is measured in the bench, which has a median harness and a warm-up
 * (`validation.bench.unit.spec.ts`, "stays inside the frame at EVERY dirty-set
 * size"). A clock read inside the unit suite would measure the machine's mood.
 *
 * What is worth pinning HERE is that switching branch cannot change the answer,
 * at every size on both sides of the crossover.
 */
describe('the bound cannot change the answer', () => {
  /** A dense board: `size` participants, every other one overlapping. */
  const board = (size: number) => {
    const elements = [frame()];
    for (let i = 0; i < size; i++) {
      elements.push(node(`n${i}`, 100 + Math.floor(i / 2) * 40 + (i % 2) * 10));
    }
    return elements;
  };

  const elements = board(60);
  const previous = evaluateRules([RULE], elements);

  for (const size of [1, 2, 15, 29, 30, 31, 45, 60]) {
    it(`agrees with a full pass at |dirty| = ${size}`, () => {
      // 30 of 60 participants is exactly the crossover, so this walks over it.
      const dirty = new Set(elements.slice(1, size + 1).map(el => el.id));
      const { full, incremental } = bothWays(elements, { dirty, previous });

      expect(incremental).toEqual(full);
      expect(full).toHaveLength(30);
    });
  }
});

/**
 * The PRUNE, against the dirty loop as an oracle.
 *
 * The full pass sorts its subjects by left edge and stops each walk at the
 * first subject that begins after the current one ends. The dirty loop next to
 * it was deliberately left NAIVE — it still tests one element against every
 * participant — so the two halves of this family now enumerate their couples in
 * two entirely different ways, and the contract at the top of this file makes
 * one the oracle of the other for free.
 *
 * With `previous: []` the incremental branch returns exactly the findings that
 * TOUCH the dirty set, so that is the subset the full pass is compared on. The
 * dirty set is kept below the crossover, or the branch falls back to the sweep
 * and the test compares the prune with itself.
 *
 * Random rather than hand-written because the prune's failure mode is a
 * geometric coincidence — a zero-width bound exactly on another's right edge,
 * a wide subject sorted last, a path leaving its own box — and a list of cases
 * somebody thought of is precisely the list that misses the one nobody did.
 */
describe('the pruned sweep answers what pair-by-pair testing answers', () => {
  /**
   * mulberry32: 32 bits of state, four lines, and the same sequence on every
   * host — so a board that fails is replayed from the seed in the message
   * rather than reconstructed from a screenshot.
   */
  const mulberry32 = (seed: number) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  /** Node against node, node against link, link against link. */
  const FUZZ_ROLES: RoleDefs = ROLES;
  const fuzzRule = (minPenetration: number): ValidationRule => ({
    ...RULE,
    id: 'test.no-overlap.fuzz',
    roles: FUZZ_ROLES,
    minPenetration,
    overlap: [
      ['test:node', 'test:node'],
      ['test:node', 'test:edge'],
      ['test:edge', 'test:edge'],
    ],
  });

  /**
   * One random board.
   *
   * Sizes and widths are deliberately mean: zero-width and zero-height boxes
   * (a vertical line's bound), x values snapped to a coarse grid so ties and
   * exact `maxX === x` touches happen often, and edges whose routed path is
   * measured inside a bound that is the path's own bounding box — the shape a
   * connector really has, `xywh` being recomputed from the path on every route.
   */
  function board(random: () => number) {
    const size = 5 + Math.floor(random() * 116);
    const elements = [element('map', [0, 0, 1000, 600], 'test:frame')];
    for (let i = 0; i < size; i++) {
      const id = `f${i}`;
      // A coarse grid on x: exact ties and exact edge-to-edge touches are the
      // cases the stop condition is about, and they never occur by accident on
      // continuous coordinates.
      const x = Math.floor(random() * 20) * 50;
      const y = Math.floor(random() * 12) * 50;
      if (random() < 0.4) {
        const points: [number, number][] = [];
        for (let k = 0, n = 2 + Math.floor(random() * 3); k < n; k++) {
          points.push([x + random() * 200, y + random() * 200]);
        }
        const xs = points.map(p => p[0]);
        const ys = points.map(p => p[1]);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        elements.push(
          element(
            id,
            [minX, minY, Math.max(...xs) - minX, Math.max(...ys) - minY],
            'test:edge',
            { absolutePath: points }
          )
        );
        continue;
      }
      // Zero width and zero height are ordinary here, not exotic: a perfectly
      // vertical connector and a flat separator both present one.
      const w = random() < 0.2 ? 0 : Math.floor(random() * 120);
      const h = random() < 0.2 ? 0 : Math.floor(random() * 120);
      elements.push(element(id, [x, y, w, h], 'test:node'));
    }
    return elements;
  }

  it('on 200 random boards, and on a random subset of each', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const random = mulberry32(seed);
      const rule = fuzzRule([0, 3, 8][seed % 3]);
      const elements = board(random);
      const participants = elements.slice(1);
      const why = `seed ${seed} (${participants.length} participants, minPenetration ${rule.minPenetration})`;

      const full = evaluateRules([rule], elements);

      // The same board, shuffled: the sweep sorts its own subjects now, so the
      // answer must not remember what order they arrived in.
      const shuffled = [...elements];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      expect(keys(evaluateRules([rule], shuffled)), why).toEqual(keys(full));

      // Below the crossover, or the branch falls back to the sweep and this
      // compares the prune with itself.
      const dirtySize = Math.max(
        1,
        Math.floor(random() * Math.max(1, Math.floor(participants.length / 2)))
      );
      const dirty = new Set(
        participants
          .slice()
          .sort(() => random() - 0.5)
          .slice(0, dirtySize)
          .map(el => el.id)
      );
      const incremental = evaluateRules([rule], elements, [], {
        dirty,
        previous: [],
      });

      expect(keys(incremental), why).toEqual(
        keys(full.filter(v => v.elementIds.some(id => dirty.has(id))))
      );
    }
  });
});

/**
 * The stop condition, written out by hand.
 *
 * The fuzz above proves the prune agrees with pair-by-pair testing; these say
 * WHICH cases it is agreeing about, so a future change to the stop condition
 * fails on the case it broke rather than on a seed.
 */
describe('the prune stops at the right subject', () => {
  const box = (id: string, x: number, y: number, w: number, h: number) =>
    element(id, [x, y, w, h], 'test:node');
  const found = (...elements: GfxPrimitiveElementModel[]) =>
    keys(evaluateRules([RULE], [frame(), ...elements]));

  it('lets a shared EDGE pass: touching is not overlapping', () => {
    expect(found(box('a', 0, 0, 100, 20), box('b', 100, 0, 100, 20))).toEqual(
      []
    );
  });

  it('lets a zero-width box sitting exactly on another edge pass', () => {
    expect(found(box('a', 0, 0, 100, 20), box('b', 100, 0, 0, 20))).toEqual([]);
  });

  it('still catches a zero-width box INSIDE another', () => {
    // The stop is `>` and not `>=` so this pair is still handed to the
    // geometry, which is the half that owns the touching question.
    expect(found(box('a', 0, 0, 100, 20), box('b', 50, 0, 0, 20))).toEqual([
      'test.no-overlap|a+b|map',
    ]);
  });

  it('catches a box nested entirely inside another', () => {
    expect(found(box('a', 0, 0, 200, 200), box('b', 50, 50, 20, 20))).toEqual([
      'test.no-overlap|a+b|map',
    ]);
  });

  it('reaches PAST a subject that does not collide', () => {
    // Sorted by left edge the walk meets `mid` first and must not stop there:
    // `wide` still reaches `far`, which is the whole point of a stop condition
    // rather than a skip.
    expect(
      found(
        box('wide', 0, 0, 300, 10),
        box('mid', 100, 500, 10, 10),
        box('far', 200, 0, 50, 10)
      )
    ).toEqual(['test.no-overlap|far+wide|map']);
  });

  it('finds a wide subject that sorts FIRST', () => {
    expect(found(box('wide', 0, 0, 400, 20), box('n', 300, 0, 20, 20))).toEqual(
      ['test.no-overlap|n+wide|map']
    );
  });

  it('finds a wide subject that sorts LAST', () => {
    // `wide` begins after both others, so it is only ever reached as the far
    // end of somebody else's walk — and `near`, whose own reach stops short of
    // it, must not be reported.
    expect(
      found(
        box('near', 0, 0, 20, 20),
        box('over', 150, 0, 100, 20),
        box('wide', 200, 0, 400, 20)
      )
    ).toEqual(['test.no-overlap|over+wide|map']);
  });
});

/**
 * The one hole the family cannot close on its own (recette #2, R5).
 *
 * `no-overlap` finds a DELETED frame by looking for its id among the previous
 * findings, because that is the only trace an element that has left the surface
 * can leave. A frame whose profile put the rule on `'off'` leaves no such
 * trace: `applyProfiles` dropped every finding measured against it, so
 * `previous` is empty, the deletion reads as an ordinary one — and the overlap
 * that becomes live again under the default profile is reported by a full pass
 * and not by the incremental one.
 *
 * No shipped Wardley profile uses `'off'` today, so this was latent rather than
 * live. `'off'` is a documented state of PF9 all the same, and the first
 * framework that ships one would reopen the bug — so the invariant is closed by
 * construction instead of by luck: the MANAGER remembers which ids were
 * backgrounds at the last evaluation, which is exactly the memory a family that
 * only ever sees the current surface cannot have.
 *
 * Driven through the real path — subscription, dirty set, 120 ms debounce —
 * because the decision it tests lives between them.
 */
describe('a background that has been SILENCED still forces a full pass', () => {
  afterEach(() => vi.useRealTimers());

  /** A profile that switches the pair-wise rule off, and is not the default. */
  const OFF: ValidationProfile = {
    id: 'test.off',
    framework: 'test',
    labelKey: 'com.labre.test.profile.off',
    rules: { [RULE.id]: 'off' },
  };
  const DEFAULT: ValidationProfile = {
    id: 'test.sketch',
    framework: 'test',
    labelKey: 'com.labre.test.profile.sketch',
    isDefault: true,
    rules: {},
  };

  /** The minimum of a surface: the element list, and the three change feeds. */
  function fakeSurface(elements: GfxPrimitiveElementModel[]) {
    const feed = () => {
      const listeners: ((payload: { id: string }) => void)[] = [];
      return {
        subscribe(fn: (payload: { id: string }) => void) {
          listeners.push(fn);
          return { unsubscribe() {} };
        },
        emit(id: string) {
          for (const fn of [...listeners]) fn({ id });
        },
      };
    };
    return {
      elementModels: elements,
      elementAdded: feed(),
      elementRemoved: feed(),
      elementUpdated: feed(),
    };
  }

  it('when the SILENCED map is deleted and the overlap comes back to life', () => {
    vi.useFakeTimers();

    // Two nodes genuinely on top of each other, on a map whose chosen level of
    // requirement switches the rule off entirely.
    const map = element('map', [0, 0, 1600, 900], 'test:frame') as {
      validationProfile?: string;
    } & GfxPrimitiveElementModel;
    (map as { validationProfile?: string }).validationProfile = OFF.id;
    const elements: GfxPrimitiveElementModel[] = [
      map,
      node('a', 400),
      node('b', 410),
    ];

    const surface = fakeSurface(elements);
    const manager = new ValidationManager({
      surface,
      surface$: signal(surface),
      std: {
        provider: {
          getAll: (identifier: unknown) =>
            new Map<string, unknown>(
              identifier === ValidationRuleIdentifier
                ? [['rule', RULE]]
                : [
                    ['off', OFF],
                    ['default', DEFAULT],
                  ]
            ),
        },
        getOptional: () => null,
      },
    } as never);

    // First verdict: silent, and silent for the right reason — the map says so.
    manager.mounted();
    expect(manager.violations$.peek()).toEqual([]);

    // The map is deleted. Nothing else moves.
    elements.shift();
    surface.elementRemoved.emit('map');
    vi.advanceTimersByTime(200);

    // What a full pass says now, which is the only right answer.
    const full = keys(evaluateRules([RULE], elements, [OFF, DEFAULT]));
    expect(full).toHaveLength(1);
    expect(keys(manager.violations$.peek())).toEqual(full);

    manager.unmounted();
  });
});

describe('a rule that can never fire says so', () => {
  afterEach(() => vi.restoreAllMocks());

  it('warns when an attachment rule names a NODE role as its carrier', () => {
    // "Posed on" is a distance to a PATH, and a node has none. Silently
    // matching nothing is the worst thing declarative data can do: the rule
    // looks registered, looks enabled, and never fires.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const broken: ValidationRule = {
      id: `test.attached-to-a-node-${Math.random()}`,
      framework: 'test',
      family: 'attachment',
      severity: 'warning',
      appliesTo: 'test:node',
      roles: ROLES,
      messageKey: 'com.labre.test.attached-to-a-node',
      version: 1,
      attachment: { carrierRole: 'test:frame', tolerance: 10 },
    };

    expect(evaluateRules([broken], [frame(), node('a', 400)])).toEqual([]);
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][0]).toContain('can never fire');

    // …once, not on every evaluation: a family runs several times a second
    // while somebody drags.
    evaluateRules([broken], [frame(), node('a', 400)]);
    expect(warn).toHaveBeenCalledOnce();
  });
});
