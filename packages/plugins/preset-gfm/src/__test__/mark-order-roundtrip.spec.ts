import { editorViewCtx, parserCtx } from '@milkdown/core'
import { getMarkdown } from '@milkdown/utils'
import { describe, expect, it } from 'vitest'

import { roundTrip, withEditor } from './test-utils'

// A strikethrough that opens on the same text node as a nested mark must
// stay outside of it, or the end of the nested mark splits the
// strikethrough in two.
describe('strikethrough around a nested mark', () => {
  const cases = ['~~*a* b~~', '~~**a** b~~', '*~~a~~ b*', '**~~a~~ b**']

  it.each(cases)('round-trips %s', async (markdown) => {
    expect(await roundTrip(markdown)).toBe(`${markdown}\n`)
  })

  it.each(cases)('keeps the document stable for %s', async (markdown) => {
    await withEditor(markdown, (editor) => {
      const doc = editor.ctx.get(editorViewCtx).state.doc
      const output = editor.action(getMarkdown())
      const reparsed = editor.ctx.get(parserCtx)(output)
      expect(reparsed.eq(doc), `serialized to ${JSON.stringify(output)}`).toBe(
        true
      )
    })
  })
})
