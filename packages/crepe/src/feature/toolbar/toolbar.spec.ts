import { strongKeymap } from '@milkdown/kit/preset/commonmark'
import { browser } from '@milkdown/kit/prose'
import { test, expect, describe } from 'vitest'

import type { ToolbarItem } from './config'

import { Crepe } from '../../core'
import { CrepeFeature } from '../../feature'
import { formatKeymapShortcut, keymapRef } from '../../utils/keyboard-shortcut'
import { getGroups } from './config'

/// The shortcut strings a built-in should carry, computed the same way the
/// resolver does so assertions hold on whatever platform the tests run on.
function expectedShortcut(raw: string) {
  return formatKeymapShortcut(raw, browser.mac)
}

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
  test('without a ctx there is no binding to read, so none is derived', () => {
    // The keymap slices live on the editor ctx; getGroups is also called
    // ctx-less (e.g. to inspect labels), and then it advertises no shortcut.
    for (const item of itemsOf()) {
      expect(item.shortcut).toBeUndefined()
      expect(item.ariaKeyshortcuts).toBeUndefined()
    }
  })

  test('built-in items derive their shortcut from the keymap', async () => {
    const ctx = await ctxWithLatex()
    const bold = itemByKey('bold', undefined, ctx)
    expect(bold.shortcut).toBe(expectedShortcut('Mod-b').display)
    expect(bold.ariaKeyshortcuts).toBe(expectedShortcut('Mod-b').aria)
    expect(itemByKey('italic', undefined, ctx).ariaKeyshortcuts).toBe(
      expectedShortcut('Mod-i').aria
    )
    expect(itemByKey('code', undefined, ctx).ariaKeyshortcuts).toBe(
      expectedShortcut('Mod-e').aria
    )
    expect(itemByKey('strikethrough', undefined, ctx).ariaKeyshortcuts).toBe(
      expectedShortcut('Mod-Alt-x').aria
    )
  })

  test('a host rebinding flows through — single source of truth', async () => {
    const ctx = await ctxWithLatex()
    ctx.set(strongKeymap.key, { ToggleBold: { shortcuts: ['Mod-Alt-b'] } })
    const bold = itemByKey('bold', undefined, ctx)
    expect(bold.shortcut).toBe(expectedShortcut('Mod-Alt-b').display)
    expect(bold.ariaKeyshortcuts).toBe(expectedShortcut('Mod-Alt-b').aria)
  })

  test('an explicit string overrides the derived one', async () => {
    const ctx = await ctxWithLatex()
    const items = itemsOf(
      {
        buildToolbar: (builder) => {
          builder.addGroup('custom', 'Custom').addItem('override', {
            icon: '<svg />',
            label: 'Override',
            keymap: keymapRef(strongKeymap.key, 'ToggleBold'),
            shortcut: '⌘B',
            ariaKeyshortcuts: 'Meta+B',
            active: () => false,
            onRun: () => {},
          })
        },
      },
      ctx
    )
    const override = items.find((item) => item.key === 'override')
    expect(override?.shortcut).toBe('⌘B')
    expect(override?.ariaKeyshortcuts).toBe('Meta+B')
  })

  test('a custom item can point at a keymap instead of re-spelling it', async () => {
    // The whole reason keymap refs exist: a second UI entry for the same
    // command reuses the one binding rather than hand-writing the string again.
    const ctx = await ctxWithLatex()
    const items = itemsOf(
      {
        buildToolbar: (builder) => {
          builder.addGroup('custom', 'Custom').addItem('bold-again', {
            icon: '<svg />',
            label: 'Bold again',
            keymap: keymapRef(strongKeymap.key, 'ToggleBold'),
            active: () => false,
            onRun: () => {},
          })
        },
      },
      ctx
    )
    const item = items.find((candidate) => candidate.key === 'bold-again')
    expect(item?.ariaKeyshortcuts).toBe(expectedShortcut('Mod-b').aria)
  })

  test('items with no keymap advertise no shortcut', async () => {
    const ctx = await ctxWithAI()
    for (const key of ['link', 'latex', 'ai']) {
      const item = itemByKey(key, undefined, ctx)
      expect(item.shortcut, `${key} shortcut`).toBeUndefined()
      expect(item.ariaKeyshortcuts, `${key} ariaKeyshortcuts`).toBeUndefined()
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
