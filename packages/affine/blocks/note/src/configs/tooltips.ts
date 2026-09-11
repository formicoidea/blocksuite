import {
  type HeadingLevel,
  HEADING_SCALE,
  headingLineBox,
} from '@labre/affine-shared/consts';
import type { SlashMenuTooltip } from '@labre/affine-widget-slash-menu';
import { html, svg } from 'lit';
// prettier-ignore
const TextTooltip = html`<svg width="170" height="68" viewBox="0 0 170 68" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="170" height="68" rx="2" fill="white"/>
<mask id="mask0_16460_868" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="170" height="68">
<rect width="170" height="68" rx="2" fill="white"/>
</mask>
<g mask="url(#mask0_16460_868)">
<text fill="#121212" xml:space="preserve" style="white-space: pre" font-family="Inter" font-size="10" letter-spacing="0px"><tspan x="8" y="15.6364">In a decentralized system, we can have a kaleidoscopic </tspan><tspan x="8" y="27.6364">complexity to our data.&#10;</tspan><tspan x="8" y="43.6364">Any user may have a different perspective on what data they </tspan><tspan x="8" y="55.6364">either have, choose to share, or accept.&#10;</tspan><tspan x="8" y="71.6364">For example, one user&#x2019;s edits to a document might be on </tspan><tspan x="8" y="83.6364">their laptop on an airplane; when the plane lands and the </tspan><tspan x="8" y="95.6364">computer reconnects, those changes are distributed to </tspan><tspan x="8" y="107.636">other users.&#10;</tspan><tspan x="8" y="123.636">Other users might choose to accept all, some, or none of </tspan><tspan x="8" y="135.636">those changes to their version of the document.</tspan></text>
</g>
</svg>
`;

/** The preview frame: every slash-menu figure is a 170×68 card. */
const PREVIEW_HEIGHT = 68;
/** Space above the first line of a preview, px. */
const PREVIEW_PADDING_TOP = 6;
/**
 * Space a preview keeps free under its last line, px. A body line is drawn only
 * if its whole line box ends above it, so no line is ever cut by the frame.
 */
const PREVIEW_PADDING_BOTTOM = 2;

/** The body text under a heading preview, shrunk to 10px on a 12px line. */
const BODY_FONT_SIZE = 10;
const BODY_LINE_HEIGHT = 12;
/** Extra space between two paragraphs of the body, px. */
const BODY_PARAGRAPH_GAP = 4;
/**
 * The body, as the lines it is set in (the `text` preview's own wording). A
 * paragraph ends with a newline, as the Figma export wrote it.
 */
const BODY_PARAGRAPHS: readonly (readonly string[])[] = [
  [
    'In a decentralized system, we can have a kaleidoscopic ',
    'complexity to our data.\n',
  ],
  [
    'Any user may have a different perspective on what data they ',
    'either have, choose to share, or accept.\n',
  ],
  [
    'For example, one user\u2019s edits to a document might be on ',
    'their laptop on an airplane; when the plane lands and the ',
    'computer reconnects, those changes are distributed to ',
    'other users.\n',
  ],
  [
    'Other users might choose to accept all, some, or none of ',
    'those changes to their version of the document.',
  ],
];

/**
 * Where Figma sets an Inter baseline in a line box: 4/11 em below the box's
 * centre (half of Inter's ascent minus descent).
 */
function interBaseline(top: number, lineHeight: number, fontSize: number) {
  return Number((top + lineHeight / 2 + (fontSize * 4) / 11).toFixed(4));
}

/**
 * The body lines of a heading preview that fit ENTIRELY in the frame, with the
 * baseline each is set on.
 *
 * The body starts right under the heading's line box, so how many of its lines
 * the card can show depends on the level: derived here from the geometry (line
 * boxes, frame height, bottom padding) rather than tuned per level. At 10px on
 * a 12px line, Inter's descenders end within a twentieth of a pixel of the line
 * box's bottom edge, which the bottom padding covers: a line whose box fits is
 * never clipped.
 */
