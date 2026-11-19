import {
  editorViewCtx,
  parserCtx,
  schemaCtx,
  serializerCtx,
} from '@milkdown/core'
import { describe, expect, it } from 'vitest'

import { roundTrip, withEditor } from './test-utils'

// https://github.com/Milkdown/milkdown/issues/2527
// Text that ends with a space must still escape its markdown characters.
// Text before inline code, a link or an emphasis often ends with a space.
// If the escape drops, the paragraph turns into a heading, a list or a quote.
describe('escape in text that ends with a space', () => {
  const cases = [
    '\\# not a heading `code`',
    '1\\. not a list `code`',
    '\\- not a list `code`',
    '\\> not a quote `code`',
    'AT\\&amp;T `code`',
    '\\# not a heading [link](https://example.com)',
    '\\# not a heading **strong**',
  ]

  cases.forEach((markdown) => {
    it(`should round-trip ${JSON.stringify(markdown)}`, async () => {
      const output = await roundTrip(markdown)
      expect(output).toBe(`${markdown}\n`)
    })
  })

  cases.forEach((markdown) => {
    it(`should keep the document stable for ${JSON.stringify(markdown)}`, async () => {
      await withEditor(markdown, (editor) => {
        const doc = editor.ctx.get(editorViewCtx).state.doc
        const output = editor.ctx.get(serializerCtx)(doc)
        const reparsed = editor.ctx.get(parserCtx)(output)
        expect(
          reparsed.eq(doc),
          `serialized to ${JSON.stringify(output)}`
        ).toBe(true)
      })
    })
  })

  it('should keep the outer spaces of the text as they are', async () => {
    await withEditor('', (editor) => {
      const schema = editor.ctx.get(schemaCtx)
      const serializer = editor.ctx.get(serializerCtx)
      const code = schema.marks.inlineCode!.create()
      const strong = schema.marks.strong!.create()
      const paragraph = (...content: ReturnType<typeof schema.text>[]) =>
        serializer(
          schema.topNodeType.createAndFill(null, [
            schema.nodes.paragraph!.create(null, content),
          ])!
        )

      expect(paragraph(schema.text(' # x '), schema.text('c', [code]))).toBe(
        ' \\# x `c`\n'
      )
      expect(paragraph(schema.text('a b '))).toBe('a b \n')
      expect(paragraph(schema.text(' a b '))).toBe(' a b \n')
      expect(
        paragraph(
          schema.text('a '),
          schema.text('b', [strong]),
          schema.text(' c')
        )
      ).toBe('a **b** c\n')
    })
  })
})
