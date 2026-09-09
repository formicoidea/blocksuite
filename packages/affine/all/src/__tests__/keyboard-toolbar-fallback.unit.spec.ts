/**
 * Opening a page-mode document on Android Chrome used to die with
 * `Service [VirtualKeyboardProvider] not found in container` — issue #247.
 *
 * The provider is host-supplied: a native mobile shell registers it to report
 * the on-screen keyboard, and labre ships no such shell. The widget asked for
 * it with a hard `std.get`, which throws by construction, and it asked from
 * `connectedCallback` — before any flag check — so the crash happened even with
 * `enable_mobile_keyboard_toolbar` off, which is the default.
 *
 * These tests pin the two halves of the contract: the getter never throws
 * without a provider, and the fallback it returns is COMPLETE — `visible$` and
 * `height$` included, because `PositionController` and the toolbar read them
 * unconditionally.
 */
import { VirtualKeyboardProvider } from '@labre/affine-shared/services';
import { AffineKeyboardToolbarWidget } from '@labre/affine-widget-keyboard-toolbar';
import { Container } from '@labre/global/di';
import { signal } from '@preact/signals-core';
import { describe, expect, test } from 'vitest';

/**
 * The getter alone, with a container we control — the widget is a custom
 * element whose upgrade drags in an editor host, and none of that is what is
 * under test here.
 */
function widgetWithContainer(container: Container) {
  const widget = Object.create(
    AffineKeyboardToolbarWidget.prototype
  ) as AffineKeyboardToolbarWidget;
  Object.defineProperty(widget, 'std', { value: container.provider() });
  return widget;
}

describe('keyboard toolbar without a VirtualKeyboardProvider', () => {
  test('the getter falls back instead of throwing', () => {
    const widget = widgetWithContainer(new Container());

    expect(() => widget.keyboard).not.toThrow();
    expect(widget.keyboard.fallback).toBe(true);
  });

  test('the fallback carries usable signals', () => {
    const widget = widgetWithContainer(new Container());

    expect(widget.keyboard.height$.value).toBe(0);
    expect(widget.keyboard.visible$.value).toBe(false);
  });

  test('the fallback signals are stable across reads', () => {
    // `render()` reads the getter; a fresh signal per call would hand
    // `PositionController`'s effect a new object on every frame.
    const widget = widgetWithContainer(new Container());

    expect(widget.keyboard.height$).toBe(widget.keyboard.height$);
    expect(widget.keyboard.visible$).toBe(widget.keyboard.visible$);
  });
});

describe('keyboard toolbar with a host-supplied provider', () => {
  test("an action-less provider still wins on the keyboard's signals", () => {
    const visible$ = signal(true);
    const height$ = signal(320);
    const container = new Container();
    container.addImpl(VirtualKeyboardProvider, { visible$, height$ });

    const { keyboard } = widgetWithContainer(container);

    expect(keyboard.height$).toBe(height$);
    expect(keyboard.visible$).toBe(visible$);
    // No `show`/`hide` of its own, so the built-in ones stay in place.
    expect(keyboard.fallback).toBe(true);
    expect(typeof keyboard.show).toBe('function');
  });

  test('a provider with actions is returned as-is', () => {
    const provider = {
      visible$: signal(false),
      height$: signal(0),
      show: () => {},
      hide: () => {},
    };
    const container = new Container();
    container.addImpl(VirtualKeyboardProvider, provider);

    const { keyboard } = widgetWithContainer(container);

    expect(keyboard).toBe(provider);
    expect(keyboard.fallback).toBeUndefined();
  });
});
