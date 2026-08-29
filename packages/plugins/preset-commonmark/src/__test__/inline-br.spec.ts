import { editorViewCtx } from '@milkdown/core'
import { getMarkdown } from '@milkdown/utils'
import { describe, expect, it } from 'vitest'

import { remarkPreserveEmptyLinePlugin, schema } from '..'
import { roundTrip, withEditor } from './test-utils'

// https://github.com/Milkdown/milkdown/issues/2428
// remarkPreserveEmptyLinePlugin used to splice every html <br> out of the
// mdast, including user-authored inline breaks. Only a lone <br> that marks
// a preserved empty line should be removed.
describe('inline br round-trip (#2428)', () => {
  it('keeps a break in foo<br>bar after load and getMarkdown', async () => {
    const output = await roundTrip('foo<br>bar\n')
    expect(output).toBe('foo<br>bar\n')
  })

  it('does not delete the <br> in line one <br> line two', async () => {
    const output = await roundTrip('line one <br> line two\n')
    expect(output).toBe('line one <br> line two\n')
  })

  it('still folds a block-level <br> into a preserved empty paragraph', async () => {
    const output = await roundTrip('para one\n\n<br>\n\npara two\n')
    expect(output).toBe('para one\n\n<br />\n\npara two\n')
  })

  it.each([
    ['<br>', 'foo<br> bar\n'],
    ['<br/>', 'foo<br/> bar\n'],
    ['<br />', 'foo<br /> bar\n'],
    ['<br >', 'foo<br > bar\n'],
    ['<BR>', 'foo<BR> bar\n'],
    ['<br  />', 'foo<br  /> bar\n'],
  ] as const)('keeps sibling text around inline %s', async (_tag, input) => {
    const output = await roundTrip(input)
    expect(output).toBe(input)
  })

  it('keeps consecutive inline breaks in foo<br><br>bar', async () => {
    const output = await roundTrip('foo<br><br>bar\n')
    expect(output).toBe('foo<br><br>bar\n')
  })

  it('keeps a lone <br> inside an ATX heading', async () => {
    const output = await roundTrip('# <br>\n')
    expect(output).toBe('# <br>\n')
  })

  it('keeps a lone <br> inside a level-2 heading', async () => {
    const output = await roundTrip('## <br>\n')
    expect(output).toBe('## <br>\n')
  })

  it('keeps an inline <br> inside a heading with siblings', async () => {
    const output = await roundTrip('# title<br>more\n')
    expect(output).toBe('# title<br>more\n')
  })

  it('keeps a lone <br> inside a link', async () => {
    const output = await roundTrip('[<br>](https://example.com)\n')
    expect(output).toBe('[<br>](https://example.com)\n')
  })

  it('keeps an inline <br> between link text siblings', async () => {
    const output = await roundTrip('[foo<br>bar](https://example.com)\n')
    expect(output).toBe('[foo<br>bar](https://example.com)\n')
  })

  it('keeps a lone <br> inside emphasis', async () => {
    const output = await roundTrip('*<br>*\n')
    expect(output).toBe('*<br>*\n')
  })

  it('keeps a lone <br> inside strong', async () => {
    const output = await roundTrip('**<br>**\n')
    expect(output).toBe('**<br>**\n')
  })

  it('keeps an inline <br> between strong siblings', async () => {
    const output = await roundTrip('**foo<br>bar**\n')
    expect(output).toBe('**foo<br>bar**\n')
  })

  it('still preserves an empty line inside a blockquote', async () => {
    const output = await roundTrip('> foo\n>\n> <br>\n>\n> bar\n')
    expect(output).toBe('> foo\n>\n> <br />\n>\n> bar\n')
  })

  it('still preserves an empty line inside a list item', async () => {
    const output = await roundTrip('* foo\n\n  <br>\n\n  bar\n')
    expect(output).toBe('* foo\n\n  <br />\n\n  bar\n')
  })

  it('keeps an inline <br> inside a list item', async () => {
    const output = await roundTrip('* foo<br>bar\n')
    expect(output).toBe('* foo<br>bar\n')
  })

  it('keeps an inline <br> inside a blockquote', async () => {
    const output = await roundTrip('> foo<br>bar\n')
    expect(output).toBe('> foo<br>bar\n')
  })
})

