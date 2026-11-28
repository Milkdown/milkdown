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

async function createEditor(value = markdown) {
  const editor = Editor.make()
    .config((ctx) => {
      ctx.set(defaultValueCtx, value)
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

function findNode(view: EditorView, name: string) {
  let found = -1
  view.state.doc.descendants((node, pos) => {
    if (found < 0 && node.type.name === name) found = pos
  })
  expect(found).toBeGreaterThanOrEqual(0)
  return found
}

// jsdom has no layout, so `posAtCoords` is pointed at `pos` by hand.
function pointAt(view: EditorView, pos: number) {
  view.posAtCoords = () => ({ pos, inside: pos, affinity: 0 })
}

// Asks the table node view whether it takes a mousedown on `target`, the way
// prosemirror-view does before handling the event itself.
function mousedownOn(view: EditorView, target: Element | null) {
  expect(target).toBeInstanceOf(Element)
  const event = new MouseEvent('mousedown', { bubbles: true })
  Object.defineProperty(event, 'target', { value: target })
  return getTableNodeView(view).stopEvent(event)
}

// Sends a mousedown to the table node view, aimed at the cell holding `text`.
function clickCell(view: EditorView, text: string) {
  pointAt(view, findText(view, text))
  expect(mousedownOn(view, view.dom.querySelector('td'))).toBe(true)
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

describe('table block mousedown', () => {
  it.each([
    'col-drag-handle',
    'row-drag-handle',
    'x-line-drag-handle',
    'y-line-drag-handle',
  ])('keeps prosemirror from handling a mousedown on the %s', async (role) => {
    const view = await createEditor()

    // prosemirror-view prevents the default action of a mousedown it handles,
    // which cancels the native drag that a drag handle starts.
    expect(
      mousedownOn(view, view.dom.querySelector(`[data-role="${role}"]`))
    ).toBe(true)
  })

  // prosemirror-view marks draggable leaf nodes, and node-selected nodes with
  // content, as `draggable`. They are content, not table handles.
  it('leaves a mousedown on a draggable image in the caret cell to prosemirror', async () => {
    const view = await createEditor(`
| name  | photo       |
| ----- | ----------- |
| Alice | ![x](a.png) |
`)
    const image = findNode(view, 'image')
    setCaret(view, image)
    pointAt(view, image)

    const img = view.dom.querySelector('td img[src="a.png"]')
    expect(img).toHaveProperty('draggable', true)
    expect(mousedownOn(view, img)).toBe(false)
  })

  it('leaves a second click in a selected cell to prosemirror', async () => {
    const view = await createEditor()
    clickCell(view, 'Alice')
    runFrame()
    expectCellSelected(view, 'Alice')

    const paragraph = view.nodeDOM(findText(view, 'Alice') - 1) as Element
    expect(paragraph).toHaveProperty('draggable', true)
    expect(mousedownOn(view, paragraph)).toBe(false)
  })

  it('selects the clicked cell while the table is node-selected', async () => {
    const view = await createEditor()
    view.dispatch(
      view.state.tr.setSelection(
        NodeSelection.create(view.state.doc, findNode(view, 'table'))
      )
    )
    expect(view.dom.querySelector('.milkdown-table-block')).toHaveProperty(
      'draggable',
      true
    )

    clickCell(view, 'Bob')
    runFrame()

    expectCellSelected(view, 'Bob')
  })
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
