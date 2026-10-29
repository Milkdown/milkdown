import type { EditorView } from '@milkdown/prose/view'

import { defaultValueCtx, Editor, editorViewCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'
import { NodeSelection, TextSelection } from '@milkdown/prose/state'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { tableBlock } from '..'

// A manual frame clock. `runFrame` runs the queued callbacks.
const frames = new Map<number, FrameRequestCallback>()
let nextFrameId = 0

function runFrame() {
  const due = Array.from(frames.keys())
  for (const id of due) {
    const callback = frames.get(id)
    frames.delete(id)
    callback?.(performance.now())
  }
}

const editors: Editor[] = []

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++nextFrameId, callback)
    return nextFrameId
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
})

afterEach(async () => {
  for (const editor of editors.splice(0)) await editor.destroy()
  frames.clear()
  vi.unstubAllGlobals()
})

const markdown = `
| name  | age |
| ----- | --- |
| Alice | 28  |
| Bob   | 31  |
`

async function createEditor() {
  const root = document.createElement('div')
  document.body.appendChild(root)
  const editor = Editor.make()
    .config((ctx) => {
      ctx.set(defaultValueCtx, markdown)
    })
    .use(commonmark)
    .use(gfm)
    .use(tableBlock)
  await editor.create()
  editors.push(editor)
  return editor.ctx.get(editorViewCtx)
}

function findText(view: EditorView, text: string) {
  let found = -1
  view.state.doc.descendants((node, pos) => {
    if (found < 0 && node.isText && node.text === text) found = pos
  })
  return found
}

describe('table block cell click', () => {
  it('does not overwrite a newer selection with the deferred click selection', async () => {
    const view = await createEditor()
    const alice = findText(view, 'Alice')
    const age = findText(view, '28')
    expect(alice).toBeGreaterThan(0)

    // jsdom has no layout, so point the click at the "Alice" cell.
    view.posAtCoords = () => ({ pos: alice, inside: alice })
    const nodeView = (view.dom.querySelector('.milkdown-table-block') as any)
      .pmViewDesc?.spec
    expect(nodeView).toBeDefined()

    const target = view.dom.querySelector('td') as HTMLElement
    const event = new MouseEvent('pointerdown', { bubbles: true })
    Object.defineProperty(event, 'target', { value: target })
    expect(nodeView.stopEvent(event)).toBe(true)

    // A newer selection arrives before the frame runs.
    view.dispatch(
      view.state.tr.setSelection(TextSelection.create(view.state.doc, age + 1))
    )
    const newer = view.state.selection

    runFrame()

    expect(view.state.selection.eq(newer)).toBe(true)
    expect(view.state.selection).not.toBeInstanceOf(NodeSelection)
  })

  it('still selects the clicked cell when nothing changed meanwhile', async () => {
    const view = await createEditor()
    const alice = findText(view, 'Alice')
    view.posAtCoords = () => ({ pos: alice, inside: alice })
    const nodeView = (view.dom.querySelector('.milkdown-table-block') as any)
      .pmViewDesc?.spec
    const target = view.dom.querySelector('td') as HTMLElement
    const event = new MouseEvent('pointerdown', { bubbles: true })
    Object.defineProperty(event, 'target', { value: target })
    expect(nodeView.stopEvent(event)).toBe(true)

    runFrame()

    expect(view.state.selection).toBeInstanceOf(NodeSelection)
  })
})
