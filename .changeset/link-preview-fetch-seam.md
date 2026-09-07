---
'@labre/affine-shared': patch
---

feat(blocks): link previews accept host headers and a configurable X endpoint

`LinkPreviewService` now exposes `setHeaders(fn)` — a hook whose headers are
merged over `Content-Type` on the standard preview request, so a host can send
its own `Authorization` header without re-implementing `query`. It also exposes
`setTwitterEndpoint(prefix | null)`: a string replaces the `fxtwitter` prefix
(the tweet id is appended) and receives the host headers too, while `null`
routes tweet URLs through the standard endpoint. Both are optional on
`LinkPreviewProvider`, and the default behaviour is unchanged — the third-party
fxtwitter endpoint never receives the host headers.