export function headingPreviewBodyLines(
  level: HeadingLevel
): { y: number; text: string }[] {
  const limit = PREVIEW_HEIGHT - PREVIEW_PADDING_BOTTOM;
  const lines: { y: number; text: string }[] = [];
  let top = PREVIEW_PADDING_TOP + headingLineBox(level);
  for (const [index, paragraph] of BODY_PARAGRAPHS.entries()) {
    if (index > 0) top += BODY_PARAGRAPH_GAP;
    for (const text of paragraph) {
      if (top + BODY_LINE_HEIGHT > limit) return lines;
      lines.push({
        y: interBaseline(top, BODY_LINE_HEIGHT, BODY_FONT_SIZE),
        text,
      });
      top += BODY_LINE_HEIGHT;
    }
  }
  return lines;
}

/**
 * A heading preview drawn at the heading's real size, weight and line box
 * (from `HEADING_SCALE`), above as many lines of body text as the card shows
 * whole (`headingPreviewBodyLines`).
 */
// prettier-ignore
function headingTooltip(level: HeadingLevel) {
  const { fontSize, fontWeight, letterSpacing } = HEADING_SCALE[level];
  const lineBox = headingLineBox(level);
  const maskId = `mask_heading_tooltip_${level}`;
  const body = headingPreviewBodyLines(level).map(
    line => svg`<tspan x="8" y=${line.y}>${line.text}</tspan>`
  );
  return html`<svg width="170" height="68" viewBox="0 0 170 68" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="170" height="68" rx="2" fill="white"/>
<mask id=${maskId} style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="170" height="68">
<rect width="170" height="68" rx="2" fill="white"/>
</mask>
<g mask="url(#${maskId})">
<text fill="#121212" xml:space="preserve" style="white-space: pre" font-family="Inter" font-size=${fontSize} font-weight=${fontWeight} letter-spacing="${letterSpacing}em"><tspan x="8" y=${interBaseline(PREVIEW_PADDING_TOP, lineBox, fontSize)}>Heading ${level.slice(1)}</tspan></text>
<text fill="#121212" xml:space="preserve" style="white-space: pre" font-family="Inter" font-size=${BODY_FONT_SIZE} letter-spacing="0px">${body}</text>
</g>
</svg>
`;
}

const Heading1Tooltip = headingTooltip('h1');
const Heading2Tooltip = headingTooltip('h2');
const Heading3Tooltip = headingTooltip('h3');
const Heading4Tooltip = headingTooltip('h4');
const Heading5Tooltip = headingTooltip('h5');
const Heading6Tooltip = headingTooltip('h6');

// prettier-ignore
const CodeBlockTooltip = html`<svg width="170" height="68" viewBox="0 0 170 68" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="170" height="68" rx="2" fill="white"/>
<mask id="mask0_16460_915" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="170" height="68">
<rect width="170" height="68" rx="2" fill="white"/>
</mask>
<g mask="url(#mask0_16460_915)">
<text fill="#121212" xml:space="preserve" style="white-space: pre" font-family="var(--affine-font-code-family)" font-size="11" letter-spacing="0em"><tspan x="47.5742" y="17.46"> </tspan><tspan x="126.723" y="17.46">: </tspan><tspan x="166.297" y="17.46"> {&#10;</tspan><tspan x="8" y="32.46">    </tspan><tspan x="100.34" y="32.46"> helloTo </tspan><tspan x="166.297" y="32.46"> &#34;World&#34;&#10;</tspan><tspan x="8" y="47.46">    </tspan><tspan x="54.1699" y="47.46"> body: </tspan><tspan x="126.723" y="47.46"> </tspan><tspan x="159.701" y="47.46"> {&#10;</tspan><tspan x="8" y="62.46">        </tspan><tspan x="87.1484" y="62.46">(</tspan><tspan x="219.062" y="62.46">)&#10;</tspan><tspan x="8" y="77.46">}&#10;</tspan><tspan x="8" y="92.46">}</tspan></text>
<text fill="#0782A0" xml:space="preserve" style="white-space: pre" font-family="var(--affine-font-code-family)" font-size="11" letter-spacing="0em"><tspan x="8" y="17.46">struct</tspan><tspan x="73.957" y="32.46"> var</tspan><tspan x="159.701" y="32.46">=</tspan><tspan x="34.3828" y="47.46">var</tspan><tspan x="100.34" y="47.46">some</tspan><tspan x="139.914" y="62.46">\(</tspan></text>
<text fill="#842ED3" xml:space="preserve" style="white-space: pre" font-family="var(--affine-font-code-family)" font-size="11" letter-spacing="0em"><tspan x="54.1699" y="17.46">ContentView</tspan></text>
<text fill="#C62222" xml:space="preserve" style="white-space: pre" font-family="var(--affine-font-code-family)" font-size="11" letter-spacing="0em"><tspan x="139.914" y="17.46">View</tspan><tspan x="34.3828" y="32.46">@State</tspan><tspan x="133.318" y="47.46">View</tspan></text>
<text fill="#2159D3" xml:space="preserve" style="white-space: pre" font-family="var(--affine-font-code-family)" font-size="11" letter-spacing="0em"><tspan x="60.7656" y="62.46">Text</tspan></text>
<text fill="#D34F0B" xml:space="preserve" style="white-space: pre" font-family="var(--affine-font-code-family)" font-size="11" letter-spacing="0em"><tspan x="93.7441" y="62.46">&#34;Hello </tspan><tspan x="153.105" y="62.46">helloTo)!&#34;</tspan></text>
</g>
</svg>
`;

