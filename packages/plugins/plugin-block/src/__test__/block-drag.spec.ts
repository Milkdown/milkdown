import type { Ctx } from '@milkdown/ctx'
import type { Node } from '@milkdown/prose/model'

import { editorViewCtx } from '@milkdown/core'
import { Schema } from '@milkdown/prose/model'
import {
  EditorState,
  NodeSelection,
  TextSelection,
} from '@milkdown/prose/state'
import { EditorView } from '@milkdown/prose/view'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { blockConfig, defaultNodeFilter } from '../block-config'
import { BlockService } from '../block-service'

// Mirrors the commonmark preset closely enough for the drag math: `list_item`
// is in its own group (not `block`), so a list item can only be dropped as a
// sibling inside a list.
const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { group: 'block', content: 'inline*', toDOM: () => ['p', 0] },
    text: { group: 'inline' },
    bullet_list: {
      group: 'block',
      content: 'listItem+',
      toDOM: () => ['ul', 0],
    },
    list_item: {
      group: 'listItem',
      content: 'paragraph block*',
      defining: true,
      toDOM: () => ['li', 0],
    },
  },
})

function listItem(text: string) {
  return schema.nodes.list_item!.create(
    null,
    schema.nodes.paragraph!.create(null, schema.text(text))
  )
}

// doc(bullet_list(li"item 1", li"item 2", li"item 3", li"item 4"))
// Every item is 10 wide, so the items start at 1, 11, 21 and 31.
function createDoc() {
  return schema.nodes.doc!.create(null, [
    schema.nodes.bullet_list!.create(null, [
      listItem('item 1'),
      listItem('item 2'),
      listItem('item 3'),
      listItem('item 4'),
    ]),
  ])
}

const SECOND_ITEM = 11
// The paragraph inside the second item, which is what `posAtCoords` resolves
// to when hovering over that item.
const SECOND_ITEM_PARAGRAPH = 12
const FOURTH_ITEM_TEXT_END = 39

function itemTexts(view: EditorView) {
  const list = view.state.doc.firstChild as Node
  return Array.from(
    { length: list.childCount },
    (_, i) => list.child(i).textContent
  )
}

function createDataTransfer() {
  return {
    effectAllowed: '',
    clearData: () => {},
    setData: () => {},
    getData: () => '',
    setDragImage: () => {},
  }
}

// JSDOM implements neither `DragEvent` nor `DataTransfer`, but prosemirror
// registers its listeners by event type, so a plain event carrying the bits
// the handlers read is enough.
function dispatchDragEvent(
  el: Element,
  type: string,
  extra: Record<string, unknown> = {}
) {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.assign(event, { dataTransfer: createDataTransfer() }, extra)
  el.dispatchEvent(event)
}

describe('block drag', () => {
  let view: EditorView
  let service: BlockService
  let handle: HTMLElement
  let place: HTMLElement

  beforeEach(() => {
    place = document.createElement('div')
    document.body.appendChild(place)
    view = new EditorView(place, {
      state: EditorState.create({ doc: createDoc() }),
    })

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
      () => {}
    )

    handle = document.createElement('div')
    document.body.appendChild(handle)
    service.addEvent(handle)

    // JSDOM cannot hit-test, so pretend the pointer is over the second item.
    document.elementFromPoint = () => view.dom
    view.posAtCoords = () => ({
      pos: SECOND_ITEM_PARAGRAPH + 1,
      inside: SECOND_ITEM_PARAGRAPH,
    })

    service.mousemoveCallback(view, { clientY: 0 } as MouseEvent)
    handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
  })

  afterEach(() => {
    service.removeEvent(handle)
    view.destroy()
    handle.remove()
    place.remove()
  })

  it('selects the whole list item on mousedown', () => {
    const { selection } = view.state
    expect(selection).toBeInstanceOf(NodeSelection)
    expect(selection.from).toBe(SECOND_ITEM)
    expect(selection.to).toBe(SECOND_ITEM + 10)
  })

  it('records the dragged node on view.dragging', () => {
    dispatchDragEvent(handle, 'dragstart')

    const { node } = (view.dragging ?? {}) as { node?: NodeSelection }
    expect(node).toBeInstanceOf(NodeSelection)
    expect(node?.node.type.name).toBe('list_item')
    expect(node?.from).toBe(SECOND_ITEM)
  })

  it('moves the item even when the selection changes mid-drag', () => {
    dispatchDragEvent(handle, 'dragstart')

    // The list item node view re-dispatches a text selection over the node
    // selection on the next frame, which used to make the drop delete only the
    // item's text and leave an empty item behind.
    const { doc } = view.state
    view.dispatch(
      view.state.tr.setSelection(
        TextSelection.between(
          doc.resolve(SECOND_ITEM),
          doc.resolve(SECOND_ITEM + 10)
        )
      )
    )
    expect(view.state.selection).toBeInstanceOf(TextSelection)

    // Drop at the end of the fourth item.
    view.posAtCoords = () => ({
      pos: FOURTH_ITEM_TEXT_END,
      inside: FOURTH_ITEM_TEXT_END - 7,
    })
    dispatchDragEvent(view.dom, 'drop', { clientX: 0, clientY: 0 })

    expect(itemTexts(view)).toEqual(['item 1', 'item 3', 'item 4', 'item 2'])
  })

  it('clears view.dragging when the drag is cancelled', async () => {
    dispatchDragEvent(handle, 'dragstart')
    expect(view.dragging).not.toBeNull()

    dispatchDragEvent(handle, 'dragend')
    await new Promise((resolve) => setTimeout(resolve, 60))

    expect(view.dragging).toBeNull()
  })
})
