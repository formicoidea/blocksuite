# Decisions

**A change that touches a stored format or a host contract is an ADR before
it is code.**

## When to write one

- A new or changed field on a block schema or an element model.
- A new seam the host must fill, or a change to an existing one.
- A rule every framework must obey (menu caps, telemetry names, flag
  semantics).
- A deviation from BlockSuite's original design.
- A "we deliberately do not do X" that a future audit would otherwise flag as
  missing (ADR 0013 is the model).

Bug fixes and features that stay within existing contracts need none.

## Format

One file `docs/adr/NNNN-short-title.md`:

```
# NNNN — Title

- Status: proposed | accepted | superseded by NNNN
- Date: YYYY-MM-DD

## Context
What forced the decision. Cite the issue, the incident, the measurement.

## Decision
Numbered, one sentence each. What is now true.

## Consequences
What becomes easier, what becomes harder, what a contributor must respect.
What stays loadable.

## Amendments
Dated additions, never rewrites of the decision above.
```

Keep it short. The ADRs in this repo are the reference for tone: direct,
sourced, no hedging.

## Lifecycle

1. Open a PR with the ADR as `proposed`. Discuss there.
2. Merge as `accepted` with, or just before, the code.
3. Never edit an accepted decision: add a dated amendment, or write a new
   ADR that supersedes it and link both ways.

## The index

See [adr/README.md](../adr/README.md). Keep it current: one line per ADR,
status and a hook.
