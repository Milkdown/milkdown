import type { EditorView } from '@milkdown/prose/view'

import { Schema } from '@milkdown/prose/model'
import { EditorState, TextSelection } from '@milkdown/prose/state'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SlashProvider } from '../slash-provider'

const schema = new Schema({
  nodes: {
    doc: { content: 'paragraph+' },
    paragraph: { content: 'text*', toDOM: () => ['p', 0] },
    text: {},
  },
})

function fakeView(state: EditorState, parent: HTMLElement) {
  const dom = document.createElement('div')
  parent.appendChild(dom)
  const view = {
    state,
    dom,
    composing: false,
    editable: true,
    hasFocus: () => true,
    coordsAtPos: () => ({ left: 0, right: 0, top: 0, bottom: 0 }),
  }
  return view as typeof view & EditorView
}

function slashState() {
  const empty = EditorState.create({
    schema,
    doc: schema.node('doc', null, [
      schema.node('paragraph', null, [schema.text('/h')]),
    ]),
  })
  return empty.apply(empty.tr.setSelection(TextSelection.create(empty.doc, 3)))
}

let root: HTMLElement
beforeEach(() => {
  vi.useFakeTimers()
  root = document.createElement('div')
  document.body.appendChild(root)
})
afterEach(() => {
  vi.useRealTimers()
  root.remove()
})

describe('SlashProvider', () => {
  function setup() {
    const content = document.createElement('div')
    const provider = new SlashProvider({
      content,
      debounce: 20,
      root,
      shouldShow: () => true,
    })
    const state = slashState()
    const view = fakeView(state, root)
    const touch = () => {
      const prev = view.state
      view.state = prev.apply(prev.tr.insertText('x'))
      provider.update(view, prev)
    }
    return { content, provider, view, touch }
  }

  // A queued update must not show the menu again after `hide()`.
  it('stays hidden when hide() runs inside the debounce window', () => {
    const { content, provider, touch } = setup()

    touch()
    vi.advanceTimersByTime(20)
    expect(content.dataset.show).toBe('true')

    touch()
    vi.advanceTimersByTime(10)
    provider.hide()
    expect(content.dataset.show).toBe('false')

    vi.advanceTimersByTime(100)
    expect(content.dataset.show).toBe('false')
  })

  it('shows again when update() runs after hide()', () => {
    const { content, provider, touch } = setup()

    touch()
    vi.advanceTimersByTime(20)
    provider.hide()

    touch()
    vi.advanceTimersByTime(20)
    expect(content.dataset.show).toBe('true')
  })
})
