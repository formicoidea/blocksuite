import {
  dirtyClosure,
  evaluateRules,
  frameMembership,
  type ValidationProfile,
  type ValidationRule,
  verdictPropsOf,
  type Violation,
} from '@labre/affine-block-surface';
import { Bound } from '@labre/global/gfx';
import { BPMN_PROFILES, BPMN_RULES } from '@labre/affine-gfx-bpmn';
import { C4_PROFILES, C4_RULES } from '@labre/affine-gfx-c4';
import {
  CONTEXT_MAP_PROFILES,
  CONTEXT_MAP_RULES,
} from '@labre/affine-gfx-ddd-context-map';
import {
  CORE_DOMAIN_PROFILES,
  CORE_DOMAIN_RULES,
} from '@labre/affine-gfx-ddd-core-domain';
import {
  EVENT_STORMING_PROFILES,
  EVENT_STORMING_RULES,
} from '@labre/affine-gfx-ddd-event-storming';
import { EDGY_RULES } from '@labre/affine-gfx-edgy';
import { WARDLEY_PROFILES, WARDLEY_RULES } from '@labre/affine-gfx-wardley';
import type { GfxPrimitiveElementModel, RoleDefs } from '@labre/std/gfx';
import { describe, expect, it } from 'vitest';
import * as Y from 'yjs';

/**
 * PF5.4 — **an incremental pass returns exactly what a full pass would.**
 *
 * The contract of the whole slice, asserted the only way it can honestly be
 * asserted: against the SHIPPED rule packs, on randomly generated boards, under
 * randomly generated mutation batches, comparing the two answers finding for
 * finding. A hand-written expectation proves that one case works; this proves
 * that the closure is not a guess.
 *
 * It lives in `@labre/affine-all` because that is the one package that can reach
 * every framework at once — the engine's own package cannot import a gfx module
 * — and because the families only exist together here: `no-overlap` beside
 * `relation-endpoints` beside `role-count` is a board no single pack produces.
 *
 * ## What a failure here means
 *
 * The seed is in every assertion message. Re-run with it pinned and the same
 * board and the same mutations come back, because every random draw in this file
 * comes from {@link mulberry32} and nothing else.
 *
 * A failure is never "the fuzz is flaky": either the closure under-approximates
 * (a subject that could have changed was not re-judged, so a stale verdict
 * survived) or the carry-over is wrong (a finding was kept that a full pass
 * drops, or dropped without being re-raised). Both are the same bug from the
 * user's side — a canvas that looks fresh and is not.
 */

/** Seeded PRNG. Small, exact, and reproducible from one integer. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The identity of a finding, for comparison: everything a user can see about it.
 *
 * `elementIds` are joined in the order the family produced them, NOT sorted — a
 * carried finding and a re-raised one come off the same line of the same family,
 * so an order that differed between the two passes would be a real divergence
 * and not a presentation detail.
 */
const key = (violation: Violation) =>
  [
    violation.ruleId,
    violation.elementIds.join('+'),
    violation.backgroundId ?? '-',
    violation.severity,
    violation.exemption ?? '-',
  ].join('|');

const keys = (violations: readonly Violation[]) => violations.map(key).sort();

/**
 * PRODUCTION-SHAPED element stand-in, backed by a real `Y.Map` on a real
 * `Y.Doc` — the `validation.bench` fixture, made MUTABLE, because a fuzz whose
 * board never changes proves nothing.
 *
 * Every prop the registered rules can read is a getter over the same map, so a
 * mutation is one `yMap.set` and the engine sees exactly what a peer's edit
 * would make it see. The dynamic half — a framework's own `levelProp`, its
 * transition toggles, the fact a majority is counted on — comes from
 * {@link verdictPropsOf}, so a pack that adds one is covered without this file
 * learning its name.
 */
interface Fixture {
  model: GfxPrimitiveElementModel;
  write(key: string, value: unknown): void;
}

const FIXED_KEYS = [
  'xywh',
  'role',
  'text',
  'fontSize',
  'textAlign',
  'absolutePath',
  'validationExceptions',
  'validationProfile',
] as const;

