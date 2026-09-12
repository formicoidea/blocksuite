/**
 * The editor's own chrome wordings, as `[key, fallback]` pairs.
 *
 * ## Why they are a table and not forty literals
 *
 * "Copy", "Delete", "Card view" are the SAME word on a dozen toolbars — the
 * bookmark's, the image's, the embed's, the linked doc's — and a literal per
 * call site is a wording a host has to translate a dozen times and can get
 * twelve different answers for. One pair per word, imported where it is
 * rendered, is what makes the manifest's promise ("every key the library can
 * ask for") describe a list a human can actually word.
 *
 * ## The tuple shape is load-bearing
 *
 * `translateKey(std, ...COPY)` spreads into `(std, key, fallback)`, so a call
 * site names the wording once and cannot pair the wrong fallback with the right
 * key. It is also what
 * `packages/affine/all/src/__tests__/translations/manifest.unit.spec.ts` reads:
 * the two adjacent literals below are the pair its drift check confirms the
 * manifest against, which is why the wordings live in literals here rather than
 * being derived from anything.
 *
 * Chrome, so every one of them ships an English default: a standalone
 * playground with no `TranslationProvider` registered must read exactly as it
 * did before these keys existed.
 */

/** A wording the library can ask the host for: its key, and its English default. */
export type ChromeWording = readonly [key: string, fallback: string];

/* ── Toasts ───────────────────────────────────────────────────────────── */

/**
 * The transient messages the editor puts on screen after a gesture.
 *
 * They were the last English strings left in a fully translated host (#182):
 * silent while nobody injected a `NotificationProvider`, and English in the
 * middle of a French UI the moment somebody did.
 */
export const TOAST_COPIED_TO_CLIPBOARD: ChromeWording = [
  'com.labre.toast.copied-to-clipboard',
  'Copied to clipboard',
];

export const TOAST_LINKED_DOC_CREATED: ChromeWording = [
  'com.labre.toast.linked-doc-created',
  'Linked doc created',
];

export const TOAST_NOTE_REMOVED_FROM_PAGE: ChromeWording = [
  'com.labre.toast.note-removed-from-page-mode',
  'Note removed from Page Mode',
];

export const TOAST_FRAME_INSERTED_INTO_PAGE: ChromeWording = [
  'com.labre.toast.frame-inserted-into-page',
  'Frame inserted into Page.',
];

export const TOAST_NO_LINK_FOUND: ChromeWording = [
  'com.labre.toast.no-link-found',
  'No link found',
];

/* ── Toolbars and menus ───────────────────────────────────────────────── */

export const TOOLBAR_BRING_TO_FRONT: ChromeWording = [
  'com.labre.toolbar.bring-to-front',
  'Bring to Front',
];

export const TOOLBAR_SEND_TO_BACK: ChromeWording = [
  'com.labre.toolbar.send-to-back',
  'Send to Back',
];

export const TOOLBAR_COPY: ChromeWording = ['com.labre.toolbar.copy', 'Copy'];

export const TOOLBAR_DUPLICATE: ChromeWording = [
  'com.labre.toolbar.duplicate',
  'Duplicate',
];

export const TOOLBAR_DELETE: ChromeWording = [
  'com.labre.toolbar.delete',
  'Delete',
];

export const TOOLBAR_LOCK: ChromeWording = ['com.labre.toolbar.lock', 'Lock'];

export const TOOLBAR_MORE: ChromeWording = ['com.labre.toolbar.more', 'More'];

export const TOOLBAR_LINK: ChromeWording = ['com.labre.toolbar.link', 'Link'];

export const TOOLBAR_CREATE_LINKED_DOC: ChromeWording = [
  'com.labre.toolbar.create-linked-doc',
  'Create linked doc',
];

export const TOOLBAR_DRAW_CONNECTOR: ChromeWording = [
  'com.labre.toolbar.draw-connector',
  'Draw connector',
];

/**
 * The four wordings of the view switcher — the control that decides whether a
 * link is drawn as words, as a card or as the document itself.
 *
 * One set for every block that offers it (bookmark, attachment, embed, linked
 * doc, synced doc, iframe, the inline link and the inline reference): they are
 * one control with one vocabulary, and a host that had to word "Card view"
 * eight times would end up with eight wordings of it.
 */
export const TOOLBAR_SWITCH_VIEW: ChromeWording = [
  'com.labre.toolbar.switch-view',
  'Switch view',
];