// prettier-ignore
const QuoteTooltip = html`<svg width="170" height="68" viewBox="0 0 170 68" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="170" height="68" rx="2" fill="white"/>
<mask id="mask0_16460_920" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="170" height="68">
<rect width="170" height="68" rx="2" fill="white"/>
</mask>
<g mask="url(#mask0_16460_920)">
<rect x="12" y="14" width="2" height="33" rx="1" fill="#C2C1C5"/>
<text fill="#121212" xml:space="preserve" style="white-space: pre" font-family="Inter" font-size="10" letter-spacing="0px"><tspan x="24" y="26.6364">In a decentralized system, we can have a </tspan><tspan x="24" y="40.6364">kaleidoscopic complexity to our data.&#10;…</tspan></text>
</g>
</svg>
`;

// prettier-ignore
const DividerTooltip = html`<svg width="170" height="68" viewBox="0 0 170 68" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="170" height="68" rx="2" fill="white"/>
<mask id="mask0_16460_928" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="170" height="68">
<rect width="170" height="68" rx="2" fill="white"/>
</mask>
<g mask="url(#mask0_16460_928)">
<text fill="black" xml:space="preserve" style="white-space: pre" font-family="Inter" font-size="10" letter-spacing="0px"><tspan x="8" y="16.6364">In a decentralized system, we can have a </tspan><tspan x="8" y="30.6364">kaleidoscopic complexity to our data.&#10;</tspan><tspan x="8" y="54.6364">Any user may have a different perspective </tspan><tspan x="8" y="68.6364">on what data they either have, choose to </tspan><tspan x="8" y="82.6364">share, or accept.&#10;</tspan><tspan x="8" y="106.636">For example, one user&#x2019;s edits to a </tspan><tspan x="8" y="120.636">document might be on their laptop on an </tspan><tspan x="8" y="134.636">airplane; when the plane lands and the </tspan><tspan x="8" y="148.636">computer reconnects, those changes are </tspan><tspan x="8" y="162.636">distributed to other users.&#10;</tspan><tspan x="8" y="186.636">Other users might choose to accept all, </tspan><tspan x="8" y="200.636">some, or none of those changes to their </tspan><tspan x="8" y="214.636">version of the document.</tspan></text>
<line x1="8.25" y1="40.75" x2="169.75" y2="40.75" stroke="#E3E2E4" stroke-width="0.5" stroke-linecap="round"/>
</g>
</svg>
`;

