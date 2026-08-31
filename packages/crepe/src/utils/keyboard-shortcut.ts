import type { Ctx, SliceType } from '@milkdown/kit/ctx'
import type { KeymapConfig } from '@milkdown/kit/utils'

import { browser } from '@milkdown/kit/prose'

/// A reference to one entry of a milkdown keymap slice, the single
/// place that binds a shortcut. A UI item points at the entry instead of
/// spelling the shortcut again. The display form and the
/// `aria-keyshortcuts` value follow the binding, so both stay correct
/// when the host rebinds the key.
export interface KeymapRef {
  slice: SliceType<KeymapConfig<string>>
  entry: string
}

/// Build a `KeymapRef`. The generic checks `entry` against the real
/// entry names of the slice, so a typo in
/// `keymapRef(strongKeymap.key, 'ToggleBold')` fails to compile. It also
/// keeps the one cast to the erased storage type here, so `ToolbarItem`
/// stays non-generic.
export function keymapRef<K extends string>(
  slice: SliceType<KeymapConfig<K>>,
  entry: K
): KeymapRef {
  return { slice: slice as SliceType<KeymapConfig<string>>, entry }
}

/// A shortcut rendered for both of its readers. `display` goes to a
/// human in a tooltip. `aria` goes to the `aria-keyshortcuts` attribute.
export interface ResolvedShortcut {
  display: string
  aria: string
}

interface NormalizedKey {
  display: string
  aria: string
}

/// A `KeyboardEvent.key` value for the ARIA attribute, plus a display
/// form. A single character turns upper-case, so `b` becomes `B` and `-`
/// stays `-`. A named key such as `Enter` or `ArrowUp` passes through.
/// `Space` maps to the literal space that the ARIA grammar expects.
function normalizeKey(key: string): NormalizedKey {
  if (key === ' ' || key.toLowerCase() === 'space')
    return { display: 'Space', aria: ' ' }
  if (key.length === 1) {
    const upper = key.toUpperCase()
    return { display: upper, aria: upper }
  }
  return { display: key, aria: key }
}

/// Format a prosemirror keymap shortcut such as `Mod-b` or `Mod-Alt-x`
/// into a display string and an `aria-keyshortcuts` value. The caller
/// passes `mac`, normally `browser.mac`. The injected flag keeps the
/// output pure and testable on both platforms without a `navigator`
/// stub.
///
/// - `Mod` resolves to `Meta` on macOS and to `Control` elsewhere, the
///   same as prosemirror-keymap binds it.
/// - Display follows the platform convention. macOS uses the glyphs
///   `⌃⌥⇧⌘`, puts the Command key next to the key and adds no
///   separator, as in `⌥⌘X`. Every other platform joins names with `+`
///   and puts the primary modifier first, as in `Ctrl+Alt+X`.
/// - The ARIA value follows the attribute grammar. It joins the
///   modifiers `Meta`, `Control`, `Alt` and `Shift` with `+`, then adds a
///   `KeyboardEvent.key` value, as in `Meta+Shift+H` or `Control+B`.
export function formatKeymapShortcut(
  shortcut: string,
  mac: boolean
): ResolvedShortcut {
  // Split on `-` but not a trailing one, so the `-` key survives (`Mod--`).
  const parts = shortcut.split(/-(?!$)/)
  const rawKey = parts[parts.length - 1] ?? ''
  const modifiers = parts.slice(0, -1)

  let meta = false
  let control = false
  let alt = false
  let shift = false
  for (const modifier of modifiers) {
    switch (modifier.toLowerCase()) {
      case 'mod':
        if (mac) meta = true
        else control = true
        break
      case 'meta':
      case 'cmd':
      case 'm':
        meta = true
        break
      case 'ctrl':
      case 'control':
      case 'c':
        control = true
        break
      case 'alt':
      case 'option':
      case 'a':
        alt = true
        break
      case 'shift':
      case 's':
        shift = true
        break
      default:
        // Ignore unknown modifiers rather than emit a broken shortcut.
        break
    }
  }

  const key = normalizeKey(rawKey)

  const display = mac
    ? [control && '⌃', alt && '⌥', shift && '⇧', meta && '⌘', key.display]
        .filter(Boolean)
        .join('')
    : [
        control && 'Ctrl',
        alt && 'Alt',
        shift && 'Shift',
        meta && 'Meta',
        key.display,
      ]
        .filter(Boolean)
        .join('+')

  const aria = [
    meta && 'Meta',
    control && 'Control',
    alt && 'Alt',
    shift && 'Shift',
    key.aria,
  ]
    .filter(Boolean)
    .join('+')

  return { display, aria }
}

/// Resolve a `KeymapRef` against the live editor context. Reads the (possibly
/// rebound) shortcut from the slice and formats it for the current platform.
/// Returns `undefined` when the entry carries no shortcut. Only the first
/// binding is used when an entry lists several.
export function resolveKeymapShortcut(
  ctx: Ctx,
  ref: KeymapRef
): ResolvedShortcut | undefined {
  // A custom item may point at a keymap whose plugin isn't loaded in this
  // editor; reading a missing slice throws, which would break toolbar
  // construction, so treat it as "no shortcut" instead.
  if (!ctx.isInjected(ref.slice)) return undefined
  const entry = ctx.get(ref.slice)[ref.entry]
  const shortcut = entry ? [entry.shortcuts].flat()[0] : undefined
  if (!shortcut) return undefined
  return formatKeymapShortcut(shortcut, browser.mac)
}
