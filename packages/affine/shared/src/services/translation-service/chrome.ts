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
 * The two block-reorder verbs of a line-oriented block: the slash menu's own
 * "Actions" group (`packages/affine/widgets/slash-menu`) and the note block's
 * move-up/down hotkey config (`packages/affine/blocks/note/src/move-block.ts`)
 * say the exact same word — one key, shared rather than declared twice.
 */
export const TOOLBAR_MOVE_UP: ChromeWording = [
  'com.labre.toolbar.move-up',
  'Move Up',
];

export const TOOLBAR_MOVE_DOWN: ChromeWording = [
  'com.labre.toolbar.move-down',
  'Move Down',
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

/* ── Note shadow styles ────────────────────────────────────────────────
 * The note block's own shadow options, shared verbatim between the surface
 * toolbar's style panel (blocks/note) and the edgeless senior menu's shadow
 * panel (gfx/note) — five of the six read identically in both; the sixth
 * ("Floating shadow" there, "Floation shadow" here, a pre-existing typo in
 * gfx/note) is kept apart precisely because the fallback must stay the
 * literal on screen, letter for letter.
 */
export const NOTE_SHADOW_NONE: ChromeWording = [
  'com.labre.note.shadow.none',
  'No shadow',
];

export const NOTE_SHADOW_BOX: ChromeWording = [
  'com.labre.note.shadow.box',
  'Box shadow',
];

export const NOTE_SHADOW_STICKER: ChromeWording = [
  'com.labre.note.shadow.sticker',
  'Sticker shadow',
];

export const NOTE_SHADOW_PAPER: ChromeWording = [
  'com.labre.note.shadow.paper',
  'Paper shadow',
];

export const NOTE_SHADOW_FILM: ChromeWording = [
  'com.labre.note.shadow.film',
  'Film shadow',
];

/* ── Block type names ──────────────────────────────────────────────────── */

/**
 * The name of a text primitive block, as it appears identically in more than
 * one of the prose-chrome surfaces: the paragraph's own empty-line
 * placeholder (`packages/affine/blocks/paragraph/src/view.ts`) and the
 * edgeless note's "add to note" menu
 * (`packages/affine/gfx/note/src/toolbar/note-menu-config.ts`). The note
 * block's own slash-menu tooltip captions say the SAME word too
 * (`packages/affine/blocks/note/src/configs/tooltips.ts`), reusing these
 * constants rather than declaring their own.
 *
 * `textConversionConfigs` (`packages/affine/rich-text`) is the canonical
 * source of the English literal itself — outside this lot's packages, so left
 * untouched — but every place THESE packages render the same word resolves it
 * through the seam via the constants below.
 */
export const BLOCK_NAME_TEXT: ChromeWording = [
  'com.labre.block-name.text',
  'Text',
];

export const BLOCK_NAME_HEADING_1: ChromeWording = [
  'com.labre.block-name.heading-1',
  'Heading 1',
];

export const BLOCK_NAME_HEADING_2: ChromeWording = [
  'com.labre.block-name.heading-2',
  'Heading 2',
];

export const BLOCK_NAME_HEADING_3: ChromeWording = [
  'com.labre.block-name.heading-3',
  'Heading 3',
];

export const BLOCK_NAME_HEADING_4: ChromeWording = [
  'com.labre.block-name.heading-4',
  'Heading 4',
];

export const BLOCK_NAME_HEADING_5: ChromeWording = [
  'com.labre.block-name.heading-5',
  'Heading 5',
];

export const BLOCK_NAME_HEADING_6: ChromeWording = [
  'com.labre.block-name.heading-6',
  'Heading 6',
];

export const BLOCK_NAME_CODE_BLOCK: ChromeWording = [
  'com.labre.block-name.code-block',
  'Code Block',
];

export const BLOCK_NAME_QUOTE: ChromeWording = [
  'com.labre.block-name.quote',
  'Quote',
];

export const BLOCK_NAME_DIVIDER: ChromeWording = [
  'com.labre.block-name.divider',
  'Divider',
];

export const BLOCK_NAME_BULLETED_LIST: ChromeWording = [
  'com.labre.block-name.bulleted-list',
  'Bulleted List',
];

export const BLOCK_NAME_NUMBERED_LIST: ChromeWording = [
  'com.labre.block-name.numbered-list',
  'Numbered List',
];

export const BLOCK_NAME_TODO_LIST: ChromeWording = [
  'com.labre.block-name.todo-list',
  'To-do List',
];

/* ── Documents ────────────────────────────────────────────────────────── */

/**
 * A document with no title, wherever its name is shown instead of one — the
 * "@" menu's linked-doc list AND the outline panel's own preview of a linked
 * doc both say it, hence a shared key rather than a package-local one.
 */
export const DOC_UNTITLED: ChromeWording = [
  'com.labre.doc.untitled',
  'Untitled',
];

/* ── Export / import formats ────────────────────────────────────────────── */

/**
 * File-format names shown by more than one picker (the adapter/debug panel's
 * format selector, the "@" menu's import dialog) — proper nouns the glossary
 * convention keeps in English even in the French proposal.
 */
export const FORMAT_MARKDOWN: ChromeWording = [
  'com.labre.format.markdown',
  'Markdown',
];

export const FORMAT_HTML: ChromeWording = ['com.labre.format.html', 'HTML'];

/* ── Canvas element style ──────────────────────────────────────────────── */

/**
 * The sketch/general toggle every canvas element's style panel offers
 * (shape's border, a framework board's own "trait esquissé" switch) — one
 * pair of words, shared by every drawer of that control rather than declared
 * once per element type.
 */
export const STYLE_GENERAL: ChromeWording = [
  'com.labre.style.general',
  'General',
];

export const STYLE_SCRIBBLED: ChromeWording = [
  'com.labre.style.scribbled',
  'Scribbled',
];

/** The menu label naming that same toggle (shape's, a mindmap's). */
export const STYLE_MENU_LABEL: ChromeWording = [
  'com.labre.style.menu-label',
  'Style',
];

/* ── Font weight / style ────────────────────────────────────────────────── */

/**
 * The three font weights and the one non-default font style a text toolbar
 * offers — said identically by the toolbar's own "current selection" label
 * (`gfx/text`) and by the popup menu that picks them
 * (`widgets/edgeless-toolbar`).
 */
export const FONT_WEIGHT_LIGHT: ChromeWording = [
  'com.labre.font.weight.light',
  'Light',
];

export const FONT_WEIGHT_REGULAR: ChromeWording = [
  'com.labre.font.weight.regular',
  'Regular',
];

export const FONT_WEIGHT_SEMIBOLD: ChromeWording = [
  'com.labre.font.weight.semibold',
  'Semibold',
];

export const FONT_STYLE_ITALIC: ChromeWording = [
  'com.labre.font.style.italic',
  'Italic',
];

/* ── Canvas tool names ──────────────────────────────────────────────────── */

/**
 * A canvas tool's own name, said identically by its senior button, its quick
 * button and the "+" auto-complete panel that offers it as a follow-up —
 * `mindmap`, `shape` and `edgeless-selected-rect` all draw at least one of
 * these from the same table rather than wording a tool's name once per
 * drawer.
 */
export const TOOL_NAME_TEXT: ChromeWording = ['com.labre.tool.text', 'Text'];

export const TOOL_NAME_NOTE: ChromeWording = ['com.labre.tool.note', 'Note'];

export const TOOL_NAME_FRAME: ChromeWording = ['com.labre.tool.frame', 'Frame'];

export const TOOL_NAME_SHAPE: ChromeWording = ['com.labre.tool.shape', 'Shape'];

/**
 * The font-size dropdown's own label — said identically by every text
 * toolbar that offers it (`gfx/text`'s shared `createTextActions`, and
 * `blocks/edgeless-text`'s own scale-driven variant of the same control).
 */
export const FONT_SIZE_LABEL: ChromeWording = [
  'com.labre.font.size-label',
  'Font size',
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
  TOOLBAR_MOVE_UP,
  TOOLBAR_MOVE_DOWN,
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
  NOTE_SHADOW_NONE,
  NOTE_SHADOW_BOX,
  NOTE_SHADOW_STICKER,
  NOTE_SHADOW_PAPER,
  NOTE_SHADOW_FILM,
  BLOCK_NAME_TEXT,
  BLOCK_NAME_HEADING_1,
  BLOCK_NAME_HEADING_2,
  BLOCK_NAME_HEADING_3,
  BLOCK_NAME_HEADING_4,
  BLOCK_NAME_HEADING_5,
  BLOCK_NAME_HEADING_6,
  BLOCK_NAME_CODE_BLOCK,
  BLOCK_NAME_QUOTE,
  BLOCK_NAME_DIVIDER,
  BLOCK_NAME_BULLETED_LIST,
  BLOCK_NAME_NUMBERED_LIST,
  BLOCK_NAME_TODO_LIST,
  DOC_UNTITLED,
  FORMAT_MARKDOWN,
  FORMAT_HTML,
  STYLE_GENERAL,
  STYLE_SCRIBBLED,
  STYLE_MENU_LABEL,
  FONT_WEIGHT_LIGHT,
  FONT_WEIGHT_REGULAR,
  FONT_WEIGHT_SEMIBOLD,
  FONT_STYLE_ITALIC,
  TOOL_NAME_TEXT,
  TOOL_NAME_NOTE,
  TOOL_NAME_FRAME,
  TOOL_NAME_SHAPE,
  FONT_SIZE_LABEL,
];
