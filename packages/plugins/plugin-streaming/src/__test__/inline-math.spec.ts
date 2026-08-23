import { parserCtx } from '@milkdown/core'
import { Schema } from '@milkdown/prose/model'
import { EditorState } from '@milkdown/prose/state'
import { describe, expect, it } from 'vitest'

import type { Ctx } from '@milkdown/ctx'
import type { Node } from '@milkdown/prose/model'

import { flushBufferInsert } from '../flush'
import { streamingConfig } from '../streaming-config'

/// Mirrors the shape `@milkdown/plugin-math` adds to the schema:
/// `math_inline` is an inline atom whose LaTeX source lives in a text child.
const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { group: 'block', content: 'inline*', toDOM: () => ['p', 0] },
    math_inline: {
      group: 'inline',
      inline: true,
      atom: true,
      content: 'text*',
      toDOM: () => ['span', 0],
    },
    text: { group: 'inline' },
  },
})

/// Stands in for a parser with `remark-math` enabled: `$...$` becomes a
/// `math_inline` node instead of literal text.
function mathParser(markdown: string): Node {
  const content: Node[] = []
  let rest = markdown
  const pattern = /\$([^$]+)\$/

  for (;;) {
    const match = pattern.exec(rest)
    if (!match) break
    if (match.index > 0) content.push(schema.text(rest.slice(0, match.index)))
    content.push(schema.node('math_inline', null, [schema.text(match[1]!)]))
    rest = rest.slice(match.index + match[0].length)
  }
  if (rest) content.push(schema.text(rest))

  return schema.node('doc', null, [schema.node('paragraph', null, content)])
}

function createCtx(): Ctx {
  return {
    get: (slice: unknown) =>
      slice === parserCtx
        ? mathParser
        : { throttleMs: 0, scrollFollow: false, diffReviewOnEnd: false },
  } as unknown as Ctx
}

function countMathNodes(doc: Node): number {
  let count = 0
  doc.descendants((node) => {
    if (node.type.name === 'math_inline') count += 1
  })
  return count
}

function flush(buffer: string) {
  const doc = schema.node('doc', null, [
    schema.node('paragraph', null, [schema.text('start')]),
  ])
  const state = EditorState.create({ doc })
  // Insert at the end of the existing paragraph, i.e. inside a textblock,
  // which routes through the `split-block` strategy.
  const insertPos = doc.content.size - 1
  const result = flushBufferInsert(createCtx(), state.tr, {
    buffer,
    insertPos,
    currentEndPos: insertPos,
  })
  return result.tr.doc
}

describe('inline math in streamed content', () => {
  it('parses inline math when the line has no other markdown tokens', () => {
    const doc = flush(' Let $a^2 + b^2 = c^2$ hold.')
    expect(countMathNodes(doc)).toBe(1)
    expect(doc.textContent).not.toContain('$')
  })

  it('parses inline math alongside other inline markdown', () => {
    const doc = flush(' See `code` and $x$ together.')
    expect(countMathNodes(doc)).toBe(1)
  })

  it('leaves a lone dollar sign as plain text', () => {
    const doc = flush(' It costs $5 today.')
    expect(countMathNodes(doc)).toBe(0)
    expect(doc.textContent).toContain('$5')
  })
})
