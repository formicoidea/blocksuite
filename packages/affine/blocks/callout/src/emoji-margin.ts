import {
  ParagraphBlockModel,
  type CalloutBlockModel,
} from '@labre/affine-model';
import {
  HEADING_LEVELS,
  HEADING_SCALE,
  headingLineBox,
} from '@labre/affine-shared/consts';
import { matchModels } from '@labre/affine-shared/utils';

/** The emoji's box, px (`.affine-callout-emoji-container` in callout-block.ts). */
const EMOJI_BOX_PX = 24;

/**
 * H1's bold caps read as sitting low when the emoji is centred on the line
 * box mathematically; lifting the emoji by 1px levels it optically.
 */
const H1_OPTICAL_LIFT_PX = 1;

/**
 * How far the emoji has to drop to sit level with the first line.
 *
 * The emoji is a fixed 24px box next to a column whose first line can be
 * anything from an H1 to an ordinary paragraph. A single margin therefore
 * cannot be right twice: level with a paragraph it floats above an H1, level
 * with an H1 it sinks below a paragraph. Per heading level, the drop centres
 * the emoji on the heading's first line box, below its margin-top:
 * `marginTop + lineBox / 2 - emojiBox / 2`.
 */
const EMOJI_MARGIN_TOP_BY_TYPE: Record<string, string> = Object.fromEntries(
  HEADING_LEVELS.map(level => {
    const centred =
      HEADING_SCALE[level].marginTop +
      headingLineBox(level) / 2 -
      EMOJI_BOX_PX / 2;
    const drop = level === 'h1' ? centred - H1_OPTICAL_LIFT_PX : centred;
    return [level, `${drop}px`];
  })
);

/** What a paragraph, a list, or an empty callout gets. */
const DEFAULT_EMOJI_MARGIN_TOP = '10px';

/**
 * The emoji's `margin-top` for a callout, read from its FIRST child — the only
 * line the emoji is ever level with.
 *
 * Reading `type$` rather than `type` keeps the caller reactive: turning the
 * first line into a heading re-renders the callout and moves the emoji with it.
 */
export function getCalloutEmojiMarginTop(model: CalloutBlockModel): string {
  const first = model.children[0];
  if (!first || !matchModels(first, [ParagraphBlockModel])) {
    return DEFAULT_EMOJI_MARGIN_TOP;
  }
  return (
    EMOJI_MARGIN_TOP_BY_TYPE[first.props.type$.value] ??
    DEFAULT_EMOJI_MARGIN_TOP
  );
}
