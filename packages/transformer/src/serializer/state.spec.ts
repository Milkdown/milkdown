import type { Fragment, Mark, Node, Schema } from '@milkdown/prose/model'

import { describe, expect, it } from 'vitest'

import { SerializerState } from './state'

const createMockMark = (name: string, priority?: number) =>
  ({
    name,
    eq: (other: { name: string }) => other.name === name,
    type: { spec: { priority } },
  }) as unknown as Mark

const boldMark = createMockMark('bold')
const italicMark = createMockMark('italic')
const inlineCodeMark = createMockMark('inlineCode', 100)

const schema = {
  nodes: {
    paragraph: {
      spec: {
        toMarkdown: {
          match: (node: { type: string }) => node.type === 'paragraph',
          runner: (state: SerializerState, node: { value: string }) => {
            state.addNode('text', [], node.value)
          },
        },
      },
    },
    blockquote: {
      spec: {
        toMarkdown: {
          match: (node: { type: string }) => node.type === 'blockquote',
          runner: (state: SerializerState, node: { content: never }) => {
            state.openNode('blockquote')
            state.next(node.content)
            state.closeNode()
          },
        },
      },
    },
    text: {
      spec: {
        toMarkdown: {
          match: (node: { type: string }) => node.type === 'text',
          runner: (state: SerializerState, node: { value: string }) => {
            state.addNode('text', undefined, node.value)
          },
        },
      },
    },
  },
  marks: {
    bold: {
      spec: {
        toMarkdown: {
          match: (mark: { name: string }) => mark.name === 'bold',
          runner: (state: SerializerState, mark: Mark) => {
            state.withMark(mark, 'bold')
          },
        },
      },
    },
    italic: {
      spec: {
        toMarkdown: {
          match: (mark: { name: string }) => mark.name === 'italic',
          runner: (state: SerializerState, mark: Mark) => {
            state.withMark(mark, 'italic')
          },
        },
      },
    },
    inlineCode: {
      spec: {
        toMarkdown: {
          match: (mark: { name: string }) => mark.name === 'inlineCode',
          runner: (state: SerializerState, mark: Mark, node: Node) => {
            state.withMark(
              mark,
              'inlineCode',
              (node as never as { value: string }).value
            )
            return true
          },
        },
      },
    },
  },
} as unknown as Schema

const text = (value: string, marks: Mark[] = []) =>
  ({ type: 'text', value, marks }) as unknown as Node

const fragment = (...nodes: Node[]) =>
  ({
    size: nodes.length,
    forEach: (fn: (node: Node, offset: number, index: number) => void) => {
      nodes.forEach((node, index) => fn(node, 0, index))
    },
    maybeChild: (index: number) => nodes[index] ?? null,
  }) as unknown as Fragment

