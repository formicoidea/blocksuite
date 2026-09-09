---
'@labre/affine-widget-keyboard-toolbar': patch
'@labre/affine-widget-linked-doc': patch
---

Opening a page-mode document in a mobile browser no longer throws when the host
registers no `VirtualKeyboardProvider`. That provider is host-supplied, and the
keyboard toolbar and the mobile linked-doc menu were both demanding it outright:
on a plain web host the document open died with
`Service [VirtualKeyboardProvider] not found in container`. Both now treat it as
optional — the keyboard toolbar falls back to its built-in behaviour, and the
linked-doc menu sits at a zero keyboard offset.
