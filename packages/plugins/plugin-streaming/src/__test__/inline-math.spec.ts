import type { Ctx } from '@milkdown/ctx'
import type { Node } from '@milkdown/prose/model'

import { parserCtx } from '@milkdown/core'
import { Schema } from '@milkdown/prose/model'
import { EditorState } from '@milkdown/prose/state'
import { describe, expect, it, vi } from 'vitest'

import { flushBufferInsert } from '../flush'
import { streamingConfig } from '../streaming-config'

/// Mirrors the shape `@milkdown/crepe`'s latex feature adds to the schema:
/// `math_inline` is an inline atom holding its LaTeX source in a `value`
/// attribute, so it contributes no text of its own to the document.
/// `emoji` mirrors `@milkdown/plugin-emoji`'s node id; `link` stands in
/// for the standard link mark so parsed content can carry marks.
const richSchema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { group: 'block', content: 'inline*' },
    math_inline: {
      group: 'inline',
      inline: true,
      atom: true,
      attrs: { value: { default: '' } },
    },
    emoji: {
      group: 'inline',
      inline: true,
      atom: true,
      attrs: { shortcode: { default: '' } },
    },
    text: { group: 'inline' },
  },
  marks: {
    link: { attrs: { href: { default: '' } } },
  },
})

/// A schema without math/emoji nodes: the schema-gated token patterns
/// must not fire against it.
const plainSchema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { group: 'block', content: 'inline*' },
    text: { group: 'inline' },
  },
})

/// CommonMark strips leading indentation and a trailing space or tab
/// when it wraps a line into a paragraph. It strips only an ASCII space
/// or tab, not U+3000. The real parser behaves this way, so the stub
/// does too. The whitespace-restoration branches in `parseInlineContent`
/// are the code under test.
function stripParagraphEdges(markdown: string): string {
  return markdown.replace(/^[ \t]+/, '').replace(/[ \t]+$/, '')
}

/// Stands in for a parser with `remark-math`, an emoji plugin, links and
/// entity decoding enabled. Math pairing is greedy, the same as
/// `remark-math` with the default `singleDollarTextMath`. The first `$`
/// pairs with the next `$` on the line, even across `$5 and $10`. The
/// fast-path gate keeps such prose away from the parser.
function richParser(markdown: string): Node {
  const source = stripParagraphEdges(markdown).replace(/&amp;/g, '&')
  const content: Node[] = []
  const pattern = /\$([^$]+)\$|:([\w+-]+):|\[([^\]]*)\]\(([^)\s]*)\)/

  let rest = source
  for (;;) {
    const match = pattern.exec(rest)
    if (!match) break
    if (match.index > 0)
      content.push(richSchema.text(rest.slice(0, match.index)))
    if (match[1] != null) {
      content.push(richSchema.node('math_inline', { value: match[1] }))
    } else if (match[2] != null) {
      content.push(richSchema.node('emoji', { shortcode: match[2] }))
    } else {
      content.push(
        richSchema.text(match[3] || 'link', [
          richSchema.mark('link', { href: match[4] }),
        ])
      )
    }
    rest = rest.slice(match.index + match[0].length)
  }
  if (rest) content.push(richSchema.text(rest))

  return richSchema.node('doc', null, [
    richSchema.node('paragraph', null, content),
  ])
}

/// Simulates `@milkdown/transformer` throwing `parserMatchError` when a
/// remark plugin emits an mdast node with no registered schema runner.
function throwingParser(): Node {
  throw new Error('cannot find schema runner for the mdast node')
}

