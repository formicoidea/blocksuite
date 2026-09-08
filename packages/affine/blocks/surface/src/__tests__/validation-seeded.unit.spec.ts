import { Bound } from '@labre/global/gfx';
import type { GfxPrimitiveElementModel, RoleDefs } from '@labre/std/gfx';
import { signal } from '@preact/signals-core';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  evaluateCheckup,
  evaluateRules,
  frameMembership,
  ValidationManager,
  type ValidationProfile,
  ValidationProfileIdentifier,
  type ValidationRule,
  ValidationRuleIdentifier,
  type Violation,
} from '../extensions/validation.js';

/**
 * PF7.9 — **a caller may seed an evaluation with its own dirty set.**
 *
 * The incremental pipeline used to be the debounced path's privilege, because
 * that path was the only thing that knew what had changed. The privilege is now
 * "whoever knows", and the contract that makes opening it safe is short:
 *
 * - `seeded ⊆ full` — a seeded pass never invents a verdict; and
 * - `seeded ∩ touching(S) = full ∩ touching(S)` — it never misses one that is
 *   about the seed.
 *
 * Everything between the two is what the caller chose not to ask about, which is
 * the whole point of asking. Every test here therefore compares the two passes
 * rather than asserting a hand-written list — a seeded answer is only ever
 * defined against the full one.
 */

const ROLES: RoleDefs = {
  'test:frame': { id: 'test:frame', kind: 'node', labelKey: 'test.frame' },
  'test:node': { id: 'test:node', kind: 'node', labelKey: 'test.node' },
  'test:edge': { id: 'test:edge', kind: 'edge', labelKey: 'test.edge' },
};

const base = {
  framework: 'test',
  severity: 'warning',
  roles: ROLES,
  version: 1,
  backgroundRole: 'test:frame',
} as const;

/** Pair-wise, real-time — the family with its own incremental logic. */
const OVERLAP: ValidationRule = {
  ...base,
  id: 'test.no-overlap',
  family: 'no-overlap',
  messageKey: 'com.labre.test.no-overlap',
  overlap: [['test:node', 'test:node']],
};

/** Element-scope, real-time — the narrowest closure there is. */
const NAMED: ValidationRule = {
  ...base,
  id: 'test.named',
  family: 'label-presence',
  appliesTo: 'test:node',
  messageKey: 'com.labre.test.named',
  label: { present: true },
};

/** Element-scope, on-demand — what a check-up walks. */
const NAMED_ON_DEMAND: ValidationRule = {
  ...NAMED,
  id: 'test.named-on-demand',
  moment: 'on-demand',
};

/**
 * Relations-scope, on-demand: "nothing may be pointed at". Its finding lands on
 * the NODE, so seeding an EDGE only reaches it through the closure — which is
 * exactly what a seeded run has to prove it does.
 */
const NO_INBOUND: ValidationRule = {
  ...base,
  id: 'test.no-inbound',
  family: 'edge-degree',
  appliesTo: 'test:node',
  messageKey: 'com.labre.test.no-inbound',
  moment: 'on-demand',
  degree: { edgeRole: 'test:edge', maxIn: 0 },
};

interface Mutable {
  model: GfxPrimitiveElementModel;
  set(prop: string, value: unknown): void;
}

/** A stand-in whose props can MOVE — a fuzz over a frozen board proves nothing. */
function element(
  id: string,
  xywh: [number, number, number, number],
  role?: string,
  extra: Record<string, unknown> = {}
): Mutable {
  const props: Record<string, unknown> = { xywh, role, ...extra };
  const model = {
    id,
    get role() {
      return props.role;
    },
    get text() {
      return props.text;
    },
    get absolutePath() {
      return props.absolutePath;
    },
    get validationExceptions() {
      return props.validationExceptions;
    },
    get validationProfile() {
      return props.validationProfile;
    },
    get source() {
      return props.source === undefined ? undefined : { id: props.source };
    },
    get target() {
      return props.target === undefined ? undefined : { id: props.target };
    },
    get elementBound() {
      return new Bound(...(props.xywh as [number, number, number, number]));
    },
  };
  return {
    model: model as unknown as GfxPrimitiveElementModel,
    set: (prop, value) => {
      props[prop] = value;
    },
  };
}

const node = (id: string, x: number, text?: string) =>
  element(id, [x, 400, 40, 40], 'test:node', { text });

function edge(id: string, source: string, target: string): Mutable {
  const made = element(id, [0, 0, 10, 10], 'test:edge', { source, target });
  made.set('absolutePath', [
    [0, 0],
    [10, 10],
  ]);
  return made;
}

/** Everything a user can see about a finding — the unit both halves compare. */
const key = (violation: Violation) =>
  [
    violation.ruleId,
    violation.elementIds.join('+'),
    violation.backgroundId ?? '-',
    violation.severity,
    violation.exemption ?? '-',
  ].join('|');

const keys = (violations: readonly Violation[]) => violations.map(key).sort();

