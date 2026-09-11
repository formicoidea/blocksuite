import {
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  Heading5Icon,
  Heading6Icon,
} from '@labre/affine-components/icons';
import type { ParagraphBlockModel } from '@labre/affine-model';
import { HEADING_LEVELS, headingLineBox } from '@labre/affine-shared/consts';
import { SignalWatcher, WithDisposable } from '@labre/global/lit';
import { ShadowlessElement } from '@labre/std';
import { cssVarV2 } from '@toeverything/theme/v2';
import { css, html, nothing, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';

function HeadingIcon(i: number) {
  switch (i) {
    case 1:
      return Heading1Icon;
    case 2:
      return Heading2Icon;
    case 3:
      return Heading3Icon;
    case 4:
      return Heading4Icon;
    case 5:
      return Heading5Icon;
    case 6:
      return Heading6Icon;
    default:
      return Heading1Icon;
  }
}

/** The icon button's box: a 20px glyph inside 2px of padding. */
const ICON_SIZE = 20;
const ICON_PADDING = 2;
const ICON_BOX = ICON_SIZE + 2 * ICON_PADDING;

/**
 * Centres the icon on the heading's FIRST line, at every level.
 *
 * The icon is absolutely positioned at the top of the heading's wrapper
 * (`.h1`…`.h6`, where the first line box starts), so its top offset is half the
 * line box (`HEADING_SCALE`: size + line-height extra) minus half its own box.
 * One `em` offset cannot do that — the line box is not proportional to the font
 * size — and the `0.3em` it replaces set the icon 1.6px (H1) to 5px (H6) low.
 */
const headingIconOffsets = unsafeCSS(
  HEADING_LEVELS.map(
    level => `
  .${level} affine-paragraph-heading-icon .heading-icon {
    margin-top: ${headingLineBox(level) / 2 - ICON_BOX / 2}px;
  }
`
  ).join('')
);

export class ParagraphHeadingIcon extends SignalWatcher(
  WithDisposable(ShadowlessElement)
) {
  static override styles = css`
    affine-paragraph-heading-icon .heading-icon {
      display: flex;
      align-items: start;
      margin-top: 0;
      position: absolute;
      left: 0;
      transform: translateX(-64px);
      border-radius: 4px;
      padding: ${ICON_PADDING}px;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
      pointer-events: none;

      background: ${unsafeCSS(cssVarV2('button/iconButtonSolid', '#FFF'))};
      color: ${unsafeCSS(cssVarV2('icon/primary', '#7A7A7A'))};
      box-shadow:
        var(--Shadow-buttonShadow-1-x, 0px) var(--Shadow-buttonShadow-1-y, 0px)
          var(--Shadow-buttonShadow-1-blur, 1px) 0px
          var(--Shadow-buttonShadow-1-color, rgba(0, 0, 0, 0.12)),
        var(--Shadow-buttonShadow-2-x, 0px) var(--Shadow-buttonShadow-2-y, 1px)
          var(--Shadow-buttonShadow-2-blur, 5px) 0px
          var(--Shadow-buttonShadow-2-color, rgba(0, 0, 0, 0.12));
    }

    ${headingIconOffsets}

    .with-drag-handle .heading-icon {
      opacity: 1;
    }
  `;

  override render() {
    const type = this.model.props.type$.value;
    if (!type.startsWith('h')) return nothing;

    const i = parseInt(type.slice(1));

    return html`<div class="heading-icon" data-testid="heading-icon-${i}">
      ${HeadingIcon(i)}
    </div>`;
  }

  @property({ attribute: false })
  accessor model!: ParagraphBlockModel;
}

export function effects() {
  customElements.define('affine-paragraph-heading-icon', ParagraphHeadingIcon);
}

declare global {
  interface HTMLElementTagNameMap {
    'affine-paragraph-heading-icon': ParagraphHeadingIcon;
  }
}
