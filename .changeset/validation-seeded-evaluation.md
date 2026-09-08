---
'@labre/affine-block-surface': minor
---

feat(edgeless): a host can seed validation and check-ups with its own dirty set (the selection)

`ValidationManager.evaluate` now takes `true` (the debounced path, as before) or
`{ dirty }` — the caller's own dirty set, run through the same pipeline and the
same guards, with any pending debounce folded in rather than dropped.
`evaluateCheckup(rules, elements, profiles, seed)` and
`ValidationManager.runCheckup(element, seed)` do the same for the on-demand
moment: the closure of the seed is judged and nothing is carried, so the answer
is exactly the fresh verdicts there.

The contract, for a seed `S`: `seeded ⊆ full`, and `seeded ∩ touching(S) =
full ∩ touching(S)` — a partial answer, never a wrong one. A frame id in the
seed means "re-judge this board" and lands on the existing dirty-frame guard,
i.e. a full pass. No UI changes.
