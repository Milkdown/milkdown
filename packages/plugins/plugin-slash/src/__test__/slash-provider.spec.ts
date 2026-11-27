import type { EditorView } from '@milkdown/prose/view'

import { Schema } from '@milkdown/prose/model'
import { EditorState, TextSelection } from '@milkdown/prose/state'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SlashProvider, type SlashProviderOptions } from '../slash-provider'

const schema = new Schema({
  nodes: {
    doc: { content: 'paragraph+' },
    paragraph: { content: 'text*', toDOM: () => ['p', 0] },
    text: {},
  },
})

// Each position gets its own coordinates, so the tests can tell where the
// slash was placed.
function fakeView(state: EditorState, parent: HTMLElement) {
  const dom = document.createElement('div')
  parent.appendChild(dom)
  const view = {
    state,
    dom,
    composing: false,
    editable: true,
    hasFocus: () => true,
    coordsAtPos: (pos: number) => ({
      left: pos * 10,
      right: pos * 10,
      top: 0,
      bottom: 0,
    }),
  }
  return view as typeof view & EditorView
}

// A doc with one paragraph per text, and the cursor at the end of the last.
function createState(...texts: string[]) {
  const state = EditorState.create({
    schema,
    doc: schema.node(
      'doc',
      null,
      texts.map((text) =>
        schema.node('paragraph', null, text ? [schema.text(text)] : [])
      )
    ),
  })
  const end = state.doc.content.size - 1
  return state.apply(
    state.tr.setSelection(TextSelection.create(state.doc, end))
  )
}

let root: HTMLElement
let providers: SlashProvider[]
beforeEach(() => {
  vi.useFakeTimers()
  root = document.createElement('div')
  document.body.appendChild(root)
  providers = []
})
afterEach(() => {
  providers.forEach((provider) => provider.destroy())
  vi.useRealTimers()
  root.remove()
})

function setup(options: Partial<SlashProviderOptions> = {}) {
  const content = document.createElement('div')
  const provider = new SlashProvider({
    content,
    debounce: 20,
    root,
    ...options,
  })
  providers.push(provider)
  const view = fakeView(createState('a'), root)
  // Apply a transaction to the view and report it, like a plugin view does.
  const dispatch = (
    build: (state: EditorState) => EditorState['tr'] = (state) => state.tr
  ) => {
    const prev = view.state
    view.state = prev.apply(build(prev))
    provider.update(view, prev)
  }
  const type = (text: string) => dispatch((state) => state.tr.insertText(text))
  return { content, provider, view, dispatch, type }
}

// `computePosition` resolves in a promise chain.
async function flushPosition() {
  await vi.advanceTimersByTimeAsync(0)
}

describe('SlashProvider', () => {
  it('shows when the trigger is typed', () => {
    const { content, type } = setup()

    type('/')
    vi.advanceTimersByTime(20)
    expect(content.dataset.show).toBe('true')
  })

  // A queued update must not show the slash again after `hide()`, for
  // example when Escape is pressed right after typing.
  it('stays hidden when hide() runs inside the debounce window', () => {
    const { content, provider, type } = setup()

    type('/')
    vi.advanceTimersByTime(10)
    provider.hide()
    expect(content.dataset.show).toBe('false')

    vi.advanceTimersByTime(100)
    expect(content.dataset.show).toBe('false')
  })

  // `hide()` dismisses the slash for the current doc and selection only,
  // also when it discards the update that would have shown the slash.
  it('stays hidden on a no-op transaction after hide(), shows on a change', () => {
    const { content, provider, dispatch, type } = setup()

    type('/')
    vi.advanceTimersByTime(10)
    provider.hide()

    dispatch((state) => state.tr.setMeta('noop', true))
    vi.advanceTimersByTime(20)
    expect(content.dataset.show).toBe('false')

    type(' /')
    vi.advanceTimersByTime(20)
    expect(content.dataset.show).toBe('true')
  })

  // The debounced call carries only the last `prevState`. A no-op
  // transaction in the window must not hide the trigger typed before it.
  it('shows when a no-op transaction follows the trigger', () => {
    const { content, dispatch, type } = setup()

    type('/')
    vi.advanceTimersByTime(10)
    dispatch((state) => state.tr.setMeta('noop', true))

    vi.advanceTimersByTime(20)
    expect(content.dataset.show).toBe('true')
  })

  // The element is mounted by the first debounced update. `hide()` can
  // discard that update, so `show()` must mount the element itself.
  it('mounts the element on show() after hide() discarded the first update', () => {
    const { content, provider, view } = setup()

    provider.update(view)
    provider.hide()
    vi.advanceTimersByTime(100)

    provider.show()
    expect(content.parentElement).toBe(root)
    expect(content.dataset.show).toBe('true')
  })

  it('places the slash at the current selection on show()', async () => {
    const { content, provider, dispatch, type } = setup()

    type('/')
    vi.advanceTimersByTime(20)
    await flushPosition()
    expect(content.style.left).toBe('30px')

    // Add a new paragraph and open the slash there, as Crepe's block
    // handle does, while the update for that transaction is still queued.
    dispatch((state) => {
      const pos = state.doc.content.size
      const tr = state.tr.insert(pos, schema.node('paragraph'))
      return tr.setSelection(TextSelection.create(tr.doc, pos + 1))
    })
    provider.hide()
    provider.show()
    await flushPosition()
    expect(content.dataset.show).toBe('true')
    expect(content.style.left).toBe('50px')
  })

  it('calls onHide only when the slash goes from shown to hidden', () => {
    const { provider, type } = setup()
    const onHide = vi.fn()
    provider.onHide = onHide

    type('/')
    vi.advanceTimersByTime(20)
    type('h')
    vi.advanceTimersByTime(20)
    type('e')
    vi.advanceTimersByTime(20)
    provider.hide()
    expect(onHide).toHaveBeenCalledTimes(1)
  })

  // An update queued while `shouldShow` runs belongs to a newer state, and
  // the update in progress must not cancel it.
  it('keeps an update queued from inside shouldShow', () => {
    let reentered = false
    const { content, provider, view } = setup({
      shouldShow(this: SlashProvider, view) {
        if (!reentered) {
          reentered = true
          const prev = view.state
          view.state = prev.apply(prev.tr.insertText('/'))
          this.update(view, prev)
          return false
        }
        return this.getContent(view)?.endsWith('/') ?? false
      },
    })

    provider.update(view)
    vi.advanceTimersByTime(20)
    expect(content.dataset.show).toBe('false')

    vi.advanceTimersByTime(20)
    expect(content.dataset.show).toBe('true')
  })
})
