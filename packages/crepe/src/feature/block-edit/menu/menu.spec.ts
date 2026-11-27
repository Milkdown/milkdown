import '@testing-library/jest-dom/vitest'
import { editorViewCtx } from '@milkdown/kit/core'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { Crepe } from '../../../core'

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

function getMenu() {
  return document.body.querySelector<HTMLElement>('.milkdown-slash-menu')
}

describe('slash menu', () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  // The slash provider debounces updates by 20ms. Escape inside that window
  // must not be undone by the update for the last keystroke.
  test('stays closed when Escape follows a keystroke', async () => {
    const crepe = new Crepe()
    await crepe.create()
    const view = crepe.editor.ctx.get(editorViewCtx)
    // jsdom cannot focus the contenteditable element.
    vi.spyOn(view, 'hasFocus').mockReturnValue(true)

    view.dispatch(view.state.tr.insertText('/'))
    await wait(50)
    expect(getMenu()).toHaveAttribute('data-show', 'true')

    view.dispatch(view.state.tr.insertText('h'))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(getMenu()).toHaveAttribute('data-show', 'false')

    await wait(50)
    expect(getMenu()).toHaveAttribute('data-show', 'false')

    await crepe.destroy()
  })
})
