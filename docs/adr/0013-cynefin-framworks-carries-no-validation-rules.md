# ADR 0013 — Cynefin/Estuarine carries no validation rules, by design

- Status: accepted (August 2026)
- Deciders: Mathieu Jolly
- Relates to [ADR 0009](./0009-reversed-flag-contract.md) (flags gate tooling, never content)

## Context

Seven of the eight frameworks declare `rules.ts`, `profiles.ts` and `legend.ts`, and are
evaluated by the validation engine. `cynefin-estuarine` declares none of the three. Read as
an inventory gap, this looks like unfinished work — the 2026-08-28 backlog audit classified
it exactly that way.

It is not a gap. Wardley, BPMN, C4 and the DDD frameworks are **notations**: they have a
grammar, so a placement can be wrong and an engine can say so. Cynefin is a **sensemaking
frame**. Which domain a situation belongs to is the participant's judgement about their own
context; there is no external truth for a rule to check. Validating it would assert an
authority the frame explicitly refuses.

## Decision

`cynefin-estuarine` ships without `rules.ts`, `profiles.ts` or `legend.ts`, and is not
registered with the validation engine. Its existing `roles.ts` and `nudges.ts` stay:
roles carry identity, nudges are descriptive prompts, neither is normative.

## Consequences

- A Cynefin board draws no violation badge, no severity profile, no conformity panel.
  The absence is the feature.
- Framework coverage of the validation platform is 7/8 and complete at that number. An audit
  reporting "missing `rules.ts`" should be closed against this ADR.
- Revisit only for a rule about _form_ rather than judgement — an element belonging to no
  domain, say. A rule about _where_ something belongs stays out of scope permanently.

## Amendment (2026-09-07) — reading is not validation

Nothing in the decision above changes. What follows names a distinction the original text
had no occasion to draw, because the reversed reading (MF3) did not exist yet.

**Reading is not validation.** The reading panel says what the document already states —
the artefact's type and the chain it specialises, the typed edges touching it, and whether
it is linked to a pivot record. It produces no rule, no severity, no verdict and no badge;
it writes nothing without the user asking, and what it can write are the two existing
promotion commands. Refusing to assert an authority the frame does not have (the argument
above) does not oblige us to refuse to say what a hexagon IS.

So:

- **The Estuarine constraint gets a reading profile** (`estuarine/reading.ts`,
  `ESTUARINE_READING`): type plus the linked-record section, no rule, no verdict. The
  hexagon already carries `estuarine:constraint` — the original decision kept `roles.ts`
  precisely because a role carries identity and is not normative — so this profile reads a
  role that was already there, on boards that already exist. It carries no `nature`
  (the framework ships no tag pack), no `relation` (it declares no edge role) and no
  `frame`: the energy/time plane declares no zones, and reading a "position" off the three
  reference curves would be the engine inventing a fact.
- **The Estuarine map is not read.** It is the frame the constraints are measured against,
  the same call every other framework makes about its own sheet.
- **A free element on a Cynefin board stays unreadable**, and that is the decision above
  working rather than a gap: Cynefin declares no role, an element with no role is never
  read, and the panel does not stand up. A constraint hexagon dropped on a Cynefin board
  IS read — it is an Estuarine artefact wherever it is drawn.
- Framework coverage of the READING platform is therefore 8/8, while coverage of the
  VALIDATION platform stays 7/8 and complete at that number. An audit that reads the first
  figure as contradicting the second should be closed against this amendment.
