# ADR 0015 — A validation rule declares what its verdict depends on

- Status: **accepted** (2026-09-08)
- Deciders: Mathieu Jolly
- Milestone: PF5 chantier A
- Related ADRs: [0009](0009-reversed-flag-contract.md) (rules ship with the
  tooling), [0010](0010-persisted-relation-direction.md) (the persisted pair a
  relation family reads).

## The question

The engine re-judges the WHOLE surface on every pass. Only `no-overlap` knows
what changed (`IncrementalContext`), and it uses that knowledge for its pair
walk alone. To re-evaluate a dirty set instead of a board (PF5.4), the engine
has to know, per rule, **what a verdict on one subject depends on** — otherwise
"only re-check what moved" is a guess, and a wrong guess is a stale verdict on
a canvas that looks fresh.

## Decision

The scope is **declared as data, and owned by the FAMILY**:
`RULE_SCOPES: Record<RuleFamily, RuleScope>`, one line per family beside
`RULE_FAMILIES`, each carrying a one-line justification naming what its
evaluator reads. A rule may add `scope?: RuleScope`, which can only **WIDEN** —
`scopeOf(rule)` is the wider of the two, computed as a `Math.max` over an
ordered list, so narrowing is impossible by construction rather than by a test
somebody has to remember. An unknown family — a serialized rule shipped by a
host against a build that lacks it — resolves to `'surface'`.

**Per-rule declaration was rejected.** A rule does not evaluate itself: its
family's function does. A per-rule scope can therefore lie about what its own
verdict reads, and the lie is invisible until PF5.4 skips a subject that should
have been re-judged. It would also have to be copied onto the 60-odd rules the
seven packs ship, where one omission is a stale verdict and no test can tell an
omission from a deliberate `'element'`.

**Nothing consumes it yet.** No evaluator reads the field, `evaluateRules` is
untouched, and PF5.3 changes no verdict — the whole existing suite is the proof.

## The four scopes

Ordered; each level includes the previous.

| scope       | a verdict on one subject depends on                                                                                                     |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `element`   | its own props, plus the frame(s) it is attributed to — a dirty frame already forces a full pass, so frames are free here                |
| `relations` | the subject, the edges touching it, and the elements at the other end of those edges                                                    |
| `frame`     | every subject of the rule attributed to the same frame: majorities, counts, order within a frame, "is there another one of these on me" |
| `surface`   | anything else. Today's behaviour for every family, and the answer for anything unknown                                                  |

Over-approximating is always safe — a wider scope re-evaluates more than it had
to. Under-approximating is a stale verdict. So a family whose evidence is
ambiguous is declared wider, never narrower, and two families were widened out
of the first classification on reading their evaluators: `attachment` (its
carriers are collected from the whole surface, bounded by a tolerance and by no
frame) and `reachability` (a global traversal — its own header already said any
dirty edge invalidates the answer).

## Consequences

- **PF5.4 computes its closure from this table** and from nothing else. That is
  the only reason the table exists, and it is why the scopes are four ordered
  levels rather than a free-form description.
- **A family that changes what its evaluator reads must change its line here**,
  on the same commit. `Record<RuleFamily, RuleScope>` makes a NEW family without
  an entry a build error; a family that silently starts reading more is the
  failure mode this ADR cannot prevent, and the justification comment beside
  each line is what makes it reviewable.
- **No persisted data, no schema change, no red zone.** `scope` lives on the
  rule declaration, which is code a framework ships — never a document. A host
  shipping a serialized rule with an unknown `scope` value gets `'surface'`.
- **A framework can widen without touching the engine**: a rule that reads more
  than its family usually does says so on itself, and pays a wider closure.