// prettier-ignore
const BulletedListTooltip = html`<svg width="170" height="68" viewBox="0 0 170 68" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="170" height="68" rx="2" fill="white"/>
<mask id="mask0_16460_934" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="170" height="68">
<rect width="170" height="68" rx="2" fill="white"/>
</mask>
<g mask="url(#mask0_16460_934)">
<circle cx="14" cy="26" r="1.5" fill="#1C81D9"/>
<text fill="#121212" xml:space="preserve" style="white-space: pre" font-family="Inter" font-size="10" letter-spacing="0px"><tspan x="22" y="29.6364">Here&#39;s an example of a bulleted list.</tspan></text>
<circle cx="14" cy="42" r="1.5" fill="#1C81D9"/>
<text fill="#121212" xml:space="preserve" style="white-space: pre" font-family="Inter" font-size="10" letter-spacing="0px"><tspan x="22" y="45.6364">You can list your plans such as this</tspan></text>
</g>
</svg>
`;

// prettier-ignore
const NumberedListTooltip = html`<svg width="170" height="68" viewBox="0 0 170 68" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="170" height="68" rx="2" fill="white"/>
<mask id="mask0_16460_947" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="170" height="68">
<rect width="170" height="68" rx="2" fill="white"/>
</mask>
<g mask="url(#mask0_16460_947)">
<g clip-path="url(#clip0_16460_947)">
<text fill="#1C81D9" xml:space="preserve" style="white-space: pre" font-family="Inter" font-size="10" letter-spacing="0px"><tspan x="10" y="29.6364">1.</tspan></text>
</g>
<text fill="#121212" xml:space="preserve" style="white-space: pre" font-family="Inter" font-size="10" letter-spacing="0px"><tspan x="24" y="29.6364">Here&#39;s an example of a numbered list.</tspan></text>
<g clip-path="url(#clip1_16460_947)">
<text fill="#1C81D9" xml:space="preserve" style="white-space: pre" font-family="Inter" font-size="10" letter-spacing="0px"><tspan x="10" y="45.6364">2.</tspan></text>
</g>
<text fill="#121212" xml:space="preserve" style="white-space: pre" font-family="Inter" font-size="10" letter-spacing="0px"><tspan x="24" y="45.6364">You can list your plans such as this</tspan></text>
</g>
<defs>
<clipPath id="clip0_16460_947">
<rect width="16" height="16" fill="white" transform="translate(10 18)"/>
</clipPath>
<clipPath id="clip1_16460_947">
<rect width="16" height="16" fill="white" transform="translate(10 34)"/>
</clipPath>
</defs>
</svg>
`;

// prettier-ignore
export const BoldTextTooltip = html`<svg width="170" height="68" viewBox="0 0 170 68" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="170" height="68" rx="2" fill="white"/>
<mask id="mask0_16460_971" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="170" height="68">
<rect width="170" height="68" rx="2" fill="white"/>
</mask>
<g mask="url(#mask0_16460_971)">
<text fill="#121212" xml:space="preserve" style="white-space: pre" font-family="Inter" font-size="10" letter-spacing="0px"><tspan x="8" y="43.6364">Any user may have a different perspective on what data they </tspan><tspan x="8" y="55.6364">either have, choose to share, or accept.&#10;</tspan><tspan x="8" y="71.6364">For example, one user&#x2019;s edits to a document might be on </tspan><tspan x="8" y="83.6364">their laptop on an airplane; when the plane lands and the </tspan><tspan x="8" y="95.6364">computer reconnects, those changes are distributed to </tspan><tspan x="8" y="107.636">other users.&#10;</tspan><tspan x="8" y="123.636">Other users might choose to accept all, some, or none of </tspan><tspan x="8" y="135.636">those changes to their version of the document.</tspan></text>
<text fill="#121212" xml:space="preserve" style="white-space: pre" font-family="Inter" font-size="10" font-weight="bold" letter-spacing="0px"><tspan x="8" y="15.6364">In a decentralized system, we can have a kaleidoscopic </tspan><tspan x="8" y="27.6364">complexity to our data.&#10;</tspan></text>
</g>
</svg>
`;

