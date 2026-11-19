import {
  editorViewCtx,
  parserCtx,
  schemaCtx,
  serializerCtx,
} from '@milkdown/core'
import { describe, expect, it } from 'vitest'

import { roundTrip, withEditor } from './test-utils'

// https://github.com/Milkdown/milkdown/issues/2527
// A `|` between two inline code spans in a table cell must stay escaped.
// If the escape drops, the cell splits in two and the columns shift.
describe('escape in text that ends with a space (gfm)', () => {
  const table = (cell: string) => `| a | b |\n| - | - |\n| ${cell} | z |\n`

  ;['`x` \\| `y`', '`x` &#124; `y`'].forEach((cell) => {
    it(`should keep ${JSON.stringify(cell)} in one table cell`, async () => {
      const markdown = table(cell)
      await withEditor(markdown, (editor) => {
        const doc = editor.ctx.get(editorViewCtx).state.doc
        const output = editor.ctx.get(serializerCtx)(doc)
        expect(output).toContain('| `x` \\| `y` | z |')
        const reparsed = editor.ctx.get(parserCtx)(output)
        expect(
          reparsed.eq(doc),
          `serialized to ${JSON.stringify(output)}`
        ).toBe(true)
      })
    })
  })

  it('should escape a `|` typed between inline code spans', async () => {
    await withEditor('', (editor) => {
      const schema = editor.ctx.get(schemaCtx)
      const code = schema.marks.inlineCode!.create()
      const cell = (
        type: string,
        ...content: ReturnType<typeof schema.text>[]
      ) =>
        schema.nodes[type]!.create(
          null,
          schema.nodes.paragraph!.create(null, content)
        )
      const doc = schema.topNodeType.createAndFill(null, [
        schema.nodes.table!.create(null, [
          schema.nodes.table_header_row!.create(null, [
            cell('table_header', schema.text('type')),
            cell('table_header', schema.text('default')),
          ]),
          schema.nodes.table_row!.create(null, [
            cell(
              'table_cell',
              schema.text('x', [code]),
              schema.text(' | '),
              schema.text('y', [code])
            ),
            cell('table_cell', schema.text('z')),
          ]),
        ]),
      ])!
      const output = editor.ctx.get(serializerCtx)(doc)
      expect(output).toContain('`x` \\| `y`')
      expect(
        editor.ctx.get(parserCtx)(output).eq(doc),
        `serialized to ${JSON.stringify(output)}`
      ).toBe(true)
    })
  })

  it('should not turn escaped tildes into strikethrough', async () => {
    const markdown = '\\~\\~not struck\\~\\~ `code`'
    expect(await roundTrip(markdown)).toBe(`${markdown}\n`)
  })
})
