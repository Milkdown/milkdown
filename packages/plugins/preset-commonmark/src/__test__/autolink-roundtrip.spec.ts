import { parserCtx, serializerCtx } from '@milkdown/core'
import { describe, expect, it } from 'vitest'

import { withEditor } from './test-utils'

describe('#autolink-roundtrip.spec.ts', () => {
  it.each([
    String.raw`<https://example.com/page.\>`,
    String.raw`<https://example.com/path\.html>`,
    String.raw`<https://example.com/path\_name>`,
    String.raw`<https://example.com/path\\name>`,
    String.raw`<https://example.com/path\name>`,
    '<https://example.com/path>',
  ])('preserves %s across repeated round-trips', async (markdown) => {
    await withEditor(markdown, (editor) => {
      const parser = editor.ctx.get(parserCtx)
      const serializer = editor.ctx.get(serializerCtx)
      const original = parser(markdown)
      let doc = original

      // Autolink backslashes must not grow on each save (#2349).
      for (let round = 0; round < 10; round++) {
        const output = serializer(doc)
        expect(output).toBe(`${markdown}\n`)
        doc = parser(output)
        expect(doc.eq(original)).toBe(true)
      }
    })
  })
})
