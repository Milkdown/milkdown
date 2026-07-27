import '@testing-library/jest-dom/vitest'
import {
  defaultValueCtx,
  Editor,
  editorViewCtx,
  parserCtx,
} from '@milkdown/core'
import { getMarkdown } from '@milkdown/utils'
import { describe, expect, it } from 'vitest'

import { commonmark } from '..'

async function createEditor(defaultValue: string) {
  const editor = Editor.make()
  editor.config((ctx) => {
    ctx.set(defaultValueCtx, defaultValue)
  })
  editor.use(commonmark)
  await editor.create()
  return editor
}

async function roundTrip(markdown: string) {
  const editor = await createEditor(markdown)
  return editor.action(getMarkdown())
}

// https://github.com/Milkdown/milkdown/issues/2403
// A mark spanning multiple text leaves (because a nested mark splits it)
// must be serialized as one continuous span, not split into pieces.
// Splitting is not only verbose: when the split lands next to punctuation,
// remark-stringify has to escape the delimiters and the output gains
// literal asterisks while losing the original formatting.
describe('nested mark round-trip (#2403)', () => {
  const cases = [
    '**a *b* c**',
    '**a *b*c**',
    '**a, *b* c**',
    '**a *b*, c**',
    '**(better: *proportionate*), mostly-autonomous gate**',
    '*a **b** c*',
    '_a **b** c_',
    '**a `code` b**',
    '[a **b** c](https://example.com)',
    '*a **b*** and `code`',
  ]

  cases.forEach((markdown) => {
    it(`should round-trip ${JSON.stringify(markdown)}`, async () => {
      const output = await roundTrip(markdown)
      expect(output).toBe(`${markdown}\n`)
    })
  })

  // The structural invariant behind the string checks above:
  // parse(serialize(parse(md))) must equal parse(md).
  // This tolerates cosmetic reflow but catches any corruption.
  cases.forEach((markdown) => {
    it(`should keep the document stable for ${JSON.stringify(markdown)}`, async () => {
      const editor = await createEditor(markdown)
      const doc = editor.ctx.get(editorViewCtx).state.doc
      const output = editor.action(getMarkdown())
      const parser = editor.ctx.get(parserCtx)
      const reparsed = parser(output)
      expect(reparsed.eq(doc), `serialized to ${JSON.stringify(output)}`).toBe(
        true
      )
    })
  })
})