function fixture(
  doc: Y.Doc,
  id: string,
  xywh: [number, number, number, number],
  role: string | undefined,
  dynamicKeys: readonly string[]
): Fixture {
  const yMap = new Y.Map<unknown>();
  doc.getMap<Y.Map<unknown>>('elements').set(id, yMap);
  yMap.set('xywh', `[${xywh.join(',')}]`);
  if (role !== undefined) yMap.set('role', role);

  const read = (name: string) =>
    (yMap.doc ? yMap.get(name) : null) ?? undefined;

  const model = { id } as Record<string, unknown>;
  for (const name of new Set([...FIXED_KEYS, ...dynamicKeys])) {
    // `source` and `target` are the two the engine reads THROUGH: it wants
    // `{ id }`, never the raw string.
    if (name === 'source' || name === 'target') continue;
    Object.defineProperty(model, name, {
      get: () => read(name),
      enumerable: true,
    });
  }
  for (const end of ['source', 'target'] as const) {
    Object.defineProperty(model, end, {
      get: () => {
        const bound = read(end);
        return bound === undefined ? undefined : { id: bound };
      },
      enumerable: true,
    });
  }
  Object.defineProperty(model, 'elementBound', {
    get: () => Bound.deserialize(read('xywh') as string),
    enumerable: true,
  });

  return {
    model: model as unknown as GfxPrimitiveElementModel,
    write: (name, value) => {
      if (value === undefined) yMap.delete(name);
      else yMap.set(name, value);
    },
  };
}

interface Pack {
  name: string;
  rules: readonly ValidationRule[];
  profiles: readonly ValidationProfile[];
}

const PACKS: readonly Pack[] = [
  { name: 'wardley', rules: WARDLEY_RULES, profiles: WARDLEY_PROFILES },
  { name: 'bpmn', rules: BPMN_RULES, profiles: BPMN_PROFILES },
  { name: 'c4', rules: C4_RULES, profiles: C4_PROFILES },
  { name: 'edgy', rules: EDGY_RULES, profiles: [] },
  {
    name: 'ddd-event-storming',
    rules: EVENT_STORMING_RULES,
    profiles: EVENT_STORMING_PROFILES,
  },
  {
    name: 'ddd-context-map',
    rules: CONTEXT_MAP_RULES,
    profiles: CONTEXT_MAP_PROFILES,
  },
  {
    name: 'ddd-core-domain',
    rules: CORE_DOMAIN_RULES,
    profiles: CORE_DOMAIN_PROFILES,
  },
  // The board no pack produces on its own, and the one the engine actually has
  // to survive: two frameworks framing against two different roles, judged in
  // one pass.
  {
    name: 'wardley+bpmn',
    rules: [...WARDLEY_RULES, ...BPMN_RULES],
    profiles: [...WARDLEY_PROFILES, ...BPMN_PROFILES],
  },
];

/** Every role the pack's rules speak of, with the kind each one declares. */
function vocabularyOf(rules: readonly ValidationRule[]) {
  const defs: RoleDefs = {};
  for (const rule of rules) Object.assign(defs, rule.roles);

  const frameRoles = new Set<string>();
  for (const rule of rules) {
    if (rule.backgroundRole !== undefined) frameRoles.add(rule.backgroundRole);
  }
  const subjectRoles = Object.keys(defs).filter(id => !frameRoles.has(id));
  return { defs, frameRoles: [...frameRoles].sort(), subjectRoles };
}

interface Board {
  elements: GfxPrimitiveElementModel[];
  write: Map<string, Fixture['write']>;
  doc: Y.Doc;
  /** Ids that can be an end of an edge — everything that is not an edge. */
  nodes: string[];
  frames: string[];
  /** Where the frames were drawn, for {@link place} to aim at their borders. */
  boxes: Box[];
}

/** `[x, y, w, h]` — the one shape every generated element is placed by. */
type Box = [number, number, number, number];

const NAMES = ['', 'Customer', 'Order', '', 'Pay', 'Ship'];

