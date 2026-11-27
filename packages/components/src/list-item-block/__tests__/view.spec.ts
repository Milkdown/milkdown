import type { MilkdownPlugin } from '@milkdown/ctx'
import type { Transaction } from '@milkdown/prose/state'

import {
  commandsCtx,
  defaultValueCtx,
  Editor,
  editorViewCtx,
  rootCtx,
} from '@milkdown/core'
import {
  commonmark,
  liftListItemCommand,
  sinkListItemCommand,
  splitListItemCommand,
} from '@milkdown/preset-commonmark'
import { history, redo, undo } from '@milkdown/prose/history'
import { TextSelection } from '@milkdown/prose/state'
import { $prose } from '@milkdown/utils'
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
const cleanupNodes: Element[] = []

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++nextFrameId, callback)
    return nextFrameId
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
})

afterEach(async () => {
  for (const editor of editors.splice(0)) await editor.destroy()
  for (const node of cleanupNodes.splice(0)) node.remove()
  frames.clear()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

interface CreateEditorOptions {
  plugins?: MilkdownPlugin[]
  root?: Node
}

async function createEditor(markdown: string, options?: CreateEditorOptions) {
  const editor = Editor.make()
    .config((ctx) => {
      ctx.set(defaultValueCtx, markdown)
      if (options?.root) ctx.set(rootCtx, options.root)
    })
    .use(commonmark)
    .use(listItemBlockComponent)
  for (const plugin of options?.plugins ?? []) editor.use(plugin)
  await editor.create()
  editors.push(editor)
  const view = editor.ctx.get(editorViewCtx)
  const restores: Transaction[] = []
  const dispatch = view.dispatch.bind(view)
  view.dispatch = (tr: Transaction) => {
    if (tr.selectionSet && !tr.docChanged) restores.push(tr)
    dispatch(tr)
  }
  return { editor, view, restores }
}

function findTextEnd(
  view: ReturnType<typeof Editor.prototype.ctx.get<typeof editorViewCtx>>,
  text: string
) {
  let found = -1
  view.state.doc.descendants((node, pos) => {
    if (found < 0 && node.isText && node.text?.includes(text))
      found = pos + node.text.indexOf(text) + text.length
  })
  expect(found).toBeGreaterThan(0)
  return found
}

function setCaret(
  view: ReturnType<typeof Editor.prototype.ctx.get<typeof editorViewCtx>>,
  pos: number
) {
  view.dispatch(
    view.state.tr.setSelection(TextSelection.create(view.state.doc, pos))
  )
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

  // Regression tests for #2501: user input or document edits before the frame
  // must cancel the stale mount selection restore.
  it('keeps text typed after Enter when typing happens before the frame', async () => {
    const { editor, view, restores } = await createEditor(
      '* one\n* two\n* three'
    )
    runFrame()
    setCaret(view, findTextEnd(view, 'three'))
    editor.ctx.get(commandsCtx).call(splitListItemCommand.key)
    restores.length = 0

    view.dom.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'f', bubbles: true })
    )
    view.dispatch(view.state.tr.insertText('four'))
    runFrame()
    view.dispatch(view.state.tr.insertText('x'))

    expect(restores).toHaveLength(0)
    expect(view.state.doc.lastChild?.lastChild?.textContent).toBe('fourx')
  })

  it('keeps text typed after Tab and Shift-Tab before the frame', async () => {
    const { editor, view, restores } = await createEditor(
      '* one\n* two\n* three'
    )
    runFrame()
    setCaret(view, findTextEnd(view, 'two'))
    editor.ctx.get(commandsCtx).call(sinkListItemCommand.key)
    restores.length = 0

    view.dom.dispatchEvent(
      new KeyboardEvent('keydown', { key: ' ', bubbles: true })
    )
    view.dispatch(view.state.tr.insertText(' b'))
    runFrame()
    view.dispatch(view.state.tr.insertText('c'))

    expect(restores).toHaveLength(0)
    expect(view.state.doc.textContent).toContain('two bc')

    editor.ctx.get(commandsCtx).call(liftListItemCommand.key)
    restores.length = 0

    view.dom.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'd', bubbles: true })
    )
    view.dispatch(view.state.tr.insertText('d'))
    runFrame()
    view.dispatch(view.state.tr.insertText('e'))

    expect(restores).toHaveLength(0)
    expect(view.state.doc.textContent).toContain('two bcde')
  })

  it('keeps text typed after undo and redo before the frame', async () => {
    const historyPlugin = $prose(() => history())
    const { editor, view, restores } = await createEditor(
      '* one\n* two\n* three',
      { plugins: [historyPlugin] }
    )
    runFrame()
    setCaret(view, findTextEnd(view, 'two'))
    editor.ctx.get(commandsCtx).call(sinkListItemCommand.key)
    runFrame()

    expect(undo(view.state, view.dispatch)).toBe(true)
    runFrame()
    expect(redo(view.state, view.dispatch)).toBe(true)
    restores.length = 0
    view.dom.dispatchEvent(
      new KeyboardEvent('keydown', { key: ' ', bubbles: true })
    )
    view.dispatch(view.state.tr.insertText(' c'))
    runFrame()
    view.dispatch(view.state.tr.insertText('d'))

    expect(restores).toHaveLength(0)
    expect(view.state.doc.textContent).toContain('two cd')

    setCaret(view, findTextEnd(view, 'three'))
    editor.ctx.get(commandsCtx).call(sinkListItemCommand.key)
    runFrame()
    expect(undo(view.state, view.dispatch)).toBe(true)
    restores.length = 0
    view.dom.dispatchEvent(
      new KeyboardEvent('keydown', { key: ' ', bubbles: true })
    )
    view.dispatch(view.state.tr.insertText(' a'))
    runFrame()
    view.dispatch(view.state.tr.insertText('b'))

    expect(restores).toHaveLength(0)
    expect(view.state.doc.textContent).toContain('three ab')
  })

  it('keeps a click selection made after Tab before the frame', async () => {
    const { editor, view, restores } = await createEditor(
      '* one\n* two\n* three'
    )
    runFrame()
    setCaret(view, findTextEnd(view, 'two'))
    editor.ctx.get(commandsCtx).call(sinkListItemCommand.key)
    restores.length = 0

    const oneEnd = findTextEnd(view, 'one')
    view.dom.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    setCaret(view, oneEnd)
    restores.length = 0
    runFrame()

    expect(restores).toHaveLength(0)
    expect(view.state.selection.head).toBe(oneEnd)
  })

  it.each([
    'keydown',
    'pointerdown',
    'beforeinput',
    'input',
    'paste',
    'cut',
    'drop',
    'compositionstart',
  ])('drops the pending restore on %s before the frame', async (eventType) => {
    const { editor, view, restores } = await createEditor('* one\n* two')
    runFrame()
    setCaret(view, findTextEnd(view, 'two'))
    editor.ctx.get(commandsCtx).call(splitListItemCommand.key)
    restores.length = 0

    view.dom.dispatchEvent(new Event(eventType, { bubbles: true }))
    runFrame()

    expect(restores).toHaveLength(0)
  })

  it('skips restore when the document changes without user input', async () => {
    const { editor, view, restores } = await createEditor('* one\n* two')
    runFrame()
    setCaret(view, findTextEnd(view, 'two'))
    editor.ctx.get(commandsCtx).call(splitListItemCommand.key)
    restores.length = 0

    view.dispatch(view.state.tr.insertText('after'))
    runFrame()
    view.dispatch(view.state.tr.insertText('!'))

    expect(restores).toHaveLength(0)
    expect(view.state.doc.lastChild?.lastChild?.textContent).toBe('after!')
  })

  it('still restores when Enter runs with no subsequent input', async () => {
    const { editor, view, restores } = await createEditor('* one\n* two')
    runFrame()
    setCaret(view, findTextEnd(view, 'two'))
    editor.ctx.get(commandsCtx).call(splitListItemCommand.key)
    const targetHead = view.state.selection.head
    restores.length = 0

    runFrame()

    expect(restores).toHaveLength(1)
    expect(view.state.selection.head).toBe(targetHead)
  })

  it('keeps the restore when a window capture keydown mounts the item', async () => {
    const { editor, view, restores } = await createEditor('* one\n* two')
    runFrame()
    setCaret(view, findTextEnd(view, 'two'))
    restores.length = 0

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key !== 'F2') return
      e.preventDefault()
      editor.ctx.get(commandsCtx).call(splitListItemCommand.key)
    }
    window.addEventListener('keydown', onKeydown, { capture: true })
    try {
      view.dom.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'F2', bubbles: true })
      )
    } finally {
      window.removeEventListener('keydown', onKeydown, { capture: true })
    }
    restores.length = 0
    runFrame()

    expect(restores).toHaveLength(1)
  })

  it('keeps the restore when a button pointerdown mounts the item', async () => {
    const { editor, view, restores } = await createEditor('* one\n* two')
    runFrame()
    setCaret(view, findTextEnd(view, 'two'))

    const button = document.createElement('button')
    document.body.appendChild(button)
    cleanupNodes.push(button)
    button.addEventListener('pointerdown', (e) => {
      e.preventDefault()
      editor.ctx.get(commandsCtx).call(splitListItemCommand.key)
    })
    restores.length = 0

    button.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    restores.length = 0
    runFrame()

    expect(restores).toHaveLength(1)
  })

  it('cleans up listeners and frame on destroy, cancel, and flush', async () => {
    const activeListeners = new Map<
      string,
      Set<EventListenerOrEventListenerObject>
    >()
    const origAdd = window.addEventListener.bind(window)
    const origRemove = window.removeEventListener.bind(window)
    vi.spyOn(window, 'addEventListener').mockImplementation(
      (type, fn, opts) => {
        let set = activeListeners.get(type)
        if (!set) {
          set = new Set()
          activeListeners.set(type, set)
        }
        if (fn) set.add(fn)
        return origAdd(type, fn, opts)
      }
    )
    vi.spyOn(window, 'removeEventListener').mockImplementation(
      (type, fn, opts) => {
        if (fn) activeListeners.get(type)?.delete(fn)
        return origRemove(type, fn, opts)
      }
    )

    const countTracked = () =>
      [
        'keydown',
        'pointerdown',
        'beforeinput',
        'input',
        'paste',
        'cut',
        'drop',
        'compositionstart',
      ].reduce((sum, type) => sum + (activeListeners.get(type)?.size ?? 0), 0)

    const { editor: firstEditor } = await createEditor('* one\n* two')
    expect(frames.size).toBe(1)
    expect(countTracked()).toBeGreaterThan(0)
    await firstEditor.destroy()
    expect(frames.size).toBe(0)
    expect(countTracked()).toBe(0)

    const { editor, view, restores } = await createEditor('* one\n* two')
    runFrame()
    expect(countTracked()).toBe(0)

    setCaret(view, findTextEnd(view, 'two'))
    editor.ctx.get(commandsCtx).call(splitListItemCommand.key)
    expect(frames.size).toBe(1)
    expect(countTracked()).toBeGreaterThan(0)

    view.dom.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'a', bubbles: true })
    )
    expect(frames.size).toBe(0)
    expect(countTracked()).toBe(0)

    // Scheduling again in the same frame after a cancel still restores.
    setCaret(view, findTextEnd(view, 'one'))
    editor.ctx.get(commandsCtx).call(splitListItemCommand.key)
    restores.length = 0
    expect(frames.size).toBe(1)
    runFrame()
    expect(restores).toHaveLength(1)
    expect(countTracked()).toBe(0)
  })

  it('cancels on non-composed input events inside a ShadowRoot', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    cleanupNodes.push(host)
    const shadowRoot = host.attachShadow({ mode: 'open' })

    const { editor, view, restores } = await createEditor('* one\n* two', {
      root: shadowRoot,
    })
    runFrame()
    setCaret(view, findTextEnd(view, 'two'))
    editor.ctx.get(commandsCtx).call(splitListItemCommand.key)
    restores.length = 0

    view.dom.dispatchEvent(
      new Event('beforeinput', { bubbles: true, composed: false })
    )
    runFrame()

    expect(restores).toHaveLength(0)
  })
})
