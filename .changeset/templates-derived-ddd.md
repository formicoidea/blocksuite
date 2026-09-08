---
'@labre/affine-gfx-ddd-shared': patch
'@labre/affine-gfx-ddd-event-storming': patch
'@labre/affine-gfx-ddd-core-domain': patch
'@labre/affine-gfx-ddd-context-map': patch
'@labre/affine-gfx-ddd-aggregate': patch
---

feat(edgeless): DDD palette templates are derived from the creation commands

The Event Storming, Core Domain Chart and Context Map sections of the Templates
panel were hand-written surface JSON, last touched in June 2026 while the three
toolboxes kept moving — so what the panel dropped had stopped being what the
buttons draw. A sticky arrived as one flat rectangle instead of the shadow and
face a post-it is made of, without the text fit that keeps the handwriting
inside the square; not one of the thirty-one templates carried a semantic role,
which is what the validation engine, the automatic legend and "Change type" all
read, so an Event Storming board built from the panel was mute to all three; the
Core Domain chart was not recognised as a chart; the sub-domain dots came
without their name, and the markers without their letter.

Every one of them is now DERIVED: the template is produced by running the
command itself against a recording surface, so it cannot disagree with the
toolbox, and each package's parity test re-runs its commands and compares. The
Event Storming board and the Context Map board join the panel, which never had
them.

Ten entries are removed rather than repaired: the nine Context Map relationship
patterns and Core Domain's "Movement over time". Those buttons stopped dropping
a drawing some time ago — a relation and a movement are statements you draw
between two real artefacts, and the palette was still shipping the mid-air
version they replaced. Draw them from the sub-menu instead, where the endpoints
attach.

The Aggregate Design Canvas stays hand-composed (no command draws it) and its
title bar, until now dark on dark, is legible again.