function build(pack: Pack, random: () => number, size: number): Board {
  const { defs, frameRoles, subjectRoles } = vocabularyOf(pack.rules);
  const dynamicKeys = [...verdictPropsOf(pack.rules)];
  const doc = new Y.Doc();
  const write = new Map<string, Fixture['write']>();
  const elements: GfxPrimitiveElementModel[] = [];
  const nodes: string[] = [];
  const frames: string[] = [];
  const boxes: Box[] = [];

  const add = (id: string, xywh: Box, role: string | undefined) => {
    const made = fixture(doc, id, xywh, role, dynamicKeys);
    write.set(id, made.write);
    elements.push(made.model);
    return made;
  };

  // 1 to 3 frames, normally side by side so an element is unambiguously on one
  // of them — or, dropped between two, on neither.
  //
  // But sometimes STRADDLING its neighbour, and that is not decoration: on
  // disjoint frames "the frame that wholly contains this box" and "the frame
  // whose plot holds its centre" are always the same answer, so a membership
  // built from the first alone would pass a fuzz that never overlaps two. A
  // small chart dropped on a big one attributes the same artefact twice, and it
  // is the shape the two readings disagree about.
  const frameCount = frameRoles.length === 0 ? 0 : 1 + Math.floor(random() * 3);
  for (let i = 0; i < frameCount; i++) {
    const role = frameRoles[i % frameRoles.length];
    const id = `frame-${i}`;
    const box: Box =
      i > 0 && random() < 0.4
        ? [(i - 1) * 2400 + 500, 150, 1500, 700]
        : [i * 2400, 0, 1600, 900];
    add(id, box, role);
    boxes.push(box);
    frames.push(id);
    nodes.push(id);
  }

  const nodeRoles = subjectRoles.filter(id => defs[id]?.kind !== 'edge');
  const edgeRoles = subjectRoles.filter(id => defs[id]?.kind === 'edge');

  // The nodes first, so the edges below have something real to bind.
  const nodeCount = Math.max(4, Math.floor(size * 0.6));
  for (let i = 0; i < nodeCount; i++) {
    const id = `n-${i}`;
    const role =
      nodeRoles.length === 0
        ? undefined
        : random() < 0.12
          ? undefined // a NEUTRAL element: the cheapest exit, and a third of a board
          : nodeRoles[Math.floor(random() * nodeRoles.length)];
    add(id, place(random, boxes), role);
    nodes.push(id);
    if (random() < 0.3) write.get(id)!('text', NAMES[i % NAMES.length]);
  }

  for (let i = nodeCount; i < size; i++) {
    const id = `e-${i}`;
    const role =
      edgeRoles.length === 0
        ? undefined
        : random() < 0.1
          ? undefined // a role-less link — what quick-connect draws
          : edgeRoles[Math.floor(random() * edgeRoles.length)];
    const box = place(random, boxes);
    const made = add(id, box, role);
    made.write('absolutePath', [
      [box[0], box[1]],
      [box[0] + box[2], box[1] + box[3]],
    ]);
    const [source, target] = ends(random, nodes);
    made.write('source', source);
    made.write('target', target);
  }

  // A level of requirement on some of the frames, and a handful of user
  // arbitrations: both are verdict-bearing props, so both have to move.
  for (const id of frames) {
    if (pack.profiles.length > 0 && random() < 0.5) {
      write.get(id)!(
        'validationProfile',
        pack.profiles[Math.floor(random() * pack.profiles.length)].id
      );
    }
  }
  for (const element of elements) {
    if (random() < 0.05) {
      write.get(element.id)!('validationExceptions', [
        { ruleId: pack.rules[Math.floor(random() * pack.rules.length)].id },
      ]);
    }
  }

  return { elements, write, doc, nodes, frames, boxes };
}

/**
 * A box: mostly on a frame, often ACROSS one of its borders, sometimes far
 * away.
 *
 * Uniform over the frame grown by one element on each side, and that is the
 * whole point. Every attribution in the engine answers "which frame is this
 * on", and its three readings — whole containment, the nearest frame by gap,
 * and the centre inside the frame's PLOT (the box minus the margin a framework
 * declares) — can only disagree about an artefact lying across a border. A
 * generator that dropped everything comfortably inside would have proved the
 * closure right about the easy half of the board.
 */
