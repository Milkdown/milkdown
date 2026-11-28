import type { Ctx } from '@milkdown/ctx'

import { editorViewCtx } from '@milkdown/core'
import { Schema } from '@milkdown/prose/model'
import { EditorState, NodeSelection } from '@milkdown/prose/state'
import { EditorView } from '@milkdown/prose/view'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ActiveNode } from '../types'

import { blockConfig, defaultNodeFilter } from '../block-config'
import { blockServiceInstance } from '../block-plugin'
import { BlockProvider } from '../block-provider'
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

// "first" is at 0 and "second" at 7. Inserting "inserted" above moves
// "first" to 10.
const FIRST = 0
const SECOND = 7
const FIRST_MOVED = 10

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

let view: EditorView
let place: HTMLElement
let service: BlockService
// What `posAtCoords` finds under the resting pointer. JSDOM cannot hit-test.
let under: null | number

function createCtx() {
  return {
    get: (slice: unknown) => {
      if (slice === editorViewCtx) return view
      if (slice === blockConfig.key) return { filterNodes: defaultNodeFilter }
      if (slice === blockServiceInstance.key) return service
      throw new Error('unexpected slice')
    },
  } as unknown as Ctx
}

// Rest the pointer on the editor, over "second".
function hover() {
  view.dom.dispatchEvent(new MouseEvent('pointermove', { clientY: 0 }))
  service.mousemoveCallback(view, { clientY: 0 } as MouseEvent)
}

// Another editor inserts a paragraph above: "second" moves away, and
// "first" is under the pointer now.
function insertAbove() {
  view.dispatch(view.state.tr.insert(0, paragraph('inserted')))
  under = FIRST_MOVED
}

beforeEach(() => {
  place = document.body.appendChild(document.createElement('div'))
  view = new EditorView(place, {
    state: EditorState.create({
      doc: schema.nodes.doc!.create(null, [
        paragraph('first'),
        paragraph('second'),
      ]),
    }),
  })
  service = new BlockService()

  vi.spyOn(document, 'elementFromPoint').mockImplementation(() => view.dom)
  under = SECOND
  view.posAtCoords = () =>
    under === null ? null : { pos: under + 1, inside: under, affinity: 0 }
})

afterEach(() => {
  view.destroy()
  place.remove()
  vi.restoreAllMocks()
})

describe('block service without a pointer move', () => {
  let handle: HTMLElement
  let shown: ActiveNode | null

  beforeEach(() => {
    service.bind(
      createCtx(),
      (message) => (shown = message.type === 'show' ? message.active : null)
    )
    handle = document.body.appendChild(document.createElement('div'))
    service.addEvent(handle)
    hover()
  })

  afterEach(() => {
    service.unBind()
    service.removeEvent(handle)
    handle.remove()
  })

  it('looks for the block again on the next frame after a change', async () => {
    insertAbove()
    service.refresh()
    await nextFrame()

    expect(shown?.$pos.pos).toBe(FIRST_MOVED)
  })

  it('looks for the block again on the next frame when the blocks move', async () => {
    under = FIRST
    service.relocate()
    await nextFrame()

    expect(shown?.node.textContent).toBe('first')
  })

  it('selects by the current document on mousedown', () => {
    insertAbove()
    handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

    const { selection } = view.state
    expect(selection).toBeInstanceOf(NodeSelection)
    expect((selection as NodeSelection).node.textContent).toBe('first')
  })

  it('shows the handle again when a block moves under the pointer', async () => {
    under = null
    service.relocate()
    await nextFrame()
    expect(shown).toBeNull()

    under = FIRST
    service.relocate()
    await nextFrame()
    expect(shown?.node.textContent).toBe('first')
  })

  it('keeps a handle that keydown hid hidden', async () => {
    insertAbove()
    service.refresh()
    service.keydownCallback(view)
    await nextFrame()

    expect(shown).toBeNull()
  })

  it('does not follow a pointer that left the editor', async () => {
    view.dom.dispatchEvent(new MouseEvent('pointerleave'))
    under = FIRST
    service.relocate()
    await nextFrame()

    expect(shown?.node.textContent).toBe('second')
  })

  it('does not follow the pointer during a drag', async () => {
    handle.dispatchEvent(new Event('dragstart'))
    under = FIRST
    service.relocate()
    await nextFrame()

    expect(shown?.node.textContent).toBe('second')
  })
})

describe('block provider without a pointer move', () => {
  let content: HTMLElement
  let provider: BlockProvider

  beforeEach(async () => {
    content = document.createElement('div')
    provider = new BlockProvider({ ctx: createCtx(), content })
    provider.update()
    await nextFrame()
    hover()
    // Showing the handle positions it asynchronously.
    await nextFrame()
  })

  afterEach(() => {
    provider.destroy()
  })

  it('gives the active node from the current document', () => {
    insertAbove()

    const active = provider.active
    expect(active?.node.textContent).toBe('first')
    expect(active?.$pos.doc).toBe(view.state.doc)
  })

  it('gives no active node from an older document once the pointer left', () => {
    view.dom.dispatchEvent(new MouseEvent('pointerleave'))
    insertAbove()

    expect(provider.active).toBeNull()
  })

  it('keeps a handle that hide hid hidden', async () => {
    // Like the add button: change the document, then hide the handle.
    insertAbove()
    provider.update()
    provider.hide()
    await nextFrame()
    await nextFrame()

    expect(content.dataset.show).toBe('false')
  })

  it('looks for the block again on scroll', async () => {
    under = FIRST
    window.dispatchEvent(new Event('scroll'))
    await nextFrame()

    expect(provider.active?.node.textContent).toBe('first')
  })
})
