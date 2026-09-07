---
'@labre/affine-block-surface': patch
---

perf(edgeless): audit-severity rules leave the real-time drawing path

An `audit` finding is dropped before anything is drawn, yet the rules raising
one were still walked on every gesture. A rule declared `audit` is now evaluated
on demand — by a check-up — unless a level of requirement promotes it above
`audit`, which is what makes the finding visible again. Eleven shipped rules
leave the drawing path: four BPMN, five C4 and one in each DDD pack. No visible
change: the same findings are reported, at the moment they are read.
