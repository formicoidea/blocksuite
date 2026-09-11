export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export interface HeadingMetrics {
  /** Font size, px. */
  readonly fontSize: number;
  readonly fontWeight: number;
  /** Letter spacing, em. */
  readonly letterSpacing: number;
  /** What the line box adds to the font size, px: `line-height: calc(1em + Npx)`. */
  readonly lineHeightExtra: number;
  /** Space above the heading, px. */
  readonly marginTop: number;
}

export const HEADING_LEVELS: readonly HeadingLevel[] = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
];

/**
 * Labre's document heading scale — the single source of truth for H1…H6.
 *
 * The sizes step down by a ratio of about 1.25 from the doc title (40px/700)
 * to H3, so each level reads as clearly smaller than the one above and H1
 * never competes with the title. Below H3 the steps tighten: H4–H6 only need
 * to stay above body text. Everything positioned against a heading's first
 * line (the paragraph styles, the drag-handle grabber, the callout emoji, the
 * slash-menu previews) derives from this table rather than from the upstream
 * `--affine-font-h-N` theme variables, which no longer drive document headings.
 */
export const HEADING_SCALE: Readonly<Record<HeadingLevel, HeadingMetrics>> = {
  h1: {
    fontSize: 32,
    fontWeight: 700,
    letterSpacing: -0.02,
    lineHeightExtra: 8,
    marginTop: 18,
  },
  h2: {
    fontSize: 26,
    fontWeight: 600,
    letterSpacing: -0.02,
    lineHeightExtra: 10,
    marginTop: 14,
  },
  h3: {
    fontSize: 20,
    fontWeight: 600,
    letterSpacing: -0.02,
    lineHeightExtra: 8,
    marginTop: 12,
  },
  h4: {
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: -0.015,
    lineHeightExtra: 8,
    marginTop: 12,
  },
  h5: {
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: -0.015,
    lineHeightExtra: 8,
    marginTop: 12,
  },
  h6: {
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: -0.015,
    lineHeightExtra: 8,
    marginTop: 12,
  },
};

/** Height of a heading's (single) line box, px: font size + line-height extra. */
export function headingLineBox(level: HeadingLevel): number {
  const { fontSize, lineHeightExtra } = HEADING_SCALE[level];
  return fontSize + lineHeightExtra;
}
