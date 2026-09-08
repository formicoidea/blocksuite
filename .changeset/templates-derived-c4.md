---
'@labre/affine-gfx-c4': patch
---

feat(edgeless): C4 gains a Templates category, derived from its commands

C4 was the only framework the senior menu's Templates panel had nothing for: the
pack shipped with thirteen commands and no category at all, so a C4 diagram
could only ever be started from the sub-menu. The panel now offers the twelve
artefacts the toolbox draws — the board, the nine element kinds with their
external variants, and the two boundaries — each with a preview in the stencil's
own colours.

Every one of them is DERIVED: the template is the command, run once against a
recording surface, so a component dropped from the panel arrives as the five
elements the button produces — the shape, its name, its type line, its
description and the group that makes them one thing — with the type line reading
the stencil's own prompt and a boundary carrying its variant and its role
together. A parity test re-runs each command and compares, so the panel cannot
drift away from the toolbox the way hand-written palettes did.
