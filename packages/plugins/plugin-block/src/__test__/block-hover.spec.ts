import type { Ctx } from '@milkdown/ctx'

import { editorViewCtx } from '@milkdown/core'
import { Schema } from '@milkdown/prose/model'
import { EditorState, NodeSelection } from '@milkdown/prose/state'
import { EditorView } from '@milkdown/prose/view'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import type { ActiveNode } from '../types'

import { blockConfig, defaultNodeFilter } from '../block-config'
import { BlockService } from '../block-service'

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { group: 'block', content: 'inline*', toDOM: () => ['p', 0] },
    text: { group: 'inline' },
  },
})

const paragraph = (text: string) =>
  schema.nodes.paragraph!.create(null, schema.text(text))

// "second" is at 7. Inserting "inserted" above moves "first" from 0 to 10.
const SECOND = 7
const FIRST_MOVED = 10

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

describe('block handle without a pointer move', () => {
  let view: EditorView
  let service: BlockService
  let handle: HTMLElement
  let shown: ActiveNode | null
  // What `posAtCoords` finds under the resting pointer.
  let under: number

  beforeEach(() => {
    view = new EditorView(
      document.body.appendChild(document.createElement('div')),
      {
        state: EditorState.create({
          doc: schema.nodes.doc!.create(null, [
            paragraph('first'),
            paragraph('second'),
          ]),
        }),
      }
    )
    service = new BlockService()
    service.bind(
      {
        get: (slice: unknown) => {
          if (slice === editorViewCtx) return view
          if (slice === blockConfig.key)
            return { filterNodes: defaultNodeFilter }
          throw new Error('unexpected slice')
        },
      } as unknown as Ctx,
      (message) => (shown = message.type === 'show' ? message.active : null)
    )
    handle = document.body.appendChild(document.createElement('div'))
    service.addEvent(handle)

    // JSDOM cannot hit-test.
    document.elementFromPoint = () => view.dom
    under = SECOND
    view.posAtCoords = () => ({ pos: under + 1, inside: under })

    window.dispatchEvent(new MouseEvent('pointermove', { clientY: 0 }))
    service.mousemoveCallback(view, { clientY: 0 } as MouseEvent)
    // Another editor inserts a paragraph above: "second" moves away, and
    // "first" is under the pointer now.
    view.dispatch(view.state.tr.insert(0, paragraph('inserted')))
    under = FIRST_MOVED
  })

  afterEach(() => {
    service.unBind()
    service.removeEvent(handle)
    view.destroy()
    handle.remove()
  })

  it('looks for the block again on the next frame after a change', async () => {
    service.refresh()
    await nextFrame()

    expect(shown?.$pos.pos).toBe(FIRST_MOVED)
  })

  it('selects by the current document on mousedown', () => {
    handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

    const { selection } = view.state
    expect(selection).toBeInstanceOf(NodeSelection)
    expect((selection as NodeSelection).node.textContent).toBe('first')
  })

  it('looks for the block again on scroll', async () => {
    window.dispatchEvent(new Event('scroll'))
    await nextFrame()

    expect(shown?.node.textContent).toBe('first')
  })

  it('keeps a handle that keydown hid hidden', async () => {
    service.keydownCallback(view)
    service.refresh()
    await nextFrame()

    expect(shown).toBeNull()
  })
})