export const TOOLBAR_INLINE_VIEW: ChromeWording = [
  'com.labre.toolbar.inline-view',
  'Inline view',
];

export const TOOLBAR_CARD_VIEW: ChromeWording = [
  'com.labre.toolbar.card-view',
  'Card view',
];

export const TOOLBAR_EMBED_VIEW: ChromeWording = [
  'com.labre.toolbar.embed-view',
  'Embed view',
];

/* ── What a linked-doc card says instead of a preview ─────────────────── */

/**
 * The four states a linked-doc card can be in with nothing to show: deleted,
 * unreadable, empty, and — for the SYNCED card, which frames a page rather
 * than a doc — empty in its own words.
 *
 * All four and not only the two the recette caught (#183): they are one
 * sentence rendered by one ternary, and translating half of it would leave a
 * card that changes language when the document it points at goes missing.
 */
export const LINKED_DOC_DELETED: ChromeWording = [
  'com.labre.embed.linked-doc.deleted',
  'This linked doc is deleted.',
];

export const LINKED_DOC_FAILED: ChromeWording = [
  'com.labre.embed.linked-doc.failed',
  'This linked doc failed to load.',
];

export const LINKED_DOC_EMPTY_PREVIEW: ChromeWording = [
  'com.labre.embed.linked-doc.empty-preview',
  'Preview of the doc will be displayed here.',
];

export const SYNCED_DOC_EMPTY_PREVIEW: ChromeWording = [
  'com.labre.embed.synced-doc.empty-preview',
  'Preview of the page will be displayed here.',
];

/* ── The board toolbars every framework shares ────────────────────────── */

/**
 * The resize toggle, which is the one entry EVERY framework board carries —
 * Wardley, BPMN, C4, EDGY, Cynefin, Estuarine and the two DDD boards all
 * register the same always-on button (`docs/adr/0009`: a stored board must stay
 * usable with its framework switched off).
 *
 * Declared here rather than once per framework because it is not a framework's
 * own word: it names a behaviour of the generic frame primitive, and eight
 * copies of it in eight manifests would be eight keys for one tooltip.
 */
export const BOARD_RESIZE_TOGGLE: ChromeWording = [
  'com.labre.board.toolbar.resize-toggle',
  'Enable / lock resizing',
];

/**
 * The legend button, in the two wordings the boards actually use: the notation
 * boards say "notation", Wardley says "components".
 *
 * Two keys and not one interpolated sentence, for the reason the interchange
 * counts already ran on — the seam has no interpolation, so the smallest honest
 * unit is the whole sentence.
 */
export const BOARD_LEGEND_NOTATION: ChromeWording = [
  'com.labre.board.toolbar.legend',
  'Generate the legend (notation present)',
];

export const BOARD_LEGEND_COMPONENTS: ChromeWording = [
  'com.labre.board.toolbar.legend.components',
  'Generate the legend (components present)',
];

/**
 * The border-style dropdown's own trigger label — rendered identically by
 * `edgeless-shape-color-picker` (`@labre/affine-components`, this lot) and by
 * `edgeless-note-border-dropdown-menu` (`blocks/note`, a different lot): the
 * exact same button on a shape and on a note. Declared here so either can
 * import it rather than one minting a second key for the same word.
 */
export const BOARD_BORDER_STYLE_LABEL: ChromeWording = [
  'com.labre.board.toolbar.border-style',
  'Border style',
];

/**
 * The LaTeX empty-state and KaTeX-error placeholders — rendered identically
 * by the inline equation (`inlines/latex`, this lot) and the LaTeX BLOCK
 * (`blocks/latex`, a different lot): the same two words either way an
 * equation fails to show.
 */
export const EQUATION_EMPTY_LABEL: ChromeWording = [
  'com.labre.latex.equation-empty',
  'Equation',
];
export const EQUATION_ERROR_LABEL: ChromeWording = [
  'com.labre.latex.equation-error',
  'Error equation',
];

/**
 * The untitled-document fallback — `'Untitled'` is scattered across roughly
 * two dozen files repo-wide (adapters, embeds, the outline panel, data-view…),
 * most of them behind `DEFAULT_DOC_NAME` (`shared/src/consts/text.ts`) or
 * `DocDisplayMetaProvider`'s own internal substitution, neither of which this
 * lot owns. Declared here so the ONE call site this lot touches
 * (`inlines/reference/src/reference-node/configs/toolbar.ts`, a defensive
 * fallback for a title `DocDisplayMetaProvider` already never returns empty)
 * has a key, and so a later lot revisiting the others finds one key already
 * waiting rather than a second one to invent.
 */
