import type { EditorView } from '@milkdown/prose/view'

import { defaultValueCtx, Editor, editorViewCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'
import { NodeSelection, TextSelection } from '@milkdown/prose/state'
import { CellSelection } from '@milkdown/prose/tables'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { TableNodeView } from '../view/view'

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
  vi.useRealTimers()
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
  expect(found).toBeGreaterThan(0)
  return found
}

// Sends a pointerdown to the table node view, aimed at the cell holding
// `text`. jsdom has no layout, so `posAtCoords` is pointed there by hand.
function clickCell(view: EditorView, text: string) {
  const pos = findText(view, text)
  view.posAtCoords = () => ({ pos, inside: pos, affinity: 0 })

  const event = new MouseEvent('pointerdown', { bubbles: true })
  Object.defineProperty(event, 'target', {
    value: view.dom.querySelector('td'),
  })
  expect(getTableNodeView(view).stopEvent(event)).toBe(true)
}

function getTableNodeView(view: EditorView) {
  const dom = view.dom.querySelector('.milkdown-table-block') as HTMLElement & {
    pmViewDesc?: { spec?: TableNodeView }
  }
  const nodeView = dom.pmViewDesc?.spec
  expect(nodeView).toBeDefined()
  return nodeView!
}

function setCaret(view: EditorView, pos: number) {
  view.dispatch(
    view.state.tr.setSelection(TextSelection.create(view.state.doc, pos))
  )
}

// The cell's paragraph starts one position before its text.
function expectCellSelected(view: EditorView, text: string) {
  const { selection } = view.state
  expect(selection).toBeInstanceOf(NodeSelection)
  expect(selection.from).toBe(findText(view, text) - 1)
}

describe('table block drag handles', () => {
  it.each(['col-drag-handle', 'row-drag-handle'])(
    'keeps prosemirror from handling a mousedown on the %s',
    async (role) => {
      const view = await createEditor()
      const handle = view.dom.querySelector(`[data-role="${role}"]`)
      expect(handle).toBeInstanceOf(HTMLElement)

      // prosemirror-view prevents the default action of a mousedown it
      // handles, which cancels the native drag the handle starts.
      const event = new MouseEvent('mousedown', { bubbles: true })
      Object.defineProperty(event, 'target', { value: handle })
      expect(getTableNodeView(view).stopEvent(event)).toBe(true)
    }
  )
})

describe('table block cell click', () => {
  it('selects the clicked cell when nothing changed meanwhile', async () => {
    const view = await createEditor()
    clickCell(view, 'Alice')

    runFrame()

    expectCellSelected(view, 'Alice')
  })

  it('selects the clicked cell after the browser puts the caret in it', async () => {
    const view = await createEditor()
    clickCell(view, 'Alice')

    // The browser's own handling of the click puts the caret in that cell.
    setCaret(view, findText(view, 'Alice') + 2)
    runFrame()

    expectCellSelected(view, 'Alice')
  })

  it('selects the clicked cell when leaving a cell selection', async () => {
    const view = await createEditor()
    const alice = findText(view, 'Alice')
    const age = findText(view, '28')
    // A cell starts two positions before its text.
    view.dispatch(
      view.state.tr.setSelection(
        CellSelection.create(view.state.doc, alice - 2, age - 2)
      )
    )

    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    clickCell(view, 'Bob')
    setCaret(view, findText(view, 'Bob') + 1)
    vi.advanceTimersByTime(20)

    expectCellSelected(view, 'Bob')
  })

  it('does not overwrite a newer selection with the deferred click selection', async () => {
    const view = await createEditor()
    clickCell(view, 'Alice')

    // A newer selection in another cell arrives before the frame runs.
    setCaret(view, findText(view, '28') + 1)
    const newer = view.state.selection

    runFrame()

    expect(view.state.selection.eq(newer)).toBe(true)
  })

  it('skips the deferred click selection when the document changed', async () => {
    const view = await createEditor()
    const before = view.state.selection
    clickCell(view, 'Alice')

    // An edit after the table changes the document but not the selection.
    view.dispatch(
      view.state.tr.insertText('x', view.state.doc.content.size - 2)
    )
    expect(view.state.selection.eq(before)).toBe(true)

    expect(() => runFrame()).not.toThrow()
    expect(view.state.selection.eq(before)).toBe(true)
  })
})