describe('serializer-state', () => {
  it('node', () => {
    const state = new SerializerState(schema)
    state.openNode('doc')
    state.openNode('paragraph', 'paragraph node value', { foo: 'bar' })
    state.addNode('text', [], 'text node value')
    state.closeNode()

    expect(state.top()).toMatchObject({
      type: 'doc',
      children: [
        {
          type: 'paragraph',
          value: 'paragraph node value',
          children: [
            {
              type: 'text',
              value: 'text node value',
            },
          ],
        },
      ],
    })
  })

  it('maybe merge children for same mark', () => {
    const state = new SerializerState(schema)
    state.openNode('doc')
    state.openNode('paragraph')
    state.withMark(boldMark, 'bold')
    state.addNode('text', [], 'The lunatic is on the grass.')
    state.closeMark(boldMark)
    state.withMark(boldMark, 'bold')
    state.addNode('text', [], 'The lunatic is in the hell.')
    state.closeMark(boldMark)
    state.closeNode()

    expect(state.top()).toMatchObject({
      type: 'doc',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'bold',
              isMark: true,
              children: [
                {
                  type: 'text',
                  value: 'The lunatic is on the grass.',
                },
                {
                  type: 'text',
                  value: 'The lunatic is in the hell.',
                },
              ],
            },
          ],
        },
      ],
    })
  })

  it('build', () => {
    const state = new SerializerState(schema)
    state.openNode('doc')
    state.openNode('paragraph', 'paragraph node value', { foo: 'bar' })
    state.addNode('text', [], 'text node value')
    state.closeNode()

    expect(state.build()).toMatchObject({
      type: 'doc',
      children: [
        {
          type: 'paragraph',
          value: 'paragraph node value',
          children: [
            {
              type: 'text',
              value: 'text node value',
            },
          ],
        },
      ],
    })
  })

  it('next', () => {
    const state = new SerializerState(schema)
    state.openNode('doc')
    state.next({
      type: 'blockquote',
      marks: [],
      content: {
        type: 'paragraph',
        marks: [],
        value: 'The lunatic is on the grass.',
      },
    } as any)

    expect(state.build()).toMatchObject({
      type: 'doc',
      children: [
        {
          type: 'blockquote',
          children: [
            {
              type: 'text',
              value: 'The lunatic is on the grass.',
            },
          ],
        },
      ],
    })
  })

  it('trim spaces around marks', () => {
    const state = new SerializerState(schema)

    state.openNode('doc')
    state.openNode('paragraph')
    // Open a bold mark, add a text node with surrounding spaces, then close the mark
    state.withMark(boldMark, 'bold')
    state.addNode('text', [], ' hello ')
    state.closeMark(boldMark)
    state.closeNode() // close paragraph

    // Expect SerializerState to move the spaces outside of the mark node.
    expect(state.top()).toMatchObject({
      type: 'doc',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', value: ' ' },
            {
              type: 'bold',
              isMark: true,
              children: [{ type: 'text', value: 'hello' }],
            },
            { type: 'text', value: ' ' },
          ],
        },
      ],
    })
  })

  it('should not corrupt value-based marks during merge', () => {
    const state = new SerializerState(schema)

    state.openNode('doc')
    state.openNode('paragraph')
    // Simulate: inlineCode("Hello") followed by bold > inlineCode("World")
    state.withMark(inlineCodeMark, 'inlineCode', 'Hello')
    state.closeMark(inlineCodeMark)
    state.withMark(boldMark, 'bold')
    state.withMark(inlineCodeMark, 'inlineCode', 'World')
    state.closeMark(inlineCodeMark)
    state.closeMark(boldMark)
    state.closeNode()

    // The bold wrapper around inlineCode should be preserved,
    // not restructured by the merge.
    expect(state.top()).toMatchObject({
      type: 'doc',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'inlineCode',
              isMark: true,
              value: 'Hello',
            },
            {
              type: 'bold',
              isMark: true,
              children: [
                {
                  type: 'inlineCode',
                  isMark: true,
                  value: 'World',
                },
              ],
            },
          ],
        },
      ],
    })
  })

  it('try to merge marks', () => {
    const state = new SerializerState(schema)

    state.openNode('doc')
    state.openNode('paragraph')
    state.withMark(boldMark, 'bold')
    state.withMark(italicMark, 'italic')
    state.addNode('text', [], 'hello')
    state.closeMark(italicMark)
    state.addNode('text', [], 'world')
    state.closeMark(boldMark)
    state.closeNode()

    expect(state.top()).toMatchObject({
      type: 'doc',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'bold',
              isMark: true,
              children: [
                {
                  type: 'italic',
                  isMark: true,
                  children: [{ type: 'text', value: 'hello' }],
                },
                { type: 'text', value: 'world' },
              ],
            },
          ],
        },
      ],
    })
  })

  it('keeps a mark open across nodes that share it', () => {
    const state = new SerializerState(schema)

    // **a *b* c** — the strong mark spans all three text nodes.
    state.openNode('doc')
    state.openNode('paragraph')
    state.next(
      fragment(
        text('a ', [boldMark]),
        text('b', [boldMark, italicMark]),
        text(' c', [boldMark])
      )
    )
    state.closeNode()

    expect(state.top()).toMatchObject({
      type: 'doc',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'bold',
              isMark: true,
              children: [
                { type: 'text', value: 'a ' },
                {
                  type: 'italic',
                  isMark: true,
                  children: [{ type: 'text', value: 'b' }],
                },
                { type: 'text', value: ' c' },
              ],
            },
          ],
        },
      ],
    })
  })

  it('keeps continuing marks outside of newly opened marks', () => {
    const state = new SerializerState(schema)

    // *a **b** c* — the italic mark opens first and must stay the
    // outer mark when bold opens on the second text node, even if the
    // mark set of that node lists bold first.
    state.openNode('doc')
    state.openNode('paragraph')
    state.next(
      fragment(
        text('a ', [italicMark]),
        text('b', [boldMark, italicMark]),
        text(' c', [italicMark])
      )
    )
    state.closeNode()

    expect(state.top()).toMatchObject({
      type: 'doc',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'italic',
              isMark: true,
              children: [
                { type: 'text', value: 'a ' },
                {
                  type: 'bold',
                  isMark: true,
                  children: [{ type: 'text', value: 'b' }],
                },
                { type: 'text', value: ' c' },
              ],
            },
          ],
        },
      ],
    })
  })

  it('closes value-based marks after the node that carries them', () => {
    const state = new SerializerState(schema)

    // **`code` b** — inlineCode holds its content as a value and must not
    // stay open, while the bold mark spans both text nodes.
    state.openNode('doc')
    state.openNode('paragraph')
    state.next(
      fragment(text('code', [boldMark, inlineCodeMark]), text(' b', [boldMark]))
    )
    state.closeNode()

    expect(state.top()).toMatchObject({
      type: 'doc',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'bold',
              isMark: true,
              children: [
                {
                  type: 'inlineCode',
                  isMark: true,
                  value: 'code',
                },
                { type: 'text', value: ' b' },
              ],
            },
          ],
        },
      ],
    })
  })

  it('does not trim spaces inside a mark spanning multiple nodes', () => {
    const state = new SerializerState(schema)

    // **a *b*** — the space between "a" and the italic node is internal
    // and must be preserved when the bold mark closes.
    state.openNode('doc')
    state.openNode('paragraph')
    state.next(
      fragment(text('a ', [boldMark]), text('b', [boldMark, italicMark]))
    )
    state.closeNode()

    expect(state.top()).toMatchObject({
      type: 'doc',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'bold',
              isMark: true,
              children: [
                { type: 'text', value: 'a ' },
                {
                  type: 'italic',
                  isMark: true,
                  children: [{ type: 'text', value: 'b' }],
                },
              ],
            },
          ],
        },
      ],
    })
  })
})
