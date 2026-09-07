import { Bound } from '@labre/global/gfx';
import { generateKeyBetween } from '@labre/std/gfx';

/**
 * One already-placed element, as {@link indexOverBackgrounds} needs to read it.
 *
 * Three fields and no model, so the placement can be reasoned about — and
 * tested — without a document: what it is, where it is, and how deep. Blocks
 * and canvas elements both reduce to this, which is what lets a frame (a
 * block) and a Wardley zone (a canvas element) share one answer.
 */
export interface StackedElement {
  /** Fractional index. Sorts lexicographically, which IS the paint order. */
  index: string;
  /** Serialized box. */
  xywh: string;
  /** Whether this is a framework BACKGROUND — a map, a pool, a C4 board… */
  isBackground: boolean;
}

/**
 * How deep something drawn ON a framework board goes: just ABOVE the
 * backgrounds it covers, and below everything else. `null` means the back of
 * the surface.
 *
 * "The back" alone was the first answer and it was wrong, as the recette of
 * #213 found: a Wardley map is a framework BACKGROUND — an opaque one — so an
 * element sent behind the whole surface went behind the map and vanished. What
 * it must be under is the artefacts it groups; what it must be over is the
 * canvas they are drawn on. Those are two different depths, and only the first
 * one is "the back".
 *
 * So: find the topmost background the box actually OVERLAPS — the map it was
 * drawn on, and not some other framework's board parked elsewhere on the same
 * canvas — and mint a key between it and whatever sits directly above it. With
 * no background under it at all there is nothing to clear, and the back of the
 * surface is right again.
 *
 * Two callers want exactly this depth, for the same reason. A Wardley zone is
 * a wash over the components it names, so it is lowered — but not past the map
 * (#213). A frame is a container that renders behind everything it owns, so it
 * too is lowered — and it too vanished under the map. Same problem, same
 * answer, one function.
 *
 * `siblings` need not be sorted: fractional indexes sort lexicographically, so
 * this sorts them itself and reads the paint order straight off the strings.
 */
export function indexOverBackgrounds(
  siblings: readonly StackedElement[],
  box: Bound
): string | null {
  const stack = [...siblings].sort((a, b) =>
    a.index < b.index ? -1 : a.index > b.index ? 1 : 0
  );
  // The LAST match, which is the topmost: a board with two maps on it gets the
  // element above the one it is actually drawn over, whichever was drawn first.
  const under = stack.reduce(
    (found, element, at) =>
      element.isBackground &&
      Bound.deserialize(element.xywh).isOverlapWithBound(box)
        ? at
        : found,
    -1
  );
  if (under < 0) return null;
  // `null` for the upper bound when the background is the topmost element
  // there is — `generateKeyBetween` reads that as "append after".
  return generateKeyBetween(
    stack[under].index,
    stack[under + 1]?.index ?? null
  );
}
