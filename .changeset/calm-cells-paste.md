---
'@labre/affine-block-database': patch
---

Pasting into a database text cell whose inline range cannot be resolved no
longer swallows the clipboard silently: the cell now lets the default paste
path act instead of cancelling the event with nothing inserted. The cell's
clipboard listeners are also removed with the capture flag they were added
with, so they no longer leak on disconnect. A regression test pins that a
property of any type added from the Table view shows up in it immediately.
