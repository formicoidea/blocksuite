---
'@labre/affine-block-surface': minor
---

perf(edgeless): audit rules leave the real-time path under the profile in force

An `audit` finding is dropped before anything is drawn, yet the rules raising
one were still walked on every gesture. The moment a rule is evaluated at is now
decided against the LEVEL IN FORCE — the framework's default profile, and the one
each frame on the board has chosen — rather than against its own declaration: a
rule no level in force shows is evaluated by a check-up instead of by the drawing
path. A frame switched to a level that promotes it gets it back on the next
gesture, because choosing a level already marks the frame dirty. Check-ups still
evaluate everything, with the same severities, so no finding is lost and nothing
visible changes.

On the default (sketch) level of every framework that ships one, the whole rule
pack now costs the gesture path nothing: 22 BPMN rules, 16 C4, 5
ddd-context-map, 4 ddd-core-domain, 4 Wardley, 3 event-storming, 2 EDGY. Raising
a board gives back exactly what that level shows — 16 of 22 on `bpmn.descriptive`,
9 of 16 on `c4.strict`.

`onDemandRules(rules)` is replaced by `checkupRules(rules, elements, profiles)`,
which answers the same question against the surface the check-up would run on.
