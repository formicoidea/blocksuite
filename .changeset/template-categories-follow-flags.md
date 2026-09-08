---
'@labre/affine-gfx-template': minor
'@labre/affine-gfx-bpmn': patch
'@labre/affine-gfx-c4': patch
'@labre/affine-gfx-cynefin-estuarine': patch
'@labre/affine-gfx-ddd-aggregate': patch
'@labre/affine-gfx-ddd-context-map': patch
'@labre/affine-gfx-ddd-core-domain': patch
'@labre/affine-gfx-ddd-event-storming': patch
'@labre/affine-gfx-edgy': patch
'@labre/affine-gfx-mindmap': patch
'@labre/affine-gfx-wardley': patch
---

fix(edgeless): the Templates panel lists exactly the categories of the frameworks registered on its editor, without a reload (#244)

A framework's category was appended to a module-level registry from
`effect()` and never removed, so a host that re-mounted the editor with a
framework switched off kept seeing its category until a full page reload.
Categories are now registered in the editor's DI container
(`TemplateCategoryExtension`, from the flag-gated view extension's `setup()`)
and the panel reads them from the `std` of the edgeless it opens on. The
remembered category tab falls back to the first one when it no longer exists.

API: `extendTemplateCategory` is removed; register
`TemplateCategoryExtension(category)` from `setup()` instead.
`EdgelessTemplatePanel.templates.extend(manager)` (the global host hook) is
unchanged, and `templateManagerFor(std)` exposes the per-editor catalogue.
