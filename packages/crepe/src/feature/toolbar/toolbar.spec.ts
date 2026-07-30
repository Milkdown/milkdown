import { test, expect, describe } from 'vitest'

import type { ToolbarItem } from './config'

import { Crepe } from '../../core'
import { CrepeFeature } from '../../feature'
import { getGroups } from './config'

type Config = Parameters<typeof getGroups>[0]
type Ctx = Parameters<typeof getGroups>[1]

function itemsOf(config?: Config, ctx?: Ctx) {
  return getGroups(config, ctx).flatMap((group) => group.items)
}

function itemByKey(key: string, config?: Config, ctx?: Ctx) {
  const item = itemsOf(config, ctx).find((candidate) => candidate.key === key)
  if (!item) throw new Error(`No toolbar item with key ${key}`)
  return item as ToolbarItem & { key: string }
}

/// LaTeX is on by default, so a plain instance is enough to reach that item.
async function ctxWithLatex() {
  const crepe = new Crepe()
  await crepe.create()
  return crepe.editor.ctx
}

/// The AI item only renders when the feature is on *and* a provider is set.
async function ctxWithAI() {
  const crepe = new Crepe({
    features: { [CrepeFeature.AI]: true },
    featureConfigs: {
      [CrepeFeature.AI]: {
        provider: async function* () {
          yield ''
        },
      },
    },
  })
  await crepe.create()
  return crepe.editor.ctx
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

  describe('conditionally rendered items', () => {
    test('the latex item is labelled, and overridable', async () => {
      const ctx = await ctxWithLatex()
      expect(itemByKey('latex', undefined, ctx).label).toBe('Inline math')
      expect(itemByKey('latex', { latexLabel: 'Formel' }, ctx).label).toBe(
        'Formel'
      )
    })

    test('the ai item is labelled, and overridable', async () => {
      const ctx = await ctxWithAI()
      expect(itemByKey('ai', undefined, ctx).label).toBe('Ask AI')
      expect(itemByKey('ai', { aiLabel: 'KI fragen' }, ctx).label).toBe(
        'KI fragen'
      )
    })

    test('every item is labelled once latex and ai are present', async () => {
      const ctx = await ctxWithAI()
      const keys = itemsOf(undefined, ctx).map((item) => item.key)
      expect(keys).toContain('latex')
      expect(keys).toContain('ai')
      for (const item of itemsOf(undefined, ctx)) {
        expect(item.label, `item ${item.key} has no label`).toBeTruthy()
      }
    })
  })
})

describe('toolbar item shortcuts', () => {
  test('neither shortcut field is set by default', () => {
    // Crepe does not know which combos the host bound, so it advertises none.
    for (const item of itemsOf()) {
      expect(item.shortcut).toBeUndefined()
      expect(item.ariaKeyshortcuts).toBeUndefined()
    }
  })

  test('display glyphs and the ARIA value are carried separately', () => {
    // `⌘⇧H` is what a macOS user should read, but it is not valid
    // `aria-keyshortcuts` — hence the two fields.
    const items = itemsOf({
      buildToolbar: (builder) => {
        builder.addGroup('custom', 'Custom').addItem('highlight', {
          icon: '<svg />',
          label: 'Highlight',
          shortcut: '⌘⇧H',
          ariaKeyshortcuts: 'Meta+Shift+H',
          active: () => false,
          onRun: () => {},
        })
      },
    })

    const highlight = items.find((item) => item.key === 'highlight')
    expect(highlight?.label).toBe('Highlight')
    expect(highlight?.shortcut).toBe('⌘⇧H')
    expect(highlight?.ariaKeyshortcuts).toBe('Meta+Shift+H')
  })
})
