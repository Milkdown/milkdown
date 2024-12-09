import type { MarkType, NodeType, Schema } from '@milkdown/prose/model'
import { describe, expect, it, vi } from 'vitest'
import { ParserState } from './state'

const docNodeType = {
  createAndFill: vi.fn().mockImplementation((attrs, content, marks) => ({
    name: 'docNode',
    content,
    attrs,
    marks,
  })),
} as unknown as NodeType
const paragraphNodeType = {
  createAndFill: vi.fn().mockImplementation((attrs, content, marks) => ({
    name: 'paragraphNode',
    content,
    attrs,
    marks,
  })),
} as unknown as NodeType
const blockquoteNodeType = {
  createAndFill: vi.fn().mockImplementation((attrs, content, marks) => ({
    name: 'blockquoteNode',
    content,
    attrs,
    marks,
  })),
} as unknown as NodeType
const boldType = {
  create: vi.fn().mockImplementation((attrs) => ({
    name: 'boldMark',
    attrs,
    addToSet: (arr) => arr.concat('bold'),
    removeFromSet: (arr) => arr.filter((x) => x !== 'bold'),
  })),
  addToSet: (arr) => arr.concat('bold'),
  removeFromSet: (arr) => arr.filter((x) => x !== 'bold'),
} as unknown as MarkType

const schema = {
  nodes: {
    paragraph: {
      spec: {
        parseMarkdown: {
          match: (node) => node.type === 'paragraphNode',
          runner: (state, node) => {
            state.addText(node.value)
          },
        },
      },
    },
    blockquote: {
      spec: {
        parseMarkdown: {
          match: (node) => node.type === 'blockquoteNode',
          runner: (state, node) => {
            state.openNode(blockquoteNodeType)
            state.next(node.children)
            state.closeNode()
          },
        },
      },
    },
  },
  text: (text, marks) => ({ text, marks, isText: true }),
} as unknown as Schema

describe('parser-state', () => {
  it('node', () => {
    const state = new ParserState(schema)
    state.openNode(docNodeType)

    state
      .openNode(blockquoteNodeType, { id: 'blockquote' })
      .addNode(paragraphNodeType, { id: 1 })
      .addNode(paragraphNodeType, { id: 2 })
      .closeNode()

    expect(state.top()).toMatchObject({
      content: [
        {
          name: 'blockquoteNode',
          content: [
            {
              name: 'paragraphNode',
              attrs: {
                id: 1,
              },
            },
            {
              name: 'paragraphNode',
              attrs: {
                id: 2,
              },
            },
          ],
        },
      ],
    })
  })

  it('mark', () => {
    const state = new ParserState(schema)
    state.openNode(docNodeType)
    state.openMark(boldType).addNode(paragraphNodeType).closeMark(boldType)

    expect(state.top()).toMatchObject({
      content: [
        {
          name: 'paragraphNode',
          marks: ['bold'],
        },
      ],
    })
  })

  it('merge text for no mark', () => {
    const state = new ParserState(schema)
    state.openNode(docNodeType)

    state
      .openNode(paragraphNodeType)
      .addText('The lunatic is on the grass.\n')
      .addText("I'll see you on the dark side of the moon.")
      .closeNode()

    expect(state.top()).toMatchObject({
      content: [
        {
          name: 'paragraphNode',
          content: [
            {
              text: "The lunatic is on the grass.\nI'll see you on the dark side of the moon.",
            },
          ],
        },
      ],
    })
  })

  it('merge text for same mark', () => {
    const state = new ParserState(schema)
    state.openNode(docNodeType)

    state
      .openNode(paragraphNodeType)
      .openMark(boldType)
      .addText('The lunatic is on the grass.\n')
      .addText("I'll see you on the dark side of the moon.")
      .closeMark(boldType)
      .closeNode()

    expect(state.top()).toMatchObject({
      content: [
        {
          name: 'paragraphNode',
          content: [
            {
              text: "The lunatic is on the grass.\nI'll see you on the dark side of the moon.",
            },
          ],
        },
      ],
    })
  })

  it('not merge text for different marks', () => {
    const state = new ParserState(schema)
    state.openNode(docNodeType)

    state
      .openNode(paragraphNodeType)
      .openMark(boldType)
      .addText('The lunatic is on the grass.\n')
      .closeMark(boldType)
      .addText("I'll see you on the dark side of the moon.")
      .closeNode()

    expect(state.top()).toMatchObject({
      content: [
        {
          name: 'paragraphNode',
          content: [
            {
              text: 'The lunatic is on the grass.\n',
            },
            {
              text: "I'll see you on the dark side of the moon.",
            },
          ],
        },
      ],
    })
  })

  it('build', () => {
    const state = new ParserState(schema)
    state.openNode(docNodeType)

    state
      .openNode(blockquoteNodeType, { id: 'blockquote' })
      .addNode(paragraphNodeType, { id: 1 })
      .addNode(paragraphNodeType, { id: 2 })
      .closeNode()

    const node = state.build()
    expect(node).toMatchObject({
      name: 'docNode',
      content: [
        {
          name: 'blockquoteNode',
          content: [
            {
              name: 'paragraphNode',
              attrs: {
                id: 1,
              },
            },
            {
              name: 'paragraphNode',
              attrs: {
                id: 2,
              },
            },
          ],
        },
      ],
    })
  })

  it('next', () => {
    const state = new ParserState(schema)
    state.openNode(docNodeType)
    state.next([
      {
        type: 'blockquoteNode',
        children: [
          {
            type: 'paragraphNode',
            value: 'The lunatic is on the grass.',
          },
        ],
      },
    ])

    const node = state.build()
    expect(node).toMatchObject({
      name: 'docNode',
      content: [
        {
          name: 'blockquoteNode',
          content: [
            {
              text: 'The lunatic is on the grass.',
            },
          ],
        },
      ],
    })
  })
})