export const UNTITLED_DOC_LABEL: ChromeWording = [
  'com.labre.doc.untitled',
  'Untitled',
];

/* ── Block types ──────────────────────────────────────────────────────── */

/**
 * The text-block primitive names and descriptions — `rich-text/src/conversion.ts`'s
 * `textConversionConfigs`, the ONE list that names "Heading 1", "Bulleted
 * List", "Quote"... for both the slash menu and the format bar's "Turn into"
 * conversion menu.
 *
 * Declared here rather than in `rich-text`'s own `translations.ts` because
 * both `@labre/affine-rich-text` (L6c, this lot) and the text-block packages
 * `blocks/note` / `blocks/paragraph` / `blocks/list` / `widgets/slash-menu`
 * (L6a, a different lot) read the very same words: `conversion.ts` names them
 * once, the slash menu's own config repeats the same name/description for the
 * items it derives from `textConversionConfigs`. One key per word here is what
 * lets both lots point at the SAME constant instead of minting two keys for
 * "Heading 1".
 */
export const BLOCK_TYPE_TEXT: ChromeWording = [
  'com.labre.block-type.text',
  'Text',
];
export const BLOCK_TYPE_TEXT_DESCRIPTION: ChromeWording = [
  'com.labre.block-type.text.description',
  'Start typing with plain text.',
];

export const BLOCK_TYPE_HEADING_1: ChromeWording = [
  'com.labre.block-type.heading-1',
  'Heading 1',
];
export const BLOCK_TYPE_HEADING_1_DESCRIPTION: ChromeWording = [
  'com.labre.block-type.heading-1.description',
  'Headings in the largest font.',
];

export const BLOCK_TYPE_HEADING_2: ChromeWording = [
  'com.labre.block-type.heading-2',
  'Heading 2',
];
export const BLOCK_TYPE_HEADING_2_DESCRIPTION: ChromeWording = [
  'com.labre.block-type.heading-2.description',
  'Headings in the 2nd font size.',
];

export const BLOCK_TYPE_HEADING_3: ChromeWording = [
  'com.labre.block-type.heading-3',
  'Heading 3',
];
export const BLOCK_TYPE_HEADING_3_DESCRIPTION: ChromeWording = [
  'com.labre.block-type.heading-3.description',
  'Headings in the 3rd font size.',
];

export const BLOCK_TYPE_HEADING_4: ChromeWording = [
  'com.labre.block-type.heading-4',
  'Heading 4',
];
export const BLOCK_TYPE_HEADING_4_DESCRIPTION: ChromeWording = [
  'com.labre.block-type.heading-4.description',
  'Headings in the 4th font size.',
];

export const BLOCK_TYPE_HEADING_5: ChromeWording = [
  'com.labre.block-type.heading-5',
  'Heading 5',
];
export const BLOCK_TYPE_HEADING_5_DESCRIPTION: ChromeWording = [
  'com.labre.block-type.heading-5.description',
  'Headings in the 5th font size.',
];

export const BLOCK_TYPE_HEADING_6: ChromeWording = [
  'com.labre.block-type.heading-6',
  'Heading 6',
];
export const BLOCK_TYPE_HEADING_6_DESCRIPTION: ChromeWording = [
  'com.labre.block-type.heading-6.description',
  'Headings in the 6th font size.',
];

export const BLOCK_TYPE_BULLETED_LIST: ChromeWording = [
  'com.labre.block-type.bulleted-list',
  'Bulleted List',
];
export const BLOCK_TYPE_BULLETED_LIST_DESCRIPTION: ChromeWording = [
  'com.labre.block-type.bulleted-list.description',
  'Create a bulleted list.',
];

export const BLOCK_TYPE_NUMBERED_LIST: ChromeWording = [
  'com.labre.block-type.numbered-list',
  'Numbered List',
];
export const BLOCK_TYPE_NUMBERED_LIST_DESCRIPTION: ChromeWording = [
  'com.labre.block-type.numbered-list.description',
  'Create a numbered list.',
];

export const BLOCK_TYPE_TODO_LIST: ChromeWording = [
  'com.labre.block-type.todo-list',
  'To-do List',
];
export const BLOCK_TYPE_TODO_LIST_DESCRIPTION: ChromeWording = [
  'com.labre.block-type.todo-list.description',
  'Add tasks to a to-do list.',
];