// A trailing lone <br> is byte-identical to the serializer's own
// empty-line placeholder (documents saved by older versions routinely end
// with one), so it folds into an empty paragraph like everywhere else —
// which the trailing trim in `docSchema` then drops from the output.
describe('trailing <br> at the end of the document', () => {
  it('folds a trailing lone <br> into an empty paragraph', async () => {
    const output = await roundTrip('foo\n\n<br>\n')
    expect(output).toBe('foo\n')
  })

  it('loads a legacy trailing placeholder without a literal atom', async () => {
    await withEditor('foo\n\n<br />\n', (editor) =>
      editor.action((ctx) => {
        const doc = ctx.get(editorViewCtx).state.doc
        expect(doc.childCount).toBe(2)
        expect(doc.child(1).type.name).toBe('paragraph')
        expect(doc.child(1).content.size).toBe(0)
      })
    )
  })

  it('folds away a document that is only a <br>', async () => {
    const output = await roundTrip('<br>\n')
    expect(output).toBe('')
  })
})

// The serializer side: the last empty paragraph is the typing area and is
// skipped (by index, in `docSchema`), while empty paragraphs before
// content still serialize as placeholders.
describe('trailing empty paragraphs', () => {
  const serializeWithTrailingEmptyParagraphs = (
    markdown: string,
    count: number
  ) =>
    withEditor(markdown, (editor) =>
      editor.action((ctx) => {
        const view = ctx.get(editorViewCtx)
        const paragraph = view.state.schema.nodes.paragraph
        if (!paragraph) throw new Error('paragraph type missing')
        const empties = Array.from({ length: count }, () => paragraph.create())
        view.dispatch(
          view.state.tr.insert(view.state.doc.content.size, empties)
        )
        return getMarkdown()(ctx)
      })
    )

  it('skips only the last trailing empty paragraph', async () => {
    const output = await serializeWithTrailingEmptyParagraphs('foo\n', 2)
    expect(output).toBe('foo\n\n<br />\n')
  })

  it('round-trips its own output without artifacts', async () => {
    const output = await serializeWithTrailingEmptyParagraphs('foo\n', 2)
    expect(await roundTrip(output)).toBe('foo\n')
  })

  it('still emits a placeholder for an empty paragraph before content', async () => {
    const output = await roundTrip('<br />\n\ntext\n')
    expect(output).toBe('<br />\n\ntext\n')
  })

  // The trim works by index, so an empty paragraph that shares its node
  // instance with the trailing one must still serialize as a placeholder.
  it('is not confused by aliased empty paragraph instances', async () => {
    const output = await withEditor('a\n\n<br />\n\nb\n', (editor) =>
      editor.action((ctx) => {
        const view = ctx.get(editorViewCtx)
        const empty = view.state.doc.child(1)
        view.dispatch(view.state.tr.insert(view.state.doc.content.size, empty))
        return getMarkdown()(ctx)
      })
    )
    expect(output).toBe('a\n\n<br />\n\nb\n')
  })
})

// The placeholder matcher must treat every spelling of <br> alike;
// otherwise equivalent inputs produce different documents.
describe('placeholder spelling variants', () => {
  it.each(['<BR>', '<br  />', '<Br/>'])(
    'folds a block-level %s like <br>',
    async (tag) => {
      const output = await roundTrip(`para one\n\n${tag}\n\npara two\n`)
      expect(output).toBe('para one\n\n<br />\n\npara two\n')
    }
  )
})

// remarkPreserveEmptyLinePlugin is exported on its own, so it must not
// depend on remarkHtmlTransformer having wrapped block-level HTML first.
describe('standalone composition without remarkHtmlTransformer', () => {
  const roundTripStandalone = (markdown: string) =>
    roundTrip(markdown, schema, remarkPreserveEmptyLinePlugin)

  it('loads a block-level <br> without crashing', async () => {
    const output = await roundTripStandalone('para one\n\n<br />\n\npara two\n')
    expect(output).toBe('para one\n\n<br />\n\npara two\n')
  })

  it('folds a trailing lone <br> like the composed preset', async () => {
    const output = await roundTripStandalone('foo\n\n<br>\n')
    expect(output).toBe('foo\n')
  })
})
