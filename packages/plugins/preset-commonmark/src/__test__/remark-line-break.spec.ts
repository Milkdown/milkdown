import type { Node } from '@milkdown/transformer'

import { remarkCtx } from '@milkdown/core'
import { describe, expect, it } from 'vitest'

import { withEditor } from './test-utils'

type Parent = Node & { children: Node[] }

/// Run the remark plugins of the preset on a paragraph that holds one text
/// node with `value`. Return the children of the paragraph and the time that
/// the run takes.
function splitText(value: string) {
  return withEditor('', (editor) =>
    editor.action((ctx) => {
      const tree = {
        type: 'root',
        children: [{ type: 'paragraph', children: [{ type: 'text', value }] }],
      }
      const start = performance.now()
      const root = ctx.get(remarkCtx).runSync(tree) as Parent
      const elapsed = performance.now() - start
      return { children: (root.children[0] as Parent).children, elapsed }
    })
  )
}

const text = (value: string) => ({ type: 'text', value })
const inlineBreak = { type: 'break', data: { isInline: true } }

describe('remarkLineBreak', () => {
  it.each([
    ['a\nb', [text('a'), inlineBreak, text('b')]],
    ['a\r\nb', [text('a'), inlineBreak, text('b')]],
    ['a\rb', [text('a'), inlineBreak, text('b')]],
    ['a \t \r\nb', [text('a'), inlineBreak, text('b')]],
    ['a\n\r\nb', [text('a'), inlineBreak, inlineBreak, text('b')]],
    [' \t\nb', [inlineBreak, text('b')]],
    ['a \t\n', [text('a'), inlineBreak]],
    ['a  b \nc', [text('a  b'), inlineBreak, text('c')]],
    ['a \tb', [text('a \tb')]],
  ])('splits %j into text and inline breaks', async (value, expected) => {
    const { children } = await splitText(value)
    expect(children).toEqual(expected)
  })

  // https://github.com/Milkdown/milkdown/issues/2503
  it.each([
    ['spaces', ' '],
    ['tabs', '\t'],
  ])('splits text with a long run of %s in linear time', async (_, char) => {
    const run = char.repeat(50_000)
    const { children, elapsed } = await splitText(`a${run}b\nc`)
    expect(children).toEqual([text(`a${run}b`), inlineBreak, text('c')])
    expect(elapsed).toBeLessThan(500)
  })
})
