---
'@labre/affine-block-surface': patch
---

perf(edgeless): overlap checks no longer compare every pair of artefacts

The readability pass sorts the artefacts it compares by their left edge and
stops each comparison as soon as the next one starts further right than the
current one ends, instead of testing all of them against all of them.

On a 2000-element reference map the whole validation pass drops from 27.1 ms to
11.4 ms, and the overlap family alone from 26.3 ms to 8.4 ms — from a frame and
a half to well inside one.

The findings are identical: 83 % of the couples the old pass compared could not
possibly have overlapped, whatever their geometry.