function place(random: () => number, frames: readonly Box[]): Box {
  const w = 20 + Math.floor(random() * 120);
  const h = 20 + Math.floor(random() * 60);
  if (frames.length === 0 || random() < 0.2) {
    return [-3000 + Math.floor(random() * 900), 1200, w, h];
  }
  const [fx, fy, fw, fh] = frames[Math.floor(random() * frames.length)];
  return [
    fx - w + Math.floor(random() * (fw + w)),
    fy - h + Math.floor(random() * (fh + h)),
    w,
    h,
  ];
}

/** Two ends: usually real, sometimes dangling, sometimes the same element. */
function ends(
  random: () => number,
  nodes: readonly string[]
): [string, string] {
  const pick = () => nodes[Math.floor(random() * nodes.length)];
  const source = pick();
  if (random() < 0.1) return [source, source];
  if (random() < 0.1) return [source, 'gone-forever'];
  // Drawn from a SMALL window on purpose: duplicated pairs and exclusive
  // couples only exist when two edges land on the same two nodes.
  const near = nodes.slice(0, Math.max(2, Math.floor(nodes.length / 6)));
  return [source, near[Math.floor(random() * near.length)]];
}

/**
 * One mutation batch, applied in place. Returns the dirty set the manager's
 * subscriptions would have accumulated: every id added, removed or updated.
 */
function mutate(
  board: Board,
  pack: Pack,
  random: () => number,
  step: number
): Set<string> {
  const { defs, subjectRoles } = vocabularyOf(pack.rules);
  const dirty = new Set<string>();
  const batch = 1 + Math.floor(random() * 6);

  for (let i = 0; i < batch; i++) {
    const live = board.elements;
    if (live.length === 0) break;
    const at = Math.floor(random() * live.length);
    const target = live[at];
    const write = board.write.get(target.id)!;
    const draw = Math.floor(random() * 10);

    switch (draw) {
      case 0:
      case 1: {
        // Moved — within a frame, across to another, or clean off the board.
        const box = place(random, board.boxes);
        write('xywh', `[${box.join(',')}]`);
        dirty.add(target.id);
        break;
      }
      case 2: {
        // Resized, which re-attributes anything judged by whole containment.
        const bound = target.elementBound;
        write(
          'xywh',
          `[${bound.x},${bound.y},${20 + Math.floor(random() * 400)},${20 + Math.floor(random() * 200)}]`
        );
        dirty.add(target.id);
        break;
      }
      case 3: {
        // Deleted. A frame can be the one that goes, and that is the case the
        // guard in `dirtyClosure` exists for.
        live.splice(at, 1);
        dirty.add(target.id);
        break;
      }
      case 4: {
        // Created, bound to two existing elements when it is an edge.
        const id = `new-${step}-${i}`;
        const role =
          subjectRoles.length === 0
            ? undefined
            : subjectRoles[Math.floor(random() * subjectRoles.length)];
        const box = place(random, board.boxes);
        const made = fixture(board.doc, id, box, role, [
          ...verdictPropsOf(pack.rules),
        ]);
        board.write.set(id, made.write);
        board.elements.push(made.model);
        if (role !== undefined && defs[role]?.kind === 'edge') {
          made.write('absolutePath', [
            [box[0], box[1]],
            [box[0] + box[2], box[1] + box[3]],
          ]);
          const [source, end] = ends(random, board.nodes);
          made.write('source', source);
          made.write('target', end);
        } else {
          board.nodes.push(id);
        }
        dirty.add(id);
        break;
      }
      case 5: {
        // Re-typed: the same box, a different sentence.
        write(
          'role',
          subjectRoles.length === 0
            ? undefined
            : subjectRoles[Math.floor(random() * subjectRoles.length)]
        );
        dirty.add(target.id);
        break;
      }
      case 6: {
        // Re-pointed: the persisted pair IS the relation (`docs/adr/0010`).
        const [source, end] = ends(random, board.nodes);
        write(
          random() < 0.5 ? 'source' : 'target',
          random() < 0.5 ? source : end
        );
        dirty.add(target.id);
        break;
      }
      case 7: {
        write('text', NAMES[Math.floor(random() * NAMES.length)]);
        dirty.add(target.id);
        break;
      }
      case 8: {
        // An arbitration granted or revoked. Revoking DELETES the key, which is
        // the half that used to leave a stale `exemption` on a carried finding.
        write(
          'validationExceptions',
          random() < 0.5
            ? [
                {
                  ruleId:
                    pack.rules[Math.floor(random() * pack.rules.length)].id,
                },
              ]
            : undefined
        );
        dirty.add(target.id);
        break;
      }
      default: {
        // A level of requirement, on a frame — which sends the whole rule
        // through a full pass, and must therefore agree with one.
        if (board.frames.length === 0 || pack.profiles.length === 0) break;
        const frame = board.frames[Math.floor(random() * board.frames.length)];
        const setter = board.write.get(frame);
        if (setter === undefined) break;
        setter(
          'validationProfile',
          random() < 0.2
            ? undefined
            : pack.profiles[Math.floor(random() * pack.profiles.length)].id
        );
        dirty.add(frame);
        break;
      }
    }
  }

  return dirty;
}

