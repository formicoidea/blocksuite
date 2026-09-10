import { TextSelection } from '@labre/std';
import { Text } from '@labre/store';
import { beforeEach, describe, expect, test } from 'vitest';

import { wait } from '../utils/common.js';
import { addNote } from '../utils/edgeless.js';
import { setupEditor } from '../utils/setup.js';

/**
 * The collapse chevron of headings and lists is a real `<button>`: it carries
 * `aria-controls` pointing at the container it hides, and the editor lets Tab
 * through when the focus sits on it — otherwise the button, focusable on
 * paper, could never be reached nor left with the keyboard.
 */

const tabKeydown = (target: HTMLElement) => {
  const event = new KeyboardEvent('keydown', {
    key: 'Tab',
    code: 'Tab',
    bubbles: true,
    cancelable: true,
    composed: true,
  });
  target.dispatchEvent(event);
  return event;
};

/**
 * Every lookup is scoped to the host of the editor this spec mounted: the
 * suite shares one browser page (`isolate: false`) and block ids restart at 0
 * for each spec, so `document.querySelector` would happily answer with a stale
 * editor left behind by an earlier file.
 */
const host = () => {
  const element = window.editor.host;
  if (!element) throw new Error('the editor host is missing');
  return element;
};

const blockOf = (blockId: string) => {
  const block = host().querySelector(`[data-block-id="${blockId}"]`);
  if (!block) throw new Error(`no block rendered for ${blockId}`);
  return block;
};

const toggleOf = (blockId: string) => {
  const button = blockOf(blockId).querySelector<HTMLButtonElement>(
    'blocksuite-toggle-button button.toggle-icon'
  );
  if (!button) throw new Error(`no toggle button rendered for ${blockId}`);
  return button;
};

describe('the collapse toggle is an accessible button', () => {
  let headingId!: string;
  let headingChildId!: string;
  let listId!: string;
  let listChildId!: string;

  beforeEach(async () => {
    const cleanup = await setupEditor('page');
    const doc = window.doc;
    const note = addNote(doc);

    headingId = doc.addBlock(
      'affine:paragraph',
      { type: 'h1', text: new Text('A heading') },
      note
    );
    headingChildId = doc.addBlock(
      'affine:paragraph',
      { text: new Text('A child of the heading') },
      headingId
    );
    // The heading toggle only renders when it has collapsible siblings.
    doc.addBlock('affine:paragraph', { text: new Text('A sibling') }, note);

    listId = doc.addBlock(
      'affine:list',
      { type: 'bulleted', text: new Text('A list item') },
      note
    );
    listChildId = doc.addBlock(
      'affine:list',
      { type: 'bulleted', text: new Text('A nested list item') },
      listId
    );

    await wait(100);

    return cleanup;
  });

  test('aria-controls names the container that actually holds the children', () => {
    for (const [blockId, childId] of [
      [headingId, headingChildId],
      [listId, listChildId],
    ]) {
      const controls = toggleOf(blockId).getAttribute('aria-controls');
      expect(controls).toBeTruthy();

      const container = host().querySelector(`#${CSS.escape(controls!)}`);
      expect(container).not.toBeNull();
      expect(
        container?.querySelector(`[data-block-id="${childId}"]`)
      ).not.toBeNull();
    }
  });

  test('the toggle announces its state', () => {
    const button = toggleOf(headingId);

    expect(button.type).toBe('button');
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Collapse content');
  });

  test('Tab is left to the browser when the focus sits on the toggle', () => {
    for (const blockId of [headingId, listId]) {
      const button = toggleOf(blockId);
      button.focus();

      expect(tabKeydown(button).defaultPrevented).toBe(false);
    }
  });

  test('Tab is still handled by the editor inside the text', async () => {
    const std = window.editor.std;
    const richText = blockOf(headingId).querySelector<HTMLElement>(
      '[contenteditable="true"]'
    );
    if (!richText) throw new Error('the heading rich text is missing');

    // The dispatcher only runs while the editor host holds the focus, and the
    // inline editor does not take `focus()` in this harness. Focusing the
    // toggle activates it just the same: what the fallback keymap reads is the
    // TARGET of the keystroke, not whatever happens to be focused.
    toggleOf(headingId).focus();
    std.selection.setGroup('note', [
      std.selection.create(TextSelection, {
        from: { blockId: headingId, index: 0, length: 0 },
        to: null,
      }),
    ]);
    await wait();

    expect(std.event.active).toBe(true);
    expect(tabKeydown(richText).defaultPrevented).toBe(true);
  });
});