// prettier-ignore
export const ItalicTooltip = html`<svg width="170" height="68" viewBox="0 0 170 68" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="170" height="68" rx="2" fill="white"/>
<mask id="mask0_16460_976" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="170" height="68">
<rect width="170" height="68" rx="2" fill="white"/>
</mask>
<g mask="url(#mask0_16460_976)">
<text fill="#121212" xml:space="preserve" style="white-space: pre" font-family="Inter" font-size="10" letter-spacing="0px"><tspan x="8" y="43.6364">Any user may have a different perspective on what data they </tspan><tspan x="8" y="55.6364">either have, choose to share, or accept.&#10;</tspan><tspan x="8" y="71.6364">For example, one user&#x2019;s edits to a document might be on </tspan><tspan x="8" y="83.6364">their laptop on an airplane; when the plane lands and the </tspan><tspan x="8" y="95.6364">computer reconnects, those changes are distributed to </tspan><tspan x="8" y="107.636">other users.&#10;</tspan><tspan x="8" y="123.636">Other users might choose to accept all, some, or none of </tspan><tspan x="8" y="135.636">those changes to their version of the document.</tspan></text>
<text fill="#121212" xml:space="preserve" style="white-space: pre" font-family="Inter" font-size="10" font-style="italic" letter-spacing="0px"><tspan x="8" y="15.6364">In a decentralized system, we can have a kaleidoscopic </tspan><tspan x="8" y="27.6364">complexity to our data.&#10;</tspan></text>
</g>
</svg>
`;

// prettier-ignore
export const StrikethroughTooltip = html`<svg width="170" height="68" viewBox="0 0 170 68" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="170" height="68" rx="2" fill="white"/>
<mask id="mask0_16460_986" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="170" height="68">
<rect width="170" height="68" rx="2" fill="white"/>
</mask>
<g mask="url(#mask0_16460_986)">
<text fill="#121212" xml:space="preserve" style="white-space: pre" font-family="Inter" font-size="10" letter-spacing="0px"><tspan x="8" y="43.6364">Any user may have a different perspective on what data they </tspan><tspan x="8" y="55.6364">either have, choose to share, or accept.&#10;</tspan><tspan x="8" y="71.6364">For example, one user&#x2019;s edits to a document might be on </tspan><tspan x="8" y="83.6364">their laptop on an airplane; when the plane lands and the </tspan><tspan x="8" y="95.6364">computer reconnects, those changes are distributed to </tspan><tspan x="8" y="107.636">other users.&#10;</tspan><tspan x="8" y="123.636">Other users might choose to accept all, some, or none of </tspan><tspan x="8" y="135.636">those changes to their version of the document.</tspan></text>
<text fill="#121212" xml:space="preserve" style="white-space: pre" font-family="Inter" font-size="10" letter-spacing="0px" text-decoration="line-through"><tspan x="8" y="15.6364">In a decentralized system, we can have a kaleidoscopic </tspan><tspan x="8" y="27.6364">complexity to our data.&#10;</tspan></text>
</g>
</svg>
`;

// prettier-ignore
export const UnderlineTooltip = html`<svg width="170" height="68" viewBox="0 0 170 68" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="170" height="68" rx="2" fill="white"/>
<mask id="mask0_16460_981" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="170" height="68">
<rect width="170" height="68" rx="2" fill="white"/>
</mask>
<g mask="url(#mask0_16460_981)">
<text fill="#121212" xml:space="preserve" style="white-space: pre" font-family="Inter" font-size="10" letter-spacing="0px"><tspan x="8" y="43.6364">Any user may have a different perspective on what data they </tspan><tspan x="8" y="55.6364">either have, choose to share, or accept.&#10;</tspan><tspan x="8" y="71.6364">For example, one user&#x2019;s edits to a document might be on </tspan><tspan x="8" y="83.6364">their laptop on an airplane; when the plane lands and the </tspan><tspan x="8" y="95.6364">computer reconnects, those changes are distributed to </tspan><tspan x="8" y="107.636">other users.&#10;</tspan><tspan x="8" y="123.636">Other users might choose to accept all, some, or none of </tspan><tspan x="8" y="135.636">those changes to their version of the document.</tspan></text>
<text fill="#121212" xml:space="preserve" style="white-space: pre" font-family="Inter" font-size="10" letter-spacing="0px" text-decoration="underline"><tspan x="8" y="15.6364">In a decentralized system, we can have a kaleidoscopic </tspan><tspan x="8" y="27.6364">complexity to our data.&#10;</tspan></text>
</g>
</svg>
`;