const ITERATIONS = 300;

describe('an incremental pass answers exactly what a full pass would', () => {
  for (const pack of PACKS) {
    it(`${pack.name} (${pack.rules.length} rules, ${ITERATIONS} mutation batches)`, () => {
      // One seed per pack, derived from its name so a re-run of the same suite
      // walks the same boards — and so two packs never walk the same one.
      let seed = 0x5eed;
      for (const char of pack.name) seed = (seed * 31 + char.charCodeAt(0)) | 0;
      const random = mulberry32(seed);

      const board = build(pack, random, 30 + Math.floor(random() * 271));
      let previous = evaluateRules(pack.rules, board.elements, pack.profiles);
      // A board that never breaks a rule proves nothing about carrying findings
      // over, so the generator has to produce some.
      let raisedAtLeastOnce = previous.length > 0;
      // How often the closure actually NARROWED something. Without this the
      // suite could pass by never taking the incremental path at all, and
      // "identical answers" would be a tautology about two full passes.
      let narrowed = 0;
      let steps = 0;

      for (let step = 0; step < ITERATIONS; step++) {
        // BEFORE the mutation: where everything was is what the surface stops
        // being able to say the moment anything moves.
        const wasIn = frameMembership(pack.rules, board.elements);
        const dirty = mutate(board, pack, random, step);
        if (dirty.size === 0) continue;

        steps += 1;
        const closure = dirtyClosure(board.elements, dirty, previous, wasIn);
        if (
          pack.rules.some(rule => {
            const subjects = closure.subjectsOf(rule);
            return subjects !== null && subjects.size < board.elements.length;
          })
        ) {
          narrowed += 1;
        }

        const full = keys(
          evaluateRules(pack.rules, board.elements, pack.profiles)
        );
        const incremental = evaluateRules(
          pack.rules,
          board.elements,
          pack.profiles,
          { dirty, previous, wasIn }
        );

        expect(
          keys(incremental),
          `seed 0x${(seed >>> 0).toString(16)}, ${pack.name}, step ${step}, ` +
            `dirty {${[...dirty].join(', ')}}`
        ).toEqual(full);

        raisedAtLeastOnce ||= incremental.length > 0;
        previous = incremental;
      }

      expect(
        raisedAtLeastOnce,
        `${pack.name} never broke a single rule — the generator is drawing ` +
          `boards this pack has nothing to say about, so nothing was carried ` +
          `over and this test proved nothing`
      ).toBe(true);

      console.info(
        `[fuzz] ${pack.name}: ${narrowed}/${steps} batches took a NARROWED ` +
          `pass (the rest fell back to a full one — a touched frame, a level ` +
          `moved, a deletion, or a batch past the crossover)`
      );
      // A fifth is a floor, not a target: the generator deletes, re-types and
      // re-levels on purpose, and every one of those is a legitimate full pass.
      // What this refuses is a suite that never took the path it exists to
      // test.
      expect(narrowed * 5).toBeGreaterThan(steps);
    });
  }
});
