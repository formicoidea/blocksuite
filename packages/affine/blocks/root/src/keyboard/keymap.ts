import { KeymapExtension } from '@labre/std';

const NATIVE_FOCUSABLE_SELECTOR =
  'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * The editor host swallows Tab and Shift-Tab so that indentation stays under
 * the control of the block-scoped handlers. That would however trap the focus
 * on the native controls the editor renders (the collapse button of headings
 * and lists, for instance), which then could neither be reached nor left with
 * the keyboard. When the event originates from such a control — and not from
 * editable text — the native tabbing behaviour is let through.
 */
const isNativeFocusableTarget = (target: EventTarget | null) => {
  if (!(target instanceof Element)) return false;
  if (target instanceof HTMLElement && target.isContentEditable) return false;
  return !!target.closest(NATIVE_FOCUSABLE_SELECTOR);
};

export const fallbackKeymap = KeymapExtension(() => {
  return {
    Tab: ctx => {
      const event = ctx.get('defaultState').event;
      if (isNativeFocusableTarget(event.target)) return;
      event.stopPropagation();
      event.preventDefault();
    },
    'Shift-Tab': ctx => {
      const event = ctx.get('defaultState').event;
      if (isNativeFocusableTarget(event.target)) return;
      event.stopPropagation();
      event.preventDefault();
    },
  };
});
