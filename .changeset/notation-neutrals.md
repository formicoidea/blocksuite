---
'@labre/affine-shared': minor
'@labre/affine-block-surface': minor
'@labre/affine-gfx-wardley': minor
'@labre/affine-gfx-bpmn': minor
'@labre/affine-gfx-c4': minor
'@labre/affine-gfx-edgy': minor
'@labre/affine-gfx-cynefin-estuarine': minor
'@labre/affine-gfx-ddd-shared': minor
'@labre/affine-gfx-ddd-context-map': minor
'@labre/affine-gfx-ddd-core-domain': minor
'@labre/affine-gfx-ddd-event-storming': minor
'@labre/affine-gfx-template': minor
---

feat(edgeless): every framework notation now shares one neutral scale, `NOTATION_NEUTRALS` (`@labre/affine-shared/consts`), taken from the Wardley map: ink, frame ink, label grey, divider, card, card border, legend border and band. Framework hues and stencil-prescribed neutrals (C4 `#444444`, the EDGY base-shape ink `#262626`, Cynefin/Estuarine official inks) are unchanged. Board backgrounds repaint with the scale. Colours already stored on user elements are left untouched, and only newly created elements take the new defaults.
