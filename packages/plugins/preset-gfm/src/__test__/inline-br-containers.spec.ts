import { describe, expect, it } from 'vitest'

import { countBrAtoms, createEditor, roundTrip } from './test-utils'

describe('inline br in gfm containers', () => {
  it('does not drop a footnote whose serializer emitted a block <br>', async () => {
    const input = '[^note]: foo\n\n    <br />\n\n    bar\n\n'
    const output = await roundTrip(input)
    expect(output).toContain('[^note]')
    expect(output).toMatch(/foo[\s\S]*<br \/>[\s\S]*bar/)
  })

  it('keeps a referenced footnote whose definition has a block <br>', async () => {
    const input = 'See [^note].\n\n[^note]: foo\n\n    <br />\n\n    bar\n\n'
    const output = await roundTrip(input)
    expect(output).toContain('See')
    expect(output).toContain('[^note]')
    expect(output).toMatch(/foo[\s\S]*<br \/>[\s\S]*bar/)
  })

  it('keeps an inline <br> inside a footnote definition', async () => {
    const output = await roundTrip('[^note]: foo<br>bar\n')
    expect(output).toContain('[^note]')
    expect(output).toContain('foo<br>bar')
  })

  // A lone <br> in a table cell is indistinguishable from the serializer's
  // empty-cell placeholder (cell paragraphs are flattened in mdast), so it
  // is folded into an empty cell by design. The text round-trip is stable
  // either way, which is why this test pins the document model too.
  it('still treats a lone table-cell <br> as an empty-line placeholder', async () => {
    const input = '| <br> | c |\n| --- | --- |\n| x | y |\n'
    const editor = await createEditor(input)
    expect(countBrAtoms(editor)).toBe(0)
    const output = await roundTrip(input)
    expect(output).toMatch(/\|/)
    expect(output).toContain('c')
    expect(output).toContain('x')
    expect(output).toContain('y')
  })

  it('keeps consecutive <br>s inside a table cell as atoms', async () => {
    const input = '| <br><br> | c |\n| --- | --- |\n| x | y |\n'
    const editor = await createEditor(input)
    expect(countBrAtoms(editor)).toBe(2)
  })

  it('keeps sibling text and an inline <br> inside a table cell', async () => {
    const input = '| a<br>b | c |\n| --- | --- |\n| x | y |\n'
    const editor = await createEditor(input)
    expect(countBrAtoms(editor)).toBe(1)
    const output = await roundTrip(input)
    expect(output).toContain('a<br>b')
    expect(output).toContain('c')
  })

  it('keeps a lone <br> inside strikethrough', async () => {
    const output = await roundTrip('~~<br>~~\n')
    expect(output).toContain('<br>')
    expect(output).toMatch(/~~|<del>/)
  })

  it('keeps an inline <br> inside a task list item', async () => {
    const output = await roundTrip('- [ ] foo<br>bar\n')
    expect(output).toContain('foo<br>bar')
    expect(output).toMatch(/\[ \]|\[x\]/i)
  })
})
