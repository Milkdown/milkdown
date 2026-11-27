import { parserCtx } from '@milkdown/core'
import { getMarkdown } from '@milkdown/utils'
import { describe, expect, it } from 'vitest'

import { withEditor } from './test-utils'

// ProseMirror cannot hold two strike_through marks on the same text, so a
// nested `delete` must not end the outer one when it closes.
describe('nested strikethrough', () => {
  it.each(['~~foo ~~bar~~ baz~~', '~foo ~bar~ baz~'])(
    'keeps the outer mark in %s',
    async (markdown) => {
      const input = `${markdown} plain`
      await withEditor(input, (editor) => {
        const parse = editor.ctx.get(parserCtx)
        const doc = parse(input)
        expect(doc.firstChild?.toJSON().content).toEqual([
          {
            type: 'text',
            marks: [{ type: 'strike_through' }],
            text: 'foo bar baz',
          },
          { type: 'text', text: ' plain' },
        ])
        const serialized = editor.action(getMarkdown())
        expect(serialized).toBe('~~foo bar baz~~ plain\n')
        expect(parse(serialized).eq(doc)).toBe(true)
      })
    }
  )
})
