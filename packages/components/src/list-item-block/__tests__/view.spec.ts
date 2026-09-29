import type { Transaction } from '@milkdown/prose/state'

import { defaultValueCtx, Editor, editorViewCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { TextSelection } from '@milkdown/prose/state'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { listItemBlockComponent } from '..'

// A manual frame clock. The next `runFrame` runs the queued callbacks.
const frames = new Map<number, FrameRequestCallback>()
let nextFrameId = 0

function runFrame() {
  // Copy the ids first. A callback that a frame queues runs in the next frame.
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

async function createEditor(markdown: string) {
  const root = document.createElement('div')
  document.body.appendChild(root)
  const editor = Editor.make()
    .config((ctx) => {
      ctx.set(defaultValueCtx, markdown)
    })
    .use(commonmark)
    .use(listItemBlockComponent)
  await editor.create()
  editors.push(editor)
  const view = editor.ctx.get(editorViewCtx)
  const restores: Transaction[] = []
  const dispatch = view.dispatch.bind(view)
  view.dispatch = (tr: Transaction) => {
    if (tr.selectionSet && !tr.docChanged) restores.push(tr)
    dispatch(tr)
  }
  return { view, restores }
}

const bullets = (count: number) =>
  Array.from({ length: count }, (_, i) => `* item ${i + 1}`).join('\n')

describe('listItemBlockView selection restore', () => {
  it('dispatches one restore for many items that mount in one frame', async () => {
    const { view, restores } = await createEditor(bullets(40))
    const { anchor, head } = view.state.selection

    runFrame()

    expect(restores).toHaveLength(1)
    expect(view.state.selection.anchor).toBe(anchor)
    expect(view.state.selection.head).toBe(head)
  })

  it('restores the selection of the last item that mounts in the frame', async () => {
    const { view, restores } = await createEditor(bullets(3))
    runFrame()
    restores.length = 0

    const at = (text: string) => {
      let found = -1
      view.state.doc.descendants((node, pos) => {
        if (found < 0 && node.isText && node.text?.includes(text))
          found = pos + node.text.indexOf(text) + text.length
      })
      return found
    }
    const select = (pos: number) =>
      view.dispatch(
        view.state.tr.setSelection(TextSelection.create(view.state.doc, pos))
      )

    select(at('item 1'))
    view.dispatch(view.state.tr.split(view.state.selection.from, 2))
    select(at('item 3'))
    view.dispatch(view.state.tr.split(view.state.selection.from, 2))
    const last = view.state.selection.head
    select(at('item 1'))
    restores.length = 0

    runFrame()

    expect(restores).toHaveLength(1)
    expect(view.state.selection.head).toBe(last)
  })

  it('does not restore for an item that is destroyed before the frame', async () => {
    const { view, restores } = await createEditor(bullets(3))
    runFrame()
    const before = view.state.doc
    view.dispatch(view.state.tr.split(5, 2))
    view.dispatch(
      view.state.tr.replaceWith(0, view.state.doc.content.size, before.content)
    )
    restores.length = 0

    runFrame()

    expect(restores).toHaveLength(0)
  })
})
