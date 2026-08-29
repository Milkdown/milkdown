import { editorViewCtx, schemaCtx } from '@milkdown/core'
import { describe, expect, it } from 'vitest'

import { roundTrip, withEditor } from './test-utils'

// https://github.com/Milkdown/milkdown/issues/2419
// Tight task lists must round-trip as tight, and the checkbox syntax
// (`- [ ]` / `- [x]`) must survive. The list_item toMarkdown fix must be
// applied *in place*: preset-gfm delegates unchecked items to the base
// list_item runner, so replacing the whole runner would drop checkboxes.
describe('task list spread round-trip (#2419)', () => {
  // The serializer normalizes bullet markers to `*`, so the inputs use `*`
  // to keep the assertions about spread (blank lines) and the surviving
  // checkbox rather than the marker character.
  const cases = [
    '* [ ] a\n* [x] b\n',
    '* [ ] a\n  * [ ] b\n* [x] c\n',
    '* [ ] a\n\n* [x] b\n',
  ]

  cases.forEach((markdown) => {
    it(`should round-trip ${JSON.stringify(markdown)}`, async () => {
      const output = await roundTrip(markdown)
      expect(output).toBe(markdown)
    })
  })

  it('should keep the checkbox on a tight unchecked task item', async () => {
    const output = await roundTrip('* [ ] todo\n')
    expect(output).toBe('* [ ] todo\n')
    expect(output).not.toBe('* todo\n')
  })

  // The `spread` attribute must be a real boolean so schema.nodeFromJSON()
  // does not throw on documents containing task lists.
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