/** A finding is ABOUT the seed when it names one of its ids, or its map. */
const touching =
  (seed: ReadonlySet<string>) =>
  (violation: Violation): boolean =>
    violation.elementIds.some(id => seed.has(id)) ||
    (violation.backgroundId !== undefined && seed.has(violation.backgroundId));

/** The two halves of the contract, asserted together and always. */
function contract(
  seeded: readonly Violation[],
  full: readonly Violation[],
  seed: ReadonlySet<string>,
  what: string
): void {
  const inFull = new Set(keys(full));
  expect(
    keys(seeded).filter(k => !inFull.has(k)),
    `${what}: a seeded pass invented a verdict a full pass does not give`
  ).toEqual([]);
  expect(
    keys(seeded.filter(touching(seed))),
    `${what}: a seeded pass missed a verdict about its own seed`
  ).toEqual(keys(full.filter(touching(seed))));
}

describe('a seeded evaluation is the full one, restricted to the seed', () => {
  /**
   * Two independent overlaps, two unnamed nodes and an arrow — enough that a
   * narrowed pass and a full one have different amounts to say.
   */
  function board() {
    const map = element('map', [0, 0, 1600, 900], 'test:frame');
    const parts = [
      map,
      node('a', 100),
      node('b', 120),
      node('c', 400, 'Named'),
      node('d', 420, 'Named'),
      edge('e1', 'a', 'b'),
      edge('e2', 'b', 'c'),
    ];
    return { map, elements: parts.map(part => part.model) };
  }

  const RULES = [OVERLAP, NAMED_ON_DEMAND, NO_INBOUND];

  /** What `evaluateCheckup` and `evaluateRules` build for a seed, verbatim. */
  const asIncremental = (
    rules: readonly ValidationRule[],
    elements: readonly GfxPrimitiveElementModel[],
    seed: ReadonlySet<string>
  ) => ({
    dirty: seed,
    previous: [] as Violation[],
    wasIn: frameMembership(rules, elements),
  });

  it('holds for evaluateRules, whatever is seeded', () => {
    const { elements } = board();
    const full = evaluateRules(RULES, elements);
    expect(full.length).toBeGreaterThan(0);

    for (const seed of [['a'], ['b'], ['c', 'd'], ['e1'], ['a', 'e2']]) {
      const set = new Set(seed);
      contract(
        evaluateRules(RULES, elements, [], asIncremental(RULES, elements, set)),
        full,
        set,
        `evaluateRules {${seed.join(', ')}}`
      );
    }
  });

  it('holds for evaluateCheckup, whatever is seeded', () => {
    const { elements } = board();
    const full = evaluateCheckup(RULES, elements);
    expect(full.length).toBeGreaterThan(0);

    for (const seed of [['a'], ['b'], ['c', 'd'], ['e1'], ['a', 'e2']]) {
      const set = new Set(seed);
      contract(
        evaluateCheckup(RULES, elements, [], set),
        full,
        set,
        `evaluateCheckup {${seed.join(', ')}}`
      );
    }
  });

  it('judges the CLOSURE of the seed, and carries nothing', () => {
    const { elements } = board();
    // `a → b → c`: both `b` and `c` are pointed at, so a whole-board check-up
    // indicts the pair.
    expect(
      evaluateCheckup([NO_INBOUND], elements).map(v => v.elementIds.join('+'))
    ).toEqual(['b', 'c']);

    // Seeding the FIRST arrow reaches `b` — its own end — and stops there. `c`
    // is two hops away, was never asked about, and is not carried over from
    // anywhere: `previous` is empty by construction.
    expect(
      evaluateCheckup([NO_INBOUND], elements, [], new Set(['e1'])).map(v =>
        v.elementIds.join('+')
      )
    ).toEqual(['b']);
  });

  it('a frame in the seed asks about the whole map', () => {
    const { elements } = board();
    const seed = new Set(['map']);
    // Not "the findings that name the map": every rule measured against it goes
    // back through a full pass, so the answer IS the full one.
    expect(keys(evaluateCheckup(RULES, elements, [], seed))).toEqual(
      keys(evaluateCheckup(RULES, elements))
    );
    expect(
      keys(
        evaluateRules(RULES, elements, [], asIncremental(RULES, elements, seed))
      )
    ).toEqual(keys(evaluateRules(RULES, elements)));
  });

  it('honours levels and arbitrations exactly as the full pass does', () => {
    const AUDIT: ValidationProfile = {
      id: 'test.audit',
      framework: 'test',
      labelKey: 'com.labre.test.profile.audit',
      isDefault: true,
      rules: { [NO_INBOUND.id]: 'audit' },
    };
    const { map, elements } = board();
    map.set('validationProfile', AUDIT.id);
    // `b` is excused from the arrow rule; `c` is not. Both are indicted by a
    // full pass, with different `exemption` — which the key carries.
    const excused = elements.find(el => el.id === 'b') as {
      validationExceptions?: unknown;
    };
    Object.defineProperty(excused, 'validationExceptions', {
      get: () => [{ ruleId: NO_INBOUND.id }],
      configurable: true,
    });

    const full = evaluateCheckup(RULES, elements, [AUDIT]);
    expect(full.some(v => v.exemption === 'element')).toBe(true);
    expect(full.some(v => v.severity === 'audit')).toBe(true);

    for (const seed of [['e1'], ['e2'], ['b', 'c']]) {
      const set = new Set(seed);
      contract(
        evaluateCheckup(RULES, elements, [AUDIT], set),
        full,
        set,
        `levelled {${seed.join(', ')}}`
      );
    }
  });
});

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