export const BLOCK_TYPE_CODE_BLOCK: ChromeWording = [
  'com.labre.block-type.code-block',
  'Code Block',
];
export const BLOCK_TYPE_CODE_BLOCK_DESCRIPTION: ChromeWording = [
  'com.labre.block-type.code-block.description',
  'Code snippet with formatting.',
];

export const BLOCK_TYPE_QUOTE: ChromeWording = [
  'com.labre.block-type.quote',
  'Quote',
];
export const BLOCK_TYPE_QUOTE_DESCRIPTION: ChromeWording = [
  'com.labre.block-type.quote.description',
  'Add a blockquote for emphasis.',
];

export const BLOCK_TYPE_DIVIDER: ChromeWording = [
  'com.labre.block-type.divider',
  'Divider',
];
export const BLOCK_TYPE_DIVIDER_DESCRIPTION: ChromeWording = [
  'com.labre.block-type.divider.description',
  'Visually separate content.',
];

/**
 * Every wording declared above, in declaration order.
 *
 * The manifest (`@labre/affine/translations`) walks this instead of restating
 * the pairs, so a wording added here reaches a host's catalogue with no second
 * edit — the same "declared data, not restated data" rule the roles, the rules
 * and the commands already follow.
 */
export const CHROME_WORDINGS: readonly ChromeWording[] = [
  TOAST_COPIED_TO_CLIPBOARD,
  TOAST_LINKED_DOC_CREATED,
  TOAST_NOTE_REMOVED_FROM_PAGE,
  TOAST_FRAME_INSERTED_INTO_PAGE,
  TOAST_NO_LINK_FOUND,
  TOOLBAR_BRING_TO_FRONT,
  TOOLBAR_SEND_TO_BACK,
  TOOLBAR_COPY,
  TOOLBAR_DUPLICATE,
  TOOLBAR_DELETE,
  TOOLBAR_LOCK,
  TOOLBAR_MORE,
  TOOLBAR_LINK,
  TOOLBAR_CREATE_LINKED_DOC,
  TOOLBAR_DRAW_CONNECTOR,
  TOOLBAR_SWITCH_VIEW,
  TOOLBAR_INLINE_VIEW,
  TOOLBAR_CARD_VIEW,
  TOOLBAR_EMBED_VIEW,
  LINKED_DOC_DELETED,
  LINKED_DOC_FAILED,
  LINKED_DOC_EMPTY_PREVIEW,
  SYNCED_DOC_EMPTY_PREVIEW,
  BOARD_RESIZE_TOGGLE,
  BOARD_LEGEND_NOTATION,
  BOARD_LEGEND_COMPONENTS,
  BOARD_BORDER_STYLE_LABEL,
  EQUATION_EMPTY_LABEL,
  EQUATION_ERROR_LABEL,
  UNTITLED_DOC_LABEL,
  BLOCK_TYPE_TEXT,
  BLOCK_TYPE_TEXT_DESCRIPTION,
  BLOCK_TYPE_HEADING_1,
  BLOCK_TYPE_HEADING_1_DESCRIPTION,
  BLOCK_TYPE_HEADING_2,
  BLOCK_TYPE_HEADING_2_DESCRIPTION,
  BLOCK_TYPE_HEADING_3,
  BLOCK_TYPE_HEADING_3_DESCRIPTION,
  BLOCK_TYPE_HEADING_4,
  BLOCK_TYPE_HEADING_4_DESCRIPTION,
  BLOCK_TYPE_HEADING_5,
  BLOCK_TYPE_HEADING_5_DESCRIPTION,
  BLOCK_TYPE_HEADING_6,
  BLOCK_TYPE_HEADING_6_DESCRIPTION,
  BLOCK_TYPE_BULLETED_LIST,
  BLOCK_TYPE_BULLETED_LIST_DESCRIPTION,
  BLOCK_TYPE_NUMBERED_LIST,
  BLOCK_TYPE_NUMBERED_LIST_DESCRIPTION,
  BLOCK_TYPE_TODO_LIST,
  BLOCK_TYPE_TODO_LIST_DESCRIPTION,
  BLOCK_TYPE_CODE_BLOCK,
  BLOCK_TYPE_CODE_BLOCK_DESCRIPTION,
  BLOCK_TYPE_QUOTE,
  BLOCK_TYPE_QUOTE_DESCRIPTION,
  BLOCK_TYPE_DIVIDER,
  BLOCK_TYPE_DIVIDER_DESCRIPTION,
];
