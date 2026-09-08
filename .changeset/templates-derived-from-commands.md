---
'@labre/affine-gfx-template': minor
'@labre/affine-gfx-wardley': patch
'@labre/affine-block-surface': patch
---

feat(edgeless): Wardley palette templates are derived from the creation commands

A template of the senior menu's Templates panel used to be a hand-written copy
of what the toolbox creates, and every copy had drifted: no template grouped a
node with its name (the toolbox has since #51), the four map backgrounds
carried no `wardley:map` role and stayed resizable, the inertia bar lost its
text-fit mode, and five artefacts (Porter's forces, accelerator, decelerator,
the two areas) had no template at all.

`@labre/affine-gfx-template` gains `snapshotFromAction` / `templateFromCommand`:
a template is now produced by running the command itself against a recording
surface, so it cannot disagree with the toolbox. Snapshots carry an explicit
z-order for every element, and a template may declare `afterInsert` for a depth
that depends on what is already on the board (a Wardley area lands under the
components it covers, above the map). The two shipped maps (Tea Shop, Kodak
inertia) are rebuilt on the same presets, with every node grouped with its
label. A parity test guards both directions: every artefact command has its
template, every template matches its command.

Inserting a template (or pasting) that holds a group inside a group could
shuffle the paint order: the z-order sort looked one level of grouping up only,
which made its comparison cyclic. It now orders by the whole group chain, the
same order the canvas paints in.
