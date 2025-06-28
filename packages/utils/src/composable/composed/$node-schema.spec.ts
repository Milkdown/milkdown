import { Editor } from '@milkdown/core'
import { test, expect } from 'vitest'

import { $nodeSchema } from './$node-schema'

const docSchema = $nodeSchema('doc', () => {
  return {
    content: 'block*',
    parseMarkdown: {
      match: ({ type }) => type === 'root',
      runner: (state, node, type) => {
        state.injectRoot(node, type)
      },
    },
    toMarkdown: {
      match: (node) => node.type.name === 'doc',
      runner: () => {},
    },
  }
})

const textSchema = $nodeSchema('text', () => ({
  group: 'inline',
  parseMarkdown: {
    match: ({ type }) => type === 'text',
    runner: () => {},
  },
  toMarkdown: {
    match: (node) => node.type.name === 'text',
    runner: () => {},
  },
}))

const paragraphSchema = $nodeSchema('paragraph', () => ({
  content: 'inline*',
  group: 'block',
  parseDOM: [{ tag: 'p' }],
  toDOM: () => ['p', 0],
  parseMarkdown: {
    match: (node) => node.type === 'paragraph',
    runner: () => {},
  },
  toMarkdown: {
    match: (node) => node.type.name === 'paragraph',
    runner: () => {},
  },
}))

test('create schema', async () => {
  const editor = Editor.make()
  editor.use(docSchema)
  editor.use(textSchema)
  editor.use(paragraphSchema)
  await editor.create()

  expect(docSchema.node.schema).toMatchObject({
    content: 'block*',
  })
})

test('extend schema', async () => {
  const extended = docSchema.extendSchema((prev) => {
    return (ctx) => {
      return {
        ...prev(ctx),
        defining: true,
      }
    }
  })

  await Editor.make()
    .use(docSchema)
    .use(extended)
    .use(textSchema)
    .use(paragraphSchema)
    .create()

  expect(extended.node.schema.defining).toBe(true)
  expect(docSchema.node.schema.defining).toBe(undefined)
})

test('double extend schema', async () => {
  const extended = docSchema.extendSchema((prev) => {
    return (ctx) => {
      return {
        ...prev(ctx),
        defining: true,
      }
    }
  })

  const extended2 = extended.extendSchema((prev) => {
    return (ctx) => {
      return {
        ...prev(ctx),
        atom: true,
      }
    }
  })

  await Editor.make()
    .use(docSchema)
    .use(extended)
    .use(extended2)
    .use(textSchema)
    .use(paragraphSchema)
    .create()

  expect(extended2.node.schema.atom).toBe(true)
  expect(extended2.node.schema.defining).toBe(true)

  expect(extended.node.schema.atom).toBe(undefined)
  expect(extended.node.schema.defining).toBe(true)

  expect(docSchema.node.schema.atom).toBe(undefined)
  expect(docSchema.node.schema.defining).toBe(undefined)
})
