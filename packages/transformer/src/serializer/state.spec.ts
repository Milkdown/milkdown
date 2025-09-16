import type { Mark, Schema } from '@milkdown/prose/model'

import { describe, expect, it } from 'vitest'

import { SerializerState } from './state'

const boldMark = {
  isInSet: (arr: string[]) => arr.includes('bold'),
  addToSet: (arr: string[]) => arr.concat('bold'),
  type: {
    removeFromSet: (arr: string[]) => arr.filter((x) => x !== 'bold'),
  },
} as unknown as Mark

const italicMark = {
  isInSet: (arr: string[]) => arr.includes('italic'),
  addToSet: (arr: string[]) => arr.concat('italic'),
  type: {
    removeFromSet: (arr: string[]) => arr.filter((x) => x !== 'italic'),
  },
} as unknown as Mark

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
  },
  marks: {},
  text: (text: string, marks: string[]) => ({ text, marks, isText: true }),
} as unknown as Schema

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
})
