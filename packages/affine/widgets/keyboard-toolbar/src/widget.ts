import { getDocTitleByEditorHost } from '@labre/affine-fragment-doc-title';
import type { RootBlockModel } from '@labre/affine-model';
import {
  FeatureFlagService,
  isVirtualKeyboardProviderWithAction,
  VirtualKeyboardProvider,
  type VirtualKeyboardProviderWithAction,
} from '@labre/affine-shared/services';
import { IS_MOBILE } from '@labre/global/env';
import { WidgetComponent, WidgetViewExtension } from '@labre/std';
import { effect, signal } from '@preact/signals-core';
import { html, nothing } from 'lit';
import { literal, unsafeStatic } from 'lit/static-html.js';

import {
  defaultKeyboardToolbarConfig,
  KeyboardToolbarConfigExtension,
} from './config.js';

export const AFFINE_KEYBOARD_TOOLBAR_WIDGET = 'affine-keyboard-toolbar-widget';

/**
 * Signals backing the fallback keyboard, at module level on purpose: the
 * `keyboard` getter is read from `render()`, so a fresh `signal()` per call
 * would hand `PositionController`'s effect a brand new object every frame.
 */
const fallbackKeyboardVisible$ = signal(false);
const fallbackKeyboardHeight$ = signal(0);

export class AffineKeyboardToolbarWidget extends WidgetComponent<RootBlockModel> {
  private readonly _close = (blur: boolean) => {
    if (blur) {
      if (document.activeElement === this._docTitle?.inlineEditorContainer) {
        this._docTitle?.inlineEditor?.setInlineRange(null);
        this._docTitle?.inlineEditor?.eventSource?.blur();
      } else if (document.activeElement === this.block?.rootComponent) {
        this.std.selection.clear();
      }
    }
    this._show$.value = false;
  };

  private readonly _show$ = signal(false);

  private _initialInputMode: string = '';

  get keyboard(): VirtualKeyboardProviderWithAction & { fallback?: boolean } {
    // The provider is host-supplied — a native mobile shell reports the
    // on-screen keyboard. Labre ships no such shell, so a plain web host
    // registers nothing and this lookup must stay optional; a hard `get` throws
    // and takes the whole document open down with it (issue #247).
    const provider = this.std.getOptional(VirtualKeyboardProvider);
    if (provider && isVirtualKeyboardProviderWithAction(provider))
      return provider;

    return {
      // Fallback keyboard, complete WITHOUT a provider: the signals come first
      // so that a provider without actions still wins on them through the
      // spread below, while its `show`/`hide` stay ours.
      fallback: true,
      visible$: fallbackKeyboardVisible$,
      height$: fallbackKeyboardHeight$,
      show: () => {
        const rootComponent = this.block?.rootComponent;
        if (rootComponent && rootComponent === document.activeElement) {
          rootComponent.inputMode = this._initialInputMode;
        }
      },
      hide: () => {
        const rootComponent = this.block?.rootComponent;
        if (rootComponent && rootComponent === document.activeElement) {
          rootComponent.inputMode = 'none';
        }
      },
      ...provider,
    };
  }

  private get _docTitle() {
    return getDocTitleByEditorHost(this.std.host);
  }

  get config() {
    return {
      ...defaultKeyboardToolbarConfig,
      ...this.std.getOptional(KeyboardToolbarConfigExtension.identifier),
    };
  }

  override connectedCallback(): void {
    super.connectedCallback();

    const rootComponent = this.block?.rootComponent;
    if (rootComponent) {
      this.disposables.addFromEvent(rootComponent, 'focus', () => {
        this._show$.value = true;
      });
      this.disposables.addFromEvent(rootComponent, 'blur', () => {
        this._show$.value = false;
      });

      if (this.keyboard.fallback) {
        this._initialInputMode = rootComponent.inputMode;
        this.disposables.add(() => {
          rootComponent.inputMode = this._initialInputMode;
        });
        this.disposables.add(
          effect(() => {
            // recover input mode when keyboard toolbar is hidden
            if (!this._show$.value) {
              rootComponent.inputMode = this._initialInputMode;
            }
          })
        );
      }
    }

    if (this._docTitle) {
      const { inlineEditorContainer } = this._docTitle;
      this.disposables.addFromEvent(inlineEditorContainer, 'focus', () => {
        this._show$.value = true;
      });
      this.disposables.addFromEvent(inlineEditorContainer, 'blur', () => {
        this._show$.value = false;
      });
    }
  }

  override render() {
    if (
      this.store.readonly ||
      !IS_MOBILE ||
      !this.store
        .get(FeatureFlagService)
        .getFlag('enable_mobile_keyboard_toolbar')
    )
      return nothing;

    if (!this._show$.value) return nothing;

    if (!this.block?.rootComponent) return nothing;

    return html`<blocksuite-portal
      .shadowDom=${false}
      .template=${html`<affine-keyboard-toolbar
        .keyboard=${this.keyboard}
        .config=${this.config}
        .rootComponent=${this.block.rootComponent}
        .close=${this._close}
      ></affine-keyboard-toolbar>`}
    ></blocksuite-portal>`;
  }
}

export const keyboardToolbarWidget = WidgetViewExtension(
  'affine:page',
  AFFINE_KEYBOARD_TOOLBAR_WIDGET,
  literal`${unsafeStatic(AFFINE_KEYBOARD_TOOLBAR_WIDGET)}`
);

declare global {
  interface HTMLElementTagNameMap {
    [AFFINE_KEYBOARD_TOOLBAR_WIDGET]: AffineKeyboardToolbarWidget;
  }
}
