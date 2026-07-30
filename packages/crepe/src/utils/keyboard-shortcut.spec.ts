import { describe, expect, test } from 'vitest'

import { formatKeymapShortcut } from './keyboard-shortcut'

describe('formatKeymapShortcut', () => {
  describe('on macOS', () => {
    test.each([
      ['Mod-b', '⌘B', 'Meta+B'],
      ['Mod-i', '⌘I', 'Meta+I'],
      ['Mod-e', '⌘E', 'Meta+E'],
      ['Mod-Alt-x', '⌥⌘X', 'Meta+Alt+X'],
      ['Mod-Shift-h', '⇧⌘H', 'Meta+Shift+H'],
    ])('%s → %s / %s', (shortcut, display, aria) => {
      expect(formatKeymapShortcut(shortcut, true)).toEqual({ display, aria })
    })
  })

  describe('elsewhere', () => {
    test.each([
      ['Mod-b', 'Ctrl+B', 'Control+B'],
      ['Mod-Alt-x', 'Ctrl+Alt+X', 'Control+Alt+X'],
      ['Mod-Shift-h', 'Ctrl+Shift+H', 'Control+Shift+H'],
    ])('%s → %s / %s', (shortcut, display, aria) => {
      expect(formatKeymapShortcut(shortcut, false)).toEqual({ display, aria })
    })
  })

  test('modifier order in the input does not matter', () => {
    expect(formatKeymapShortcut('Alt-Mod-x', true)).toEqual(
      formatKeymapShortcut('Mod-Alt-x', true)
    )
  })

  test('the `-` key survives the split', () => {
    // `/-(?!$)/` must not split the trailing hyphen.
    expect(formatKeymapShortcut('Mod--', true)).toEqual({
      display: '⌘-',
      aria: 'Meta+-',
    })
    expect(formatKeymapShortcut('Mod--', false)).toEqual({
      display: 'Ctrl+-',
      aria: 'Control+-',
    })
  })

  describe('non-letter keys', () => {
    test('Space becomes the literal space the ARIA grammar wants', () => {
      expect(formatKeymapShortcut('Mod-Space', true)).toEqual({
        display: '⌘Space',
        aria: 'Meta+ ',
      })
    })

    test('named keys pass through unchanged', () => {
      expect(formatKeymapShortcut('Mod-ArrowUp', false)).toEqual({
        display: 'Ctrl+ArrowUp',
        aria: 'Control+ArrowUp',
      })
    })
  })

  test('a bare key with no modifier is just the key', () => {
    expect(formatKeymapShortcut('b', true)).toEqual({ display: 'B', aria: 'B' })
  })
})