function makeManager(
  surface: ReturnType<typeof fakeSurface>,
  rules: readonly ValidationRule[],
  profiles: readonly ValidationProfile[] = []
) {
  return new ValidationManager({
    surface,
    surface$: signal(surface),
    std: {
      provider: {
        getAll: (identifier: unknown) =>
          identifier === ValidationRuleIdentifier
            ? new Map(rules.map(rule => [rule.id, rule]))
            : identifier === ValidationProfileIdentifier
              ? new Map(profiles.map(profile => [profile.id, profile]))
              : new Map(),
      },
      getOptional: () => null,
    },
  } as never);
}

describe('a host can hand the manager its own dirty set (PF7.9)', () => {
  afterEach(() => vi.useRealTimers());

  /** `a` unnamed, `b` and `c` named — one finding to start from. */
  function board() {
    const map = element('map', [0, 0, 1600, 900], 'test:frame');
    const a = node('a', 100);
    const b = node('b', 400, 'Named');
    const c = node('c', 700, 'Named');
    const elements = [map, a, b, c].map(part => part.model);
    return { map, a, b, c, elements, surface: fakeSurface(elements) };
  }

  it('re-judges on the spot, without waiting for the debounce', () => {
    vi.useFakeTimers();
    const { b, elements, surface } = board();
    const manager = makeManager(surface, [NAMED]);
    manager.mounted();
    expect(manager.violations$.peek()).toHaveLength(1);

    // The host renames `b` away and SAYS SO. No event, no 120 ms.
    b.set('text', '');
    manager.evaluate({ dirty: new Set(['b']) });

    expect(keys(manager.violations$.peek())).toEqual(
      keys(evaluateRules([NAMED], elements))
    );
    expect(vi.getTimerCount()).toBe(0);
    manager.unmounted();
  });

  it('narrows to the seed — and a frame in it means "the whole board"', () => {
    vi.useFakeTimers();
    const { b, c, elements, surface } = board();
    const manager = makeManager(surface, [NAMED]);
    manager.mounted();

    // Two nodes lose their names at once, and the host asks about ONE of them.
    b.set('text', '');
    c.set('text', '');
    manager.evaluate({ dirty: new Set(['b']) });
    expect(keys(manager.violations$.peek())).toEqual([
      'test.named|a|map|warning|-',
      'test.named|b|map|warning|-',
    ]);

    // Naming the MAP is a different question: judge this board. `c` comes back
    // even though nobody mentioned it.
    manager.evaluate({ dirty: new Set(['map']) });
    expect(keys(manager.violations$.peek())).toEqual(
      keys(evaluateRules([NAMED], elements))
    );
    expect(manager.violations$.peek()).toHaveLength(3);
    manager.unmounted();
  });

  it('folds a pending debounce into the seed instead of losing it', () => {
    vi.useFakeTimers();
    const { b, c, elements, surface } = board();
    const manager = makeManager(surface, [NAMED]);
    manager.mounted();

    // The user types `b`'s name away: the subscription arms the timer.
    b.set('text', '');
    surface.elementUpdated.emit('b');
    expect(vi.getTimerCount()).toBe(1);

    // Before it fires, the host asks about `c` alone. `b` must not be dropped
    // on the floor with the timer.
    c.set('text', '');
    manager.evaluate({ dirty: new Set(['c']) });

    expect(keys(manager.violations$.peek())).toEqual(
      keys(evaluateRules([NAMED], elements))
    );
    expect(manager.violations$.peek()).toHaveLength(3);
    expect(vi.getTimerCount()).toBe(0);
    manager.unmounted();
  });

  it('runs a check-up on a seed, and reports only what it was asked', async () => {
    const { map, surface } = board();
    // Nothing is named but `b` and `c`, and `a` never was.
    const manager = makeManager(surface, [NAMED_ON_DEMAND]);
    manager.mounted();

    const whole = await manager.runCheckup(map.model);
    expect(whole?.results.map(v => v.elementIds.join('+'))).toEqual(['a']);

    // A seed that misses the only offender: a partial answer, not a wrong one.
    const elsewhere = await manager.runCheckup(map.model, new Set(['b']));
    expect(elsewhere?.results).toEqual([]);
    expect(elsewhere?.done).toBe(elsewhere?.total);

    // ...and one that hits it says exactly what the whole board said about it.
    const seeded = await manager.runCheckup(map.model, new Set(['a']));
    expect(keys(seeded?.results ?? [])).toEqual(keys(whole?.results ?? []));
    manager.unmounted();
  });
});
