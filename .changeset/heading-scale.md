---
'@labre/affine-shared': minor
'@labre/affine-block-paragraph': minor
'@labre/affine-block-note': minor
'@labre/affine-block-callout': minor
'@labre/affine-widget-drag-handle': minor
---

feat(blocks): Labre owns its document heading scale (`HEADING_SCALE` in `@labre/affine-shared/consts`). H1 32 / H2 26 / H3 20 / H4 18 / H5 16 / H6 15px step down about 1.25× from the 40px doc title, so the first three levels read clearly apart and H1 never competes with the title. The drag-handle grabber, the callout emoji, the slash-menu previews and inline code in headings all derive from the same table. Document headings no longer follow the upstream `--affine-font-h-*` theme variables.
