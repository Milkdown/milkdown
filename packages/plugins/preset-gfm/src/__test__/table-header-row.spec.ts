import '@testing-library/jest-dom/vitest'
import {
  defaultValueCtx,
  Editor,
  editorViewCtx,
  schemaCtx,
  serializerCtx,
} from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { expect, it } from 'vitest'

import { gfm } from '..'

function createEditor() {
  const editor = Editor.make()
  editor.use(commonmark)
  editor.use(gfm)
  return editor
}

it('should not crash when serializing a table with empty header row', async () => {
  const markdown = `| head |\n| --- |\n| cell |\n`
  const editor = createEditor()
  editor.config((ctx) => {
    ctx.set(defaultValueCtx, markdown)
  })

  await editor.create()

  const schema = editor.ctx.get(schemaCtx)
  const serializer = editor.ctx.get(serializerCtx)

  // Create a table with an empty header row (content.size === 0)
  const tableHeaderRow = schema.nodes.table_header_row!.create()
  const tableRow = schema.nodes.table_row!.create(null, [
    schema.nodes.table_cell!.create(
      null,
      schema.nodes.paragraph!.create(null, schema.text('cell'))
    ),
  ])
  const table = schema.nodes.table!.create(null, [tableHeaderRow, tableRow])
  const doc = schema.topNodeType.createAndFill(null, [table])!

  // This should not throw
  expect(() => serializer(doc)).not.toThrow()
})

it('should serialize a normal table correctly', async () => {
  const markdown = `| head |\n| --- |\n| cell |\n`
  const editor = createEditor()
  editor.config((ctx) => {
    ctx.set(defaultValueCtx, markdown)
  })

  await editor.create()

  const view = editor.ctx.get(editorViewCtx)
  const serializer = editor.ctx.get(serializerCtx)

  // Serializing the current doc (which has a normal table) should work
  const result = serializer(view.state.doc)
  expect(result).toContain('head')
  expect(result).toContain('cell')
})
