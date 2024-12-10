import type { Mark, Schema } from '@milkdown/prose/model'
import { describe, expect, it } from 'vitest'
import { SerializerState } from './state'

const boldMark = {
  isInSet: (arr) => arr.includes('bold'),
  addToSet: (arr) => arr.concat('bold'),
  type: {
    removeFromSet: (arr) => arr.filter((x) => x !== 'bold'),
  },
} as unknown as Mark

const schema = {
  nodes: {
    paragraph: {
      spec: {
        toMarkdown: {
          match: (node) => node.type === 'paragraph',
          runner: (state, node) => {
            state.addNode('text', [], node.value)
          },
        },
      },
    },
    blockquote: {
      spec: {
        toMarkdown: {
          match: (node) => node.type === 'blockquote',
          runner: (state, node) => {
            state.openNode('blockquote')
            state.next(node.content)
            state.closeNode()
          },
        },
      },
    },
  },
  marks: {},
  text: (text, marks) => ({ text, marks, isText: true }),
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
})
