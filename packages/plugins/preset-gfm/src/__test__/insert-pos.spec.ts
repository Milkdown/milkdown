import { insertPos, getMarkdown } from '@milkdown/utils'
import { describe, expect, it } from 'vitest'

import { withEditor } from './test-utils'

function run(source: string, markdown: string, pos: number) {
  return withEditor(source, (editor) => {
    editor.action(insertPos(markdown, pos))
    return editor.action(getMarkdown())
  })
}

describe('insertPos block mode with gfm', () => {
  const table = '| a | b |\n| - | - |\n| c | d |'

  it('inserts after the table when pos is inside a cell', async () => {
    const expected = '| a | b |\n| - | - |\n| c | d |\n\nNEW\n'
    // Inside the header cell `a`.
    expect(await run(table, 'NEW', 4)).toBe(expected)
    // Inside the body cell `c`.
    expect(await run(table, 'NEW', 16)).toBe(expected)
  })

  it('inserts before the table when pos is at its start', async () => {
    expect(await run(table, 'NEW', 1)).toBe(
      'NEW\n\n| a | b |\n| - | - |\n| c | d |\n'
    )
  })

  it('keeps the alignment of an inserted table', async () => {
    expect(await run('x', '| x | y |\n| - | - |\n| 1 | 2 |', 0)).toBe(
      '| x | y |\n| - | - |\n| 1 | 2 |\n\nx\n'
    )
  })

  it('keeps the structure of an inserted task list', async () => {
    expect(await run('x', '- [ ] t1\n- [ ] t2', 0)).toBe(
      '* [ ] t1\n* [ ] t2\n\nx\n'
    )
  })

  it('does not split a task list when pos is in a middle item', async () => {
    expect(await run('- [ ] task\n- [x] done', 'NEW', 3)).toBe(
      '* [ ] task\n\n  NEW\n* [x] done\n'
    )
  })
})
