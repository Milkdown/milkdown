import type { Ctx } from '@milkdown/ctx'

import { editorViewCtx } from '@milkdown/core'
import { Schema } from '@milkdown/prose/model'
import { EditorState, NodeSelection } from '@milkdown/prose/state'
import { EditorView } from '@milkdown/prose/view'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import type { BlockServiceMessageType } from '../block-service'

import { blockConfig, defaultNodeFilter } from '../block-config'
import { BlockService } from '../block-service'

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { group: 'block', content: 'inline*', toDOM: () => ['p', 0] },
    text: { group: 'inline' },
  },
})

function paragraph(text: string) {
  return schema.nodes.paragraph!.create(null, schema.text(text))
}

// "first" spans 0 to 7 and "second" spans 7 to 15.
const SECOND = 7

function nextFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
}

function setRect(el: Element, rect: Partial<DOMRect>) {
  const full = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...rect,
  }
  Object.defineProperty(el, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({ ...full, toJSON: () => full }),
  })
}

describe('block hover', () => {
  let view: EditorView
  let service: BlockService
  let handle: HTMLElement
  let place: HTMLElement
  let messages: BlockServiceMessageType[]
  // The `left` of every `posAtCoords` call.
  let lefts: number[]
  // What `posAtCoords` finds at a `left`. The default is the second paragraph.
  let hit: (left: number) => number | null

  beforeEach(() => {
    place = document.createElement('div')
    document.body.appendChild(place)
    view = new EditorView(place, {
      state: EditorState.create({
        doc: schema.nodes.doc!.create(null, [
          paragraph('first'),
          paragraph('second'),
        ]),
      }),
    })
    // A 400px wide editor with its content from x = 20 to 380. Its middle is
    // at x = 200.
    setRect(view.dom, { left: 0, right: 400, width: 400, bottom: 100 })
    view.dom.style.padding = '0 20px'

    messages = []
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
      (message) => messages.push(message)
    )

    handle = document.createElement('div')
    document.body.appendChild(handle)
    service.addEvent(handle)

    // JSDOM cannot hit-test.
    document.elementFromPoint = () => view.dom
    lefts = []
    hit = () => SECOND
    view.posAtCoords = ({ left }) => {
      lefts.push(left)
      const inside = hit(left)
      return inside == null ? null : { pos: inside + 1, inside }
    }
  })

  afterEach(() => {
    service.unBind()
    service.removeEvent(handle)
    view.destroy()
    handle.remove()
    place.remove()
  })

  function lastShown() {
    const last = messages.at(-1)
    return last?.type === 'show' ? last.active : null
  }

  function selectByHandle() {
    handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    const { selection } = view.state
    expect(selection).toBeInstanceOf(NodeSelection)
    return selection as NodeSelection
  }

  it('looks for the block at the pointer, not at the middle', () => {
    service.mousemoveCallback(view, { clientX: 50, clientY: 10 } as MouseEvent)

    expect(lefts).toEqual([50])
    expect(lastShown()?.$pos.pos).toBe(SECOND)
  })

  it('looks at the middle when nothing is at the pointer', () => {
    hit = (left) => (left === 200 ? SECOND : null)
    service.mousemoveCallback(view, { clientX: 50, clientY: 10 } as MouseEvent)

    expect(lefts).toEqual([50, 200])
    expect(lastShown()?.$pos.pos).toBe(SECOND)
  })

  it('keeps the pointer inside the editor', () => {
    service.mousemoveCallback(view, { clientX: 5, clientY: 10 } as MouseEvent)

    expect(lefts).toEqual([21])
  })

  describe('when the document changes under a resting pointer', () => {
    // An inserted paragraph moves "second" from 7 to 7 + 13.
    const MOVED = SECOND + 13

    beforeEach(() => {
      service.mousemoveCallback(view, {
        clientX: 50,
        clientY: 10,
      } as MouseEvent)
      view.dispatch(view.state.tr.insert(0, paragraph('inserted   ')))
      hit = () => MOVED
    })

    it('finds the block again on the next frame', async () => {
      service.refresh()
      await nextFrame()

      expect(lastShown()?.$pos.pos).toBe(MOVED)
    })

    it('selects the block at its new position on mousedown', () => {
      const selection = selectByHandle()

      expect(selection.from).toBe(MOVED)
      expect(selection.node.textContent).toBe('second')
    })
  })

  it('keeps a handle hidden by typing hidden when the document changes', async () => {
    service.mousemoveCallback(view, { clientX: 50, clientY: 10 } as MouseEvent)
    service.keydownCallback(view)
    view.dispatch(view.state.tr.insertText('x', 1))
    service.refresh()
    await nextFrame()

    expect(messages.at(-1)?.type).toBe('hide')
  })

  it('follows the active block, not the pointer, after the pointer left', async () => {
    service.mousemoveCallback(view, { clientX: 50, clientY: 10 } as MouseEvent)
    view.dom.dispatchEvent(
      new MouseEvent('pointerleave', { relatedTarget: document.body })
    )
    lefts = []
    view.dispatch(view.state.tr.insertText('x', 1))
    hit = () => SECOND + 1
    service.refresh()
    await nextFrame()

    // The point comes from the active block, which is at x = 0 in JSDOM.
    expect(lefts).toEqual([21])
    expect(lastShown()?.$pos.pos).toBe(SECOND + 1)
  })
})
