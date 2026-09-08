---
'@labre/affine-block-surface': patch
---

perf(edgeless): while drawing, only what a change can affect is re-judged

Every validation family now re-judges the closure of what actually changed
instead of the whole board — the closure is derived from the dependency scope
each family declares (`docs/adr/0015`) and from nothing else, and a family whose
verdict reads the whole surface still gets a full pass.

Measured on a Wardley map, all four rules, profiles in force, three labels
dragged: the tick is 3.7 ms at 2000 elements, 8.0 ms at 4000 (frame budget
16 ms) and 27.3 ms at 8000, against 6.6 / 16.7 / 64.1 ms for the full pass it
replaces. Wardley is the pack this helps least — two of its four rules read the
whole surface by declaration, and the two it narrows do almost nothing per
subject; the saving grows with what a family does to each subject it judges.

No verdict changes: a fuzz over the seven shipped packs asserts, on random
boards under random mutation, that an incremental pass answers exactly what a
full pass would.
