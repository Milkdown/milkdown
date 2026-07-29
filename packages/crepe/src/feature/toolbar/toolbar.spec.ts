import { test, expect, describe } from 'vitest'

import type { ToolbarItem } from './config'

import { getGroups } from './config'

function itemsOf(config?: Parameters<typeof getGroups>[0]) {
  return getGroups(config).flatMap((group) => group.items)
}

function itemByKey(key: string, config?: Parameters<typeof getGroups>[0]) {
  const item = itemsOf(config).find((candidate) => candidate.key === key)
  if (!item) throw new Error(`No toolbar item with key ${key}`)
  return item as ToolbarItem & { key: string }
}

describe('toolbar item labels', () => {
  test('every built-in item ships an accessible name', () => {
    // Without a label the button exposes no name at all — its only child is an
    // SVG — so a missing one is an accessibility regression, not a nicety.
    for (const item of itemsOf()) {
      expect(item.label, `item ${item.key} has no label`).toBeTruthy()
    }
  })

  test('labels default to English', () => {
    expect(itemByKey('bold').label).toBe('Bold')
    expect(itemByKey('italic').label).toBe('Italic')
    expect(itemByKey('strikethrough').label).toBe('Strikethrough')
    expect(itemByKey('code').label).toBe('Inline code')
    expect(itemByKey('link').label).toBe('Link')
  })

  test('config overrides a label for localization', () => {
    expect(itemByKey('bold', { boldLabel: 'Fett' }).label).toBe('Fett')
    expect(itemByKey('link', { linkLabel: 'Enlace' }).label).toBe('Enlace')
  })

  test('no shortcut is set by default', () => {
    // Crepe does not know which combos the host bound, so it advertises none.
    for (const item of itemsOf()) {
      expect(item.shortcut).toBeUndefined()
    }
  })

  test('a custom item can carry a label and a shortcut', () => {
    const items = itemsOf({
      buildToolbar: (builder) => {
        builder.addGroup('custom', 'Custom').addItem('highlight', {
          icon: '<svg />',
          label: 'Highlight',
          shortcut: '⌘⇧H',
          active: () => false,
          onRun: () => {},
        })
      },
    })

    const highlight = items.find((item) => item.key === 'highlight')
    expect(highlight?.label).toBe('Highlight')
    expect(highlight?.shortcut).toBe('⌘⇧H')
  })
})
