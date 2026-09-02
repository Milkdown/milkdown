import { editorViewCtx } from '@milkdown/core'
import { getMarkdown } from '@milkdown/utils'
import { describe, expect, it } from 'vitest'

import { countBrAtomsIn, roundTrip, withEditor } from './test-utils'

describe('inline br in gfm containers', () => {
  it('does not drop a footnote whose definition has a block <br>', async () => {
    const input = '[^note]: foo\n\n    <br />\n\n    bar\n\n'
    const output = await roundTrip(input)
    expect(output).toBe('[^note]: foo\n\n    <br />\n\n    bar\n')
  })

  it('keeps a referenced footnote whose definition has a block <br>', async () => {
    const input = 'See [^note].\n\n[^note]: foo\n\n    <br />\n\n    bar\n\n'
    const output = await roundTrip(input)
    expect(output).toBe(
      'See [^note].\n\n[^note]: foo\n\n    <br />\n\n    bar\n'
    )
  })

  it('keeps an inline <br> inside a footnote definition', async () => {
    const output = await roundTrip('[^note]: foo<br>bar\n')
    expect(output).toBe('[^note]: foo<br>bar\n')
  })

  // A lone <br> in a table cell is byte-identical to the placeholder the
  // old serializer emitted for every empty cell, so it folds into an
  // empty cell; the serializer no longer emits placeholders inside cells.
  it('folds a lone table-cell <br> into an empty cell', async () => {
    const input = '| <br> | c |\n| --- | --- |\n| x | y |\n'
    expect(await countBrAtomsIn(input)).toBe(0)
    const output = await roundTrip(input)
    expect(output).toBe('|   | c |\n| - | - |\n| x | y |\n')
  })

  it('loads a legacy empty-cell placeholder as an empty cell', async () => {
    const input = '| <br /> | c |\n| --- | --- |\n| x | y |\n'
    expect(await countBrAtomsIn(input)).toBe(0)
    const output = await roundTrip(input)
    expect(output).toBe('|   | c |\n| - | - |\n| x | y |\n')
  })

  it('round-trips an empty table cell without a placeholder', async () => {
    const input = '|  | c |\n| --- | --- |\n| x | y |\n'
    const output = await roundTrip(input)
    expect(output).toBe('|   | c |\n| - | - |\n| x | y |\n')
    expect(output).not.toContain('<br')
  })

  it('keeps consecutive <br>s inside a table cell as atoms', async () => {
    const input = '| <br><br> | c |\n| --- | --- |\n| x | y |\n'
    expect(await countBrAtomsIn(input)).toBe(2)
    const output = await roundTrip(input)
    expect(output).toBe(
      '| <br><br> | c |\n| -------- | - |\n| x        | y |\n'
    )
  })

  it('keeps sibling text and an inline <br> inside a table cell', async () => {
    const input = '| a<br>b | c |\n| --- | --- |\n| x | y |\n'
    expect(await countBrAtomsIn(input)).toBe(1)
    const output = await roundTrip(input)
    expect(output).toBe('| a<br>b | c |\n| ------ | - |\n| x      | y |\n')
  })

  // An HTML paste can put a trailing hardbreak in a cell. The
  // serializer drops it, the same as the paragraph serializer does.
  // Otherwise it renders as a trailing space that the next parse trims,
  // and two consecutive saves diverge.
  it('drops a trailing hardbreak in a cell so saves stay stable', async () => {
    const output = await withEditor(
      '| a | c |\n| --- | --- |\n| x | y |\n',
      (editor) =>
        editor.action((ctx) => {
          const view = ctx.get(editorViewCtx)
          const { state } = view
          const hardbreak = state.schema.nodes.hardbreak
          if (!hardbreak) throw new Error('hardbreak type missing')
          let pos = -1
          state.doc.descendants((node, nodePos) => {
            if (
              pos === -1 &&
              node.type.name === 'paragraph' &&
              node.textContent === 'a'
            )
              pos = nodePos + node.nodeSize - 1
            return pos === -1
          })
          view.dispatch(state.tr.insert(pos, hardbreak.create()))
          return getMarkdown()(ctx)
        })
    )
    expect(output).toBe('| a | c |\n| - | - |\n| x | y |\n')
  })

  it('keeps a lone <br> inside strikethrough', async () => {
    const output = await roundTrip('~~<br>~~\n')
    expect(output).toBe('~~<br>~~\n')
  })

  it('keeps an inline <br> inside a task list item', async () => {
    const output = await roundTrip('- [ ] foo<br>bar\n')
    expect(output).toBe('* [ ] foo<br>bar\n')
  })
})