/// `flush.ts` only reads the parser and the streaming config off the
/// ctx; the config only for its optional `insertStrategy`, so an empty
/// object is enough.
function createCtx(parser: (markdown: string) => Node): Ctx {
  return {
    get: (slice: unknown) => {
      if (slice === parserCtx) return parser
      if (slice === streamingConfig.key) return {}
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

interface FlushOptions {
  schema?: Schema
  parser?: (markdown: string) => Node
}

function createStartState(schema: Schema) {
  const doc = schema.node('doc', null, [
    schema.node('paragraph', null, [schema.text('start')]),
  ])
  return EditorState.create({ doc })
}

function flush(buffer: string, options: FlushOptions = {}) {
  const schema = options.schema ?? richSchema
  const state = createStartState(schema)
  // Insert at the end of the existing paragraph, i.e. inside a textblock,
  // which routes through the `split-block` strategy.
  const insertPos = state.doc.content.size - 1
  const result = flushBufferInsert(
    createCtx(options.parser ?? richParser),
    state.tr,
    { buffer, insertPos, currentEndPos: insertPos }
  )
  return { doc: result.tr.doc, insertPos, result }
}

/// Streaming buffers are cumulative: each flush re-parses the whole
/// buffer and replaces the previously inserted range. Thread one
/// flush's `insertEndPos` into the next flush's `currentEndPos`, the
/// way the flush controller does.
function flushSequence(buffers: string[], options: FlushOptions = {}) {
  const schema = options.schema ?? richSchema
  const ctx = createCtx(options.parser ?? richParser)
  let state = createStartState(schema)
  const insertPos = state.doc.content.size - 1
  let currentEndPos = insertPos
  for (const buffer of buffers) {
    const result = flushBufferInsert(ctx, state.tr, {
      buffer,
      insertPos,
      currentEndPos,
    })
    expect(result.applied).toBe(true)
    state = state.apply(result.tr)
    currentEndPos = result.insertEndPos
  }
  return { doc: state.doc, insertPos, insertEndPos: currentEndPos }
}

describe('inline math in streamed content', () => {
  it('parses inline math when the line has no other markdown tokens', () => {
    const { doc } = flush(' Let $a^2 + b^2 = c^2$ hold.')
    expect(mathValues(doc)).toEqual(['a^2 + b^2 = c^2'])
    expect(doc.textContent).not.toContain('$')
    // The leading space CommonMark strips is restored, so the streamed
    // text doesn't collide with the existing `start`.
    expect(doc.textContent).toBe('start Let  hold.')
  })

  it('parses inline math alongside other inline markdown', () => {
    const { doc } = flush(' See `code` and $x$ together.')
    expect(mathValues(doc)).toEqual(['x'])
  })

  it('leaves a lone dollar sign as plain text', () => {
    const { doc } = flush(' It costs $5 today.')
    expect(mathValues(doc)).toEqual([])
    expect(doc.textContent).toContain('$5')
  })

  it('keeps two-dollar prose literal instead of collapsing it into math', () => {
    // remark-math pairs the first `$` with the next one on the line, so
    // any of these would become a math atom if they reached the parser.
    const lines = [
      ' It costs $5 and I paid $10.',
      ' Set $PATH and $HOME first',
      ' echo $1 $2',
      ' price: $5 ($6 with tax)',
    ]
    for (const line of lines) {
      const { doc } = flush(line)
      expect(mathValues(doc), line).toEqual([])
      expect(doc.textContent, line).toBe(`start${line}`)
    }
  })

  it('does not consult the math pattern when the schema has no math node', () => {
    const parser = vi.fn(throwingParser)
    const { doc } = flush(' Let $a^2 + b^2 = c^2$ hold.', {
      schema: plainSchema,
      parser,
    })
    expect(parser).not.toHaveBeenCalled()
    expect(doc.textContent).toBe('start Let $a^2 + b^2 = c^2$ hold.')
  })

  it('falls back to raw text when the parser throws', () => {
    // remark-math registered without a math node schema makes the real
    // parser throw; the flush must degrade to literal text instead of
    // letting the throw escape and leave the streaming state locked.
    const { doc } = flush(' Let $x$ hold.', { parser: throwingParser })
    expect(doc.textContent).toBe('start Let $x$ hold.')
  })
})

describe('whitespace restoration around parsed inline content', () => {
  it('restores the leading space when the content starts with an atom', () => {
    const { doc } = flush(' $x$ tail')
    expect(mathValues(doc)).toEqual(['x'])
    expect(doc.textContent).toBe('start  tail')
  })

  it('restores the trailing space when the content ends with an atom', () => {
    const { doc } = flush(' has $x$ ')
    expect(mathValues(doc)).toEqual(['x'])
    expect(doc.textContent).toBe('start has  ')
  })

  it('restores the leading space even when the parsed text itself starts with one', () => {
    // The link keeps its interior leading space, and the stripped outer
    // space must come back. The parsed text starts with a space of its
    // own, which must not hide the missing outer one.
    const { doc } = flush(' [ a](https://x)')
    expect(doc.textContent).toBe('start  a')
  })

  it('does not duplicate non-ASCII whitespace', () => {
    // CommonMark strips only ASCII space/tab; U+3000 survives the parse
    // and must not be prepended a second time.
    const { doc } = flush(' \u3000text $x$')
    expect(doc.textContent.split('\u3000').length - 1).toBe(1)
    expect(doc.textContent).toBe('start \u3000text ')
  })
})

describe('fast-path gate coverage for remark-plugin syntax', () => {
  it('routes GFM autolink literals to the parser', () => {
    const buffers = [
      ' See https://milkdown.dev for docs',
      ' visit www.example.com now',
      ' mail me a@b.com',
    ]
    for (const buffer of buffers) {
      const parser = vi.fn(richParser)
      flush(buffer, { parser })
      expect(parser, buffer).toHaveBeenCalled()
    }
  })

  it('skips the parser for plain prose', () => {
    const parser = vi.fn(richParser)
    const { doc } = flush(' just plain prose here.', { parser })
    expect(parser).not.toHaveBeenCalled()
    expect(doc.textContent).toBe('start just plain prose here.')
  })

  it('decodes entity references regardless of other syntax on the line', () => {
    const { doc } = flush(' AT&amp;T rocks')
    expect(doc.textContent).toBe('start AT&T rocks')
  })

  it('parses emoji shortcodes only when the schema has an emoji node', () => {
    const { doc } = flush(' nice :tada: work')
    let shortcode = ''
    doc.descendants((node) => {
      if (node.type.name === 'emoji') shortcode = node.attrs.shortcode
    })
    expect(shortcode).toBe('tada')

    const parser = vi.fn(throwingParser)
    const { doc: plainDoc } = flush(' nice :tada: work', {
      schema: plainSchema,
      parser,
    })
    expect(parser).not.toHaveBeenCalled()
    expect(plainDoc.textContent).toBe('start nice :tada: work')
  })
})

describe('cumulative flushes', () => {
  it('replaces streamed text with a math atom once the closing dollar arrives', () => {
    const { doc, insertPos, insertEndPos } = flushSequence([
      '$x',
      '$x$',
      '$x$ done',
    ])
    expect(mathValues(doc)).toEqual(['x'])
    expect(doc.textContent).toBe('start done')
    // `$x$` is a size-1 atom and ` done` is 5 characters.
    expect(insertEndPos).toBe(insertPos + 6)
  })

  it('reports insertEndPos matching the inserted content size', () => {
    const { insertPos, result } = flush(' Let $x$ hold.')
    // ` Let ` (5) + atom (1) + ` hold.` (6)
    expect(result.applied).toBe(true)
    expect(result.insertEndPos).toBe(insertPos + 12)
  })
})
