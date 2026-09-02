import { editorViewCtx, parserCtx, schemaCtx } from '@milkdown/core'
import { getMarkdown } from '@milkdown/utils'
import { describe, expect, it } from 'vitest'

import { roundTrip, withEditor } from './test-utils'

// https://github.com/Milkdown/milkdown/issues/2419
// The `spread` attribute parses into a stringified boolean, "true" or
// "false". The bullet_list and list_item toMarkdown runners forwarded
// that string to mdast, where the string "false" is truthy. Every tight
// list then serialized as loose, with a blank line between the items.
describe('list spread round-trip (#2419)', () => {
  // Exact-string checks for the tight/loose distinction. The serializer
  // normalizes bullet markers to `*`, so the inputs use `*` to keep the
  // assertions about spread (blank lines) rather than the marker character.
  const cases = [
    '* a\n* b\n',
    '* a\n  * b\n* c\n',
    '* a\n\n* b\n',
    '1. a\n2. b\n',
    '1. a\n\n2. b\n',
  ]

  cases.forEach((markdown) => {
    it(`should preserve tightness for ${JSON.stringify(markdown)}`, async () => {
      const output = await roundTrip(markdown)
      expect(output).toBe(markdown)
    })
  })

  // Structural invariant: parse(serialize(parse(md))) must equal parse(md).
  cases.forEach((markdown) => {
    it(`should keep the document stable for ${JSON.stringify(markdown)}`, async () => {
      await withEditor(markdown, (editor) => {
        const doc = editor.ctx.get(editorViewCtx).state.doc
        const output = editor.action(getMarkdown())
        const parser = editor.ctx.get(parserCtx)
        const reparsed = parser(output)
        expect(
          reparsed.eq(doc),
          `serialized to ${JSON.stringify(output)}`
        ).toBe(true)
      })
    })
  })

  // `spread` must be stored as a real boolean so it satisfies the schema's
  // `validate: 'boolean'` declaration. When it was a stringified boolean,
  // schema.nodeFromJSON() threw a RangeError on any document with a list.
  cases.forEach((markdown) => {
    it(`should round-trip through nodeFromJSON for ${JSON.stringify(markdown)}`, async () => {
      await withEditor(markdown, (editor) => {
        const doc = editor.ctx.get(editorViewCtx).state.doc
        const schema = editor.ctx.get(schemaCtx)
        const json = doc.toJSON()
        expect(() => schema.nodeFromJSON(json)).not.toThrow()
        expect(schema.nodeFromJSON(json).eq(doc)).toBe(true)
      })
    })
  })
})
