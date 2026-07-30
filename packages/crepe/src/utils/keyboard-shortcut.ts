import type { Ctx, SliceType } from '@milkdown/kit/ctx'
import type { KeymapConfig } from '@milkdown/kit/utils'

import { browser } from '@milkdown/kit/prose'

/// A reference to a single entry of a milkdown keymap slice — the one place a
/// shortcut is actually bound. UI items point at this instead of re-spelling the
/// shortcut, so display and `aria-keyshortcuts` are derived from the source of
/// truth and stay correct when the host rebinds the key.
export interface KeymapRef {
  slice: SliceType<KeymapConfig<string>>
  entry: string
}

/// Build a `KeymapRef`. The generic keeps `entry` checked against the slice's
/// real entry names (`keymapRef(strongKeymap.key, 'ToggleBold')` — a typo is a
/// compile error) while the single unavoidable cast to the erased storage type
/// is localized here, so `ToolbarItem` never has to be generic.
export function keymapRef<K extends string>(
  slice: SliceType<KeymapConfig<K>>,
  entry: K
): KeymapRef {
  return { slice: slice as SliceType<KeymapConfig<string>>, entry }
}

/// A shortcut rendered for both of its readers: `display` for a human (tooltip),
/// `aria` for the `aria-keyshortcuts` attribute.
export interface ResolvedShortcut {
  display: string
  aria: string
}

interface NormalizedKey {
  display: string
  aria: string
}

/// A `KeyboardEvent.key` value for the ARIA attribute, plus a display form.
/// Single characters are upper-cased (`b` → `B`, `-` stays `-`); named keys
/// (`Enter`, `ArrowUp`, …) pass through; `Space` maps to the literal space the
/// ARIA grammar expects for that key.
function normalizeKey(key: string): NormalizedKey {
  if (key === ' ' || key.toLowerCase() === 'space')
    return { display: 'Space', aria: ' ' }
  if (key.length === 1) {
    const upper = key.toUpperCase()
    return { display: upper, aria: upper }
  }
  return { display: key, aria: key }
}

/// Format a prosemirror keymap shortcut (`Mod-b`, `Mod-Alt-x`) into a display
/// string and an `aria-keyshortcuts` value. `mac` is injected so the pure output
/// is testable on both platforms without stubbing `navigator`; callers pass
/// `browser.mac`.
///
/// - `Mod` resolves to `Meta` on macOS and `Control` elsewhere, matching what
///   prosemirror-keymap actually binds.
/// - Display follows each platform's convention: macOS glyphs `⌃⌥⇧⌘` with the
///   Command key next to the key and no separators (`⌥⌘X`); elsewhere `+`-joined
///   names with the primary modifier first (`Ctrl+Alt+X`).
/// - The ARIA value uses the attribute's grammar: `+`-joined modifiers from
///   `Meta`/`Control`/`Alt`/`Shift` followed by a `KeyboardEvent.key` value
///   (`Meta+Shift+H`, `Control+B`).
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
  const entry = ctx.get(ref.slice)[ref.entry]
  const shortcut = entry ? [entry.shortcuts].flat()[0] : undefined
  if (!shortcut) return undefined
  return formatKeymapShortcut(shortcut, browser.mac)
}
