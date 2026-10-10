import {
  editorViewCtx,
  parserCtx,
  schemaCtx,
  serializerCtx,
} from '@milkdown/core'
import { getMarkdown } from '@milkdown/utils'
import { describe, expect, it } from 'vitest'

import { commonmark, listItemSchema } from '..'
import { roundTrip, withEditor } from './test-utils'

// A list item that starts with a block other than a paragraph gets an empty
// paragraph in front of it. The `<br />` placeholder for that paragraph must
// not reach the output, or it starts an HTML block that swallows the block.
describe('list item starting with a block', () => {
  const cases = [
    '* ```js\n  code\n  ```\n',
    '1. ```\n   code\n   ```\n2. b\n',
    '- ***\n',
    '* * a\n',
    '> * ```\n>   code\n>   ```\n',
  ]

  cases.forEach((markdown) => {
    it(`should round-trip ${JSON.stringify(markdown)}`, async () => {
      const output = await roundTrip(markdown)
      expect(output).toBe(markdown)
    })
  })

  // The stability check skips headings: the bare parser assigns no heading id.
  it('should round-trip "* # h\\n"', async () => {
    const output = await roundTrip('* # h\n')
    expect(output).toBe('* # h\n')
  })

  cases.forEach((markdown) => {
    it(`should keep the document stable for ${JSON.stringify(markdown)}`, async () => {
      await withEditor(markdown, (editor) => {
        const doc = editor.ctx.get(editorViewCtx).state.doc
        const output = editor.action(getMarkdown())
        const reparsed = editor.ctx.get(parserCtx)(output)
        expect(
          reparsed.eq(doc),
          `serialized to ${JSON.stringify(output)}`
        ).toBe(true)
      })
    })
  })

  it.each([
    '* <br />\n',
    '* <br />\n\n  b\n',
    '* <br />\n\n  * <br />\n',
    '* a\n  ```\n  c\n  ```\n',
  ])('should keep the first paragraph in %j', async (markdown) => {
    const output = await roundTrip(markdown)
    expect(output).toBe(markdown)
  })

  it('should keep an empty paragraph before a paragraph in a tight item', async () => {
    await withEditor('', (editor) => {
      const schema = editor.ctx.get(schemaCtx)
      const item = schema.node('list_item', { spread: false }, [
        schema.node('paragraph'),
        schema.node('paragraph', null, schema.text('b')),
      ])
      const tree = schema.node(
        'doc',
        null,
        schema.node('bullet_list', null, item)
      )
      const output = editor.ctx.get(serializerCtx)(tree)
      expect(output).toBe('* <br />\n\n  b\n')
    })
  })

  it('should keep an empty leading block that is not a paragraph', async () => {
    const blockListItem = listItemSchema.extendSchema((prev) => (ctx) => ({
      ...prev(ctx),
      content: 'block+',
    }))
    const markdown = '* ```\n  ```\n  ***\n'
    const output = await roundTrip(markdown, commonmark, blockListItem)
    expect(output).toBe(markdown)
  })
})
