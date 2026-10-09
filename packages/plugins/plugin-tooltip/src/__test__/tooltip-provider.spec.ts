import type { EditorView } from '@milkdown/prose/view'

import { Schema } from '@milkdown/prose/model'
import { EditorState, TextSelection } from '@milkdown/prose/state'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TooltipProvider } from '../tooltip-provider'

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

describe('TooltipProvider', () => {
  // A trailing throttled call carries only the last `prevState`. A no-op
  // transaction after a hiding update must not keep the tooltip on screen.
  it('hides when a no-op transaction follows a hiding update', () => {
    const content = document.createElement('div')
    const provider = new TooltipProvider({ content, debounce: 20, root })
    const empty = EditorState.create({
      schema,
      doc: schema.node('doc', null, [
        schema.node('paragraph', null, [schema.text('hello world')]),
      ]),
    })
    const selected = empty.apply(
      empty.tr.setSelection(TextSelection.create(empty.doc, 1, 6))
    )
    const view = fakeView(selected, root)

    provider.update(view, empty)
    expect(content.dataset.show).toBe('true')

    vi.advanceTimersByTime(100)
    const touched = selected.apply(selected.tr.setMeta('touch', true))
    view.state = touched
    provider.update(view, selected)

    vi.advanceTimersByTime(5)
    const cleared = touched.apply(
      touched.tr.setSelection(TextSelection.create(touched.doc, 1))
    )
    view.state = cleared
    provider.update(view, touched)

    vi.advanceTimersByTime(5)
    const noop = cleared.apply(cleared.tr.setMeta('noop', true))
    view.state = noop
    provider.update(view, cleared)

    vi.advanceTimersByTime(50)
    expect(content.dataset.show).toBe('false')
  })
})
