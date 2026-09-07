---
'@labre/affine-inline-link': patch
---

fix(blocks): hide the link toolbar's Card/Embed view conversions when the target block's view is disabled

With `{ bookmark: false }` (resp. `{ embed: false }`) the inline link toolbar
still offered "Card view" / "Embed view"; choosing one created a block whose
view extension was gated, so the link vanished into an empty block. The
conversions now check that the flavour they would create has a registered
view (`std.getView`), and the whole view dropdown disappears when no
conversion remains.
