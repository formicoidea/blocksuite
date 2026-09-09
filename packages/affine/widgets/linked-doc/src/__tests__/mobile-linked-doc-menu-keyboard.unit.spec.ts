/**
 * The mobile `@` menu sits above the on-screen keyboard, so it reads the
 * keyboard height to place itself. That reading used to be a hard
 * `std.get(VirtualKeyboardProvider)`, and the provider is host-supplied: a
 * native mobile shell registers it, labre ships none. On a plain web host the
 * lookup threw `Service [VirtualKeyboardProvider] not found in container` —
 * issue #247.
 *
 * What is pinned here is the getter's contract: no provider means `null`, not
 * an exception, and the caller then falls back to a zero offset.
 */
import { VirtualKeyboardProvider } from '@labre/affine-shared/services';
import { Container } from '@labre/global/di';
import { signal } from '@preact/signals-core';
import { describe, expect, it } from 'vitest';

import { AffineMobileLinkedDocMenu } from '../mobile-linked-doc-menu.js';

/** The getter alone, over a container we control. */
function menuWithContainer(container: Container) {
  const menu = Object.create(
    AffineMobileLinkedDocMenu.prototype
  ) as AffineMobileLinkedDocMenu;
  Object.defineProperty(menu, 'context', {
    value: { std: container.provider() },
  });
  return menu;
}

describe('mobile linked doc menu keyboard lookup', () => {
  it('returns null when the host registers no provider', () => {
    const menu = menuWithContainer(new Container());

    expect(() => menu.keyboard).not.toThrow();
    expect(menu.keyboard).toBeNull();
  });

  it('returns the provider when the host registers one', () => {
    const provider = { visible$: signal(true), height$: signal(280) };
    const container = new Container();
    container.addImpl(VirtualKeyboardProvider, provider);

    const menu = menuWithContainer(container);

    expect(menu.keyboard).toBe(provider);
    expect(menu.keyboard?.height$.value).toBe(280);
  });
});
