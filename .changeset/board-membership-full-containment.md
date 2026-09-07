---
'@labre/affine-block-surface': patch
'@labre/affine-gfx-bpmn': patch
---

fix(edgeless): an element belongs to a board only when it is wholly inside it

The reading panel, the audit facts and the BPMN pool facts now answer "which
board is this on" exactly as the validation engine does: full containment of the
element's bound in the board's, ties broken by the smaller id. A node straddling
the edge of a map is no longer read or audited as a member — the audit reports it
with its id and role and nothing else, like an element on bare canvas, instead of
attributing it to the nearest map. Inner regions keep the centre test: a BPMN
lane or a Wardley evolution stage is meant to be straddled, a board is not.
