import type { Ctx } from '@milkdown/ctx'
import type { Node } from '@milkdown/prose/model'

import { parserCtx } from '@milkdown/core'
import { Schema } from '@milkdown/prose/model'
import { EditorState } from '@milkdown/prose/state'
import { describe, expect, it } from 'vitest'

import { flushBufferInsert } from '../flush'
import { streamingConfig } from '../streaming-config'

/// Mirrors the shape `@milkdown/crepe`'s latex feature adds to the schema:
/// `math_inline` is an inline atom holding its LaTeX source in a `value`
/// attribute, so it contributes no text of its own to the document.
const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { group: 'block', content: 'inline*', toDOM: () => ['p', 0] },
    math_inline: {
      group: 'inline',
      inline: true,
      atom: true,
      draggable: true,
      attrs: { value: { default: '' } },
      toDOM: (node) => [
        'span',
        { 'data-type': 'math_inline', 'data-value': node.attrs.value },
      ],
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
    content.push(schema.node('math_inline', { value: match[1]! }))
    rest = rest.slice(match.index + match[0].length)
  }
  if (rest) content.push(schema.text(rest))

  return schema.node('doc', null, [schema.node('paragraph', null, content)])
}

/// `flush.ts` only reads the parser and the streaming config off the ctx,
/// so a two-slice stub is enough.
function createCtx(): Ctx {
  return {
    get: (slice: unknown) => {
      if (slice === parserCtx) return mathParser
      if (slice === streamingConfig.key)
        return { throttleMs: 0, scrollFollow: false, diffReviewOnEnd: false }
      throw new Error('unexpected slice requested from the test ctx')
    },
  } as unknown as Ctx
}

function mathValues(doc: Node): string[] {
  const values: string[] = []
  doc.descendants((node) => {
    if (node.type.name === 'math_inline') values.push(node.attrs.value)
  })
  return values
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
    expect(mathValues(doc)).toEqual(['a^2 + b^2 = c^2'])
    expect(doc.textContent).not.toContain('$')
  })

  it('parses inline math alongside other inline markdown', () => {
    const doc = flush(' See `code` and $x$ together.')
    expect(mathValues(doc)).toEqual(['x'])
  })

  it('leaves a lone dollar sign as plain text', () => {
    const doc = flush(' It costs $5 today.')
    expect(mathValues(doc)).toEqual([])
    expect(doc.textContent).toContain('$5')
  })
})
