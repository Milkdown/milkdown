import { Editor, schemaCtx } from '@milkdown/core'
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

  expect(docSchema.node.schema.content).toEqual('block*')
})

test('extend schema', async () => {
  const extended = docSchema.extendSchema((prev) => (ctx) => ({
    ...prev(ctx),
    defining: true,
  }))

  const editor = await Editor.make()
    .use(docSchema)
    .use(extended)
    .use(paragraphSchema)
    .use(textSchema)
    .create()

  expect(extended.node.schema.defining).toBe(true)
  expect(docSchema.node.schema.defining).toBe(undefined)

  const schema = editor.ctx.get(schemaCtx)
  expect(schema.nodes.doc?.spec).toEqual(extended.node.schema)
  expect(Object.keys(schema.nodes)).toEqual(['doc', 'paragraph', 'text'])
})

test('double extend schema', async () => {
  const extended = docSchema.extendSchema((prev) => (ctx) => ({
    ...prev(ctx),
    defining: true,
  }))

  const extended2 = extended.extendSchema((prev) => (ctx) => ({
    ...prev(ctx),
    atom: true,
  }))

  const editor = await Editor.make()
    .use(docSchema)
    .use(extended)
    .use(extended2)
    .use(paragraphSchema)
    .use(textSchema)
    .create()

  expect(extended2.node.schema.atom).toBe(true)
  expect(extended2.node.schema.defining).toBe(true)

  expect(extended.node.schema.atom).toBe(undefined)
  expect(extended.node.schema.defining).toBe(true)

  expect(docSchema.node.schema.atom).toBe(undefined)
  expect(docSchema.node.schema.defining).toBe(undefined)

  const schema = editor.ctx.get(schemaCtx)
  expect(schema.nodes.doc?.spec).toEqual(extended2.node.schema)
  expect(Object.keys(schema.nodes)).toEqual(['doc', 'paragraph', 'text'])
})

// See https://github.com/Milkdown/milkdown/issues/2370
// Extending two block node schemas used to move them to the end of `nodesCtx`,
// which reordered `doc.contentMatch.next` so a self-referential `block+`
// container (e.g. blockquote) was picked first when filling an empty doc,
// recursing forever inside ProseMirror's `fillBefore` -> `createAndFill`.
test('extending two node schemas keeps registration order (empty doc does not overflow)', async () => {
  const blockDoc = $nodeSchema('doc', () => ({
    content: 'block+',
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
  }))

  const text = $nodeSchema('text', () => ({
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

  const paragraph = $nodeSchema('paragraph', () => ({
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

  const heading = $nodeSchema('heading', () => ({
    content: 'inline*',
    group: 'block',
    parseDOM: [{ tag: 'h1' }],
    toDOM: () => ['h1', 0],
    parseMarkdown: {
      match: (node) => node.type === 'heading',
      runner: () => {},
    },
    toMarkdown: {
      match: (node) => node.type.name === 'heading',
      runner: () => {},
    },
  }))

  // Self-referential `block+` container registered after paragraph/heading.
  const blockquote = $nodeSchema('blockquote', () => ({
    content: 'block+',
    group: 'block',
    parseDOM: [{ tag: 'blockquote' }],
    toDOM: () => ['blockquote', 0],
    parseMarkdown: {
      match: (node) => node.type === 'blockquote',
      runner: () => {},
    },
    toMarkdown: {
      match: (node) => node.type.name === 'blockquote',
      runner: () => {},
    },
  }))

  const noopParagraph = paragraph.extendSchema((prev) => (ctx) => prev(ctx))
  const noopHeading = heading.extendSchema((prev) => (ctx) => prev(ctx))

  const editor = await Editor.make()
    .use(blockDoc)
    .use(text)
    .use(paragraph)
    .use(heading)
    .use(blockquote)
    .use(noopParagraph)
    .use(noopHeading)
    .create()

  const schema = editor.ctx.get(schemaCtx)
  // Extended nodes keep their original position; blockquote is not first.
  expect(Object.keys(schema.nodes)).toEqual([
    'doc',
    'text',
    'paragraph',
    'heading',
    'blockquote',
  ])
})

test('should can register extended schema only', async () => {
  const extended = docSchema.extendSchema((prev) => (ctx) => ({
    ...prev(ctx),
    defining: true,
  }))

  const extended2 = extended.extendSchema((prev) => (ctx) => ({
    ...prev(ctx),
    atom: true,
  }))

  const editor = await Editor.make()
    .use(extended2)
    .use(paragraphSchema)
    .use(textSchema)
    .create()

  expect(extended2.node.schema.atom).toBe(true)
  expect(extended2.node.schema.defining).toBe(true)

  // this schema is not registered, so it should be undefined
  expect(extended.node.schema).toBe(undefined)

  const schema = editor.ctx.get(schemaCtx)
  expect(schema.nodes.doc?.spec).toEqual(extended2.node.schema)
  expect(Object.keys(schema.nodes)).toEqual(['doc', 'paragraph', 'text'])
})
