import '@testing-library/jest-dom/vitest'
import { linkTooltipAPI } from '@milkdown/kit/component/link-tooltip'
import { editorViewCtx } from '@milkdown/kit/core'
import { linkSchema } from '@milkdown/kit/preset/commonmark'
import { afterEach, describe, expect, test } from 'vitest'

import { Crepe } from '../../core'
import { CrepeFeature } from '../index'

function waitForAsync() {
  return new Promise<void>((resolve) => setTimeout(resolve, 0))
}

function getEditTooltip() {
  return document.body.querySelector<HTMLElement>('.milkdown-link-edit')
}

function createCrepe(defaultValue: string) {
  // Disable Cursor feature: prosemirror-virtual-cursor uses Range.getClientRects
  // which jsdom does not implement.
  return new Crepe({
    defaultValue,
    features: {
      [CrepeFeature.Cursor]: false,
    },
  })
}

describe('link tooltip edit', () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  test('inserts URL as linked text when selection is empty', async () => {
    const crepe = createCrepe('hello')

    await crepe.create()
    await waitForAsync()

    // Cursor between "h" and "ello" — empty selection.
    const cursorPos = 2
    crepe.editor.ctx.get(linkTooltipAPI.key).addLink(cursorPos, cursorPos)
    await waitForAsync()

    const tooltip = getEditTooltip()
    expect(tooltip).toHaveAttribute('data-show', 'true')

    const input = tooltip!.querySelector('input') as HTMLInputElement
    input.value = 'https://example.com'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    )
    await waitForAsync()

    const linkType = linkSchema.type(crepe.editor.ctx)
    const updated = crepe.editor.ctx.get(editorViewCtx).state.doc
    let foundHref: string | null = null
    let linkedText = ''
    updated.descendants((node) => {
      const linkMark = node.marks.find((m) => m.type === linkType)
      if (linkMark) {
        foundHref = linkMark.attrs.href
        linkedText = node.text ?? ''
      }
      return true
    })

    expect(foundHref).toBe('https://example.com')
    expect(linkedText).toBe('https://example.com')
    expect(getEditTooltip()).toHaveAttribute('data-show', 'false')
  })

  test('does nothing when confirming an empty URL on empty selection', async () => {
    const crepe = createCrepe('hello')

    await crepe.create()
    await waitForAsync()

    const before = crepe.editor.ctx.get(editorViewCtx).state.doc.toJSON()
    crepe.editor.ctx.get(linkTooltipAPI.key).addLink(2, 2)
    await waitForAsync()

    const input = getEditTooltip()!.querySelector('input') as HTMLInputElement
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    )
    await waitForAsync()

    const after = crepe.editor.ctx.get(editorViewCtx).state.doc.toJSON()
    expect(after).toEqual(before)
    expect(getEditTooltip()).toHaveAttribute('data-show', 'false')
  })

  test('closes the edit tooltip when clicking outside', async () => {
    const crepe = createCrepe('hello world')

    await crepe.create()
    await waitForAsync()

    crepe.editor.ctx.get(linkTooltipAPI.key).addLink(1, 6)
    await waitForAsync()

    expect(getEditTooltip()).toHaveAttribute('data-show', 'true')

    const outside = document.createElement('div')
    document.body.appendChild(outside)
    outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    await waitForAsync()

    expect(getEditTooltip()).toHaveAttribute('data-show', 'false')
  })

  test('keeps the edit tooltip open when clicking inside it', async () => {
    const crepe = createCrepe('hello world')

    await crepe.create()
    await waitForAsync()

    crepe.editor.ctx.get(linkTooltipAPI.key).addLink(1, 6)
    await waitForAsync()

    const tooltip = getEditTooltip()!
    expect(tooltip).toHaveAttribute('data-show', 'true')

    const input = tooltip.querySelector('input') as HTMLInputElement
    input.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    await waitForAsync()

    expect(getEditTooltip()).toHaveAttribute('data-show', 'true')
  })
})
