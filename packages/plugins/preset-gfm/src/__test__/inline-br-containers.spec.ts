import { describe, expect, it } from 'vitest'

import { countBrAtomsIn, roundTrip } from './test-utils'

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

  // A lone <br> in a table cell is user content. The serializer no longer
  // emits an empty-line placeholder inside cells (GFM serializes an empty
  // cell fine), so nothing needs to be folded there on load.
  it('keeps a lone <br> inside a table cell', async () => {
    const input = '| <br> | c |\n| --- | --- |\n| x | y |\n'
    expect(await countBrAtomsIn(input)).toBe(1)
    const output = await roundTrip(input)
    expect(output).toBe('| <br> | c |\n| ---- | - |\n| x    | y |\n')
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
  })

  it('keeps sibling text and an inline <br> inside a table cell', async () => {
    const input = '| a<br>b | c |\n| --- | --- |\n| x | y |\n'
    expect(await countBrAtomsIn(input)).toBe(1)
    const output = await roundTrip(input)
    expect(output).toBe('| a<br>b | c |\n| ------ | - |\n| x      | y |\n')
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
