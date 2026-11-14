import { parserCtx } from '@milkdown/core'
import { getMarkdown } from '@milkdown/utils'
import { describe, expect, it } from 'vitest'

import { withEditor } from './test-utils'

describe('same-type nested Markdown marks', () => {
  it.each([
    ['*foo *bar* baz*', 'emphasis', '*', 'foo bar baz', '*foo bar baz*'],
    ['_foo *bar* baz_', 'emphasis', '_', 'foo bar baz', '_foo bar baz_'],
    ['**foo **bar** baz**', 'strong', '*', 'foo bar baz', '**foo bar baz**'],
    ['__foo **bar** baz__', 'strong', '_', 'foo bar baz', '__foo bar baz__'],
    ['*(*foo*)*', 'emphasis', '*', '(foo)', '*(foo)*'],
  ])(
    'keeps the outer mark in %s',
    async (markdown, type, marker, text, expected) => {
      const input = `${markdown} plain`
      await withEditor(input, (editor) => {
        const parse = editor.ctx.get(parserCtx)
        const doc = parse(input)
        expect(doc.firstChild?.toJSON().content).toEqual([
          {
            type: 'text',
            marks: [{ type, attrs: { marker } }],
            text,
          },
          { type: 'text', text: ' plain' },
        ])
        const serialized = editor.action(getMarkdown())
        expect(serialized).toBe(`${expected} plain\n`)
        expect(parse(serialized).eq(doc)).toBe(true)
      })
    }
  )

  it('keeps distinct marks inside a redundant nested mark', async () => {
    const input = '_first *second **bold** third* last_ plain'
    await withEditor(input, (editor) => {
      const parse = editor.ctx.get(parserCtx)
      const doc = parse(input)
      expect(doc.eq(parse('_first second **bold** third last_ plain'))).toBe(
        true
      )
      const serialized = editor.action(getMarkdown())
      expect(serialized).toBe('_first second **bold** third last_ plain\n')
      expect(parse(serialized).eq(doc)).toBe(true)
    })
  })
})