// prettier-ignore
export const TodoTooltip = html`<svg width="170" height="68" viewBox="0 0 170 68" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="170" height="68" rx="2" fill="white"/>
<mask id="mask0_5604_203551" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="170" height="68">
<rect width="170" height="68" rx="2" fill="white"/>
</mask>
<g mask="url(#mask0_5604_203551)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.6667 19C12.7462 19 12 19.7462 12 20.6667V27.3333C12 28.2538 12.7462 29 13.6667 29H20.3333C21.2538 29 22 28.2538 22 27.3333V20.6667C22 19.7462 21.2538 19 20.3333 19H13.6667ZM12.9091 20.6667C12.9091 20.2483 13.2483 19.9091 13.6667 19.9091H20.3333C20.7517 19.9091 21.0909 20.2483 21.0909 20.6667V27.3333C21.0909 27.7517 20.7517 28.0909 20.3333 28.0909H13.6667C13.2483 28.0909 12.9091 27.7517 12.9091 27.3333V20.6667Z" fill="#77757D"/>
<text fill="#121212" xml:space="preserve" style="white-space: pre" font-family="Inter" font-size="10" letter-spacing="0px"><tspan x="28" y="27.6364">Here is an example of todo list.</tspan></text>
<path fill-rule="evenodd" clip-rule="evenodd" d="M12 40.6667C12 39.7462 12.7462 39 13.6667 39H20.3333C21.2538 39 22 39.7462 22 40.6667V47.3333C22 48.2538 21.2538 49 20.3333 49H13.6667C12.7462 49 12 48.2538 12 47.3333V40.6667ZM19.7457 42.5032C19.9232 42.3257 19.9232 42.0379 19.7457 41.8604C19.5681 41.6829 19.2803 41.6829 19.1028 41.8604L16.0909 44.8723L15.2002 43.9816C15.0227 43.8041 14.7349 43.8041 14.5574 43.9816C14.3799 44.1591 14.3799 44.4469 14.5574 44.6244L15.7695 45.8366C15.947 46.0141 16.2348 46.0141 16.4123 45.8366L19.7457 42.5032Z" fill="#1E96EB"/>
<text fill="#8E8D91" xml:space="preserve" style="white-space: pre" font-family="Inter" font-size="10" letter-spacing="0px"><tspan x="28" y="47.6364">Make a list for building preview.</tspan></text>
</g>
</svg>
`

export const tooltips: Record<string, SlashMenuTooltip> = {
  Text: {
    figure: TextTooltip,
    caption: 'Text',
  },

  'Heading 1': {
    figure: Heading1Tooltip,
    caption: 'Heading #1',
  },

  'Heading 2': {
    figure: Heading2Tooltip,
    caption: 'Heading #2',
  },

  'Heading 3': {
    figure: Heading3Tooltip,
    caption: 'Heading #3',
  },

  'Heading 4': {
    figure: Heading4Tooltip,
    caption: 'Heading #4',
  },

  'Heading 5': {
    figure: Heading5Tooltip,
    caption: 'Heading #5',
  },

  'Heading 6': {
    figure: Heading6Tooltip,
    caption: 'Heading #6',
  },

  'Code Block': {
    figure: CodeBlockTooltip,
    caption: 'Code Block',
  },

  Quote: {
    figure: QuoteTooltip,
    caption: 'Quote',
  },

  Divider: {
    figure: DividerTooltip,
    caption: 'Divider',
  },

  'Bulleted List': {
    figure: BulletedListTooltip,
    caption: 'Bulleted List',
  },

  'Numbered List': {
    figure: NumberedListTooltip,
    caption: 'Numbered List',
  },

  Bold: {
    figure: BoldTextTooltip,
    caption: 'Bold Text',
  },

  Italic: {
    figure: ItalicTooltip,
    caption: 'Italic',
  },

  Underline: {
    figure: UnderlineTooltip,
    caption: 'Underline',
  },

  Strikethrough: {
    figure: StrikethroughTooltip,
    caption: 'Strikethrough',
  },

  'To-do List': {
    figure: TodoTooltip,
    caption: 'To-do List',
  },
};
