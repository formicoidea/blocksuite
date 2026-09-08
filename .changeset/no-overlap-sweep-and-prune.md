---
'@labre/affine-block-surface': patch
---

perf(edgeless): overlap checks no longer compare every pair of artefacts

The readability pass sorts the artefacts it compares by their left edge and
stops each comparison as soon as the next one starts further right than the
current one ends, instead of testing all of them against all of them. Of the
couples that survive that, the ones that share no vertical extent are now
dropped on two subtractions, before the rule's own pair test is built.

On a 2000-element reference map the whole validation pass drops from 15.3 ms to
6.3 ms, and the overlap family alone from 10.7 ms to 3.8 ms — from the whole
frame to a fraction of one. At 4000 elements the family goes from 42.6 ms to
14.0 ms.

The findings are identical: of the two million couples the old pass compared on
a 4000-element map, 27 037 could possibly have overlapped, and those are exactly
the ones still compared.
