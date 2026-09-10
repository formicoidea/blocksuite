import { beforeAll, describe, expect, test } from 'vitest';

import { effects } from '../toggle-button/index.js';
import type { ToggleButton } from '../toggle-button/toggle-button.js';

beforeAll(() => {
  effects();
});

const mount = async (
  props: Partial<Pick<ToggleButton, 'collapsed' | 'controls'>> & {
    updateCollapsed?: (collapsed: boolean) => void;
  } = {}
): Promise<ToggleButton> => {
  const element = Object.assign(
    document.createElement('blocksuite-toggle-button'),
    {
      collapsed: false,
      controls: 'heading-children-block-1',
      updateCollapsed: () => {},
      ...props,
    }
  );
  document.body.append(element);
  await element.updateComplete;
  return element;
};

// `ToggleButton` is a `ShadowlessElement`: it renders into the light DOM.
const toggle = (element: ToggleButton) =>
  element.querySelector<HTMLButtonElement>('button.toggle-icon');

describe('blocksuite-toggle-button', () => {
  test('renders a native button rather than a div', async () => {
    const element = await mount();
    const button = toggle(element);

    expect(button).not.toBeNull();
    expect(button?.type).toBe('button');
    expect(button?.getAttribute('contenteditable')).toBe('false');
  });

  test('aria-expanded and aria-label follow the collapsed state', async () => {
    const element = await mount({ collapsed: true });
    expect(toggle(element)?.getAttribute('aria-expanded')).toBe('false');
    expect(toggle(element)?.getAttribute('aria-label')).toBe('Expand content');
    expect(toggle(element)?.dataset.collapsed).toBe('true');

    element.collapsed = false;
    await element.updateComplete;

    expect(toggle(element)?.getAttribute('aria-expanded')).toBe('true');
    expect(toggle(element)?.getAttribute('aria-label')).toBe(
      'Collapse content'
    );
    expect(toggle(element)?.dataset.collapsed).toBe('false');
  });

  test('aria-controls points at the id it is given', async () => {
    const element = await mount({ controls: 'list-children-block-42' });

    expect(toggle(element)?.getAttribute('aria-controls')).toBe(
      'list-children-block-42'
    );
  });

  test('a click asks for the opposite state', async () => {
    const calls: boolean[] = [];
    const element = await mount({
      collapsed: false,
      updateCollapsed: value => calls.push(value),
    });

    toggle(element)?.click();
    expect(calls).toEqual([true]);

    element.collapsed = true;
    await element.updateComplete;
    toggle(element)?.click();
    expect(calls).toEqual([true, false]);
  });
});
