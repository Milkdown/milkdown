import { insertPos, getMarkdown } from '@milkdown/utils'
import { describe, expect, it } from 'vitest'

import { withEditor } from './test-utils'

// docs: editor.action(insertPos('Hello', 0)) inserts at the start of the doc.
// The block mode used to throw for every position in a top-level textblock
// and for every position between top-level blocks.
describe('insertPos block mode', () => {
  const source = 'first\n\n- item\n\nlast'

  async function run(pos: number, inline = false) {
    return withEditor(source, (editor) => {
      editor.action(insertPos('**NEW**', pos, inline))
      return editor.action(getMarkdown())
    })
  }

  it('inserts at the start of the document', async () => {
    expect(await run(0)).toBe('**NEW**\n\nfirst\n\n* item\n\nlast\n')
  })

  it('inserts after a top-level paragraph when pos is inside it', async () => {
    expect(await run(3)).toBe('first\n\n**NEW**\n\n* item\n\nlast\n')
    expect(await run(20)).toBe('first\n\n* item\n\nlast\n\n**NEW**\n')
  })

  it('inserts between top-level blocks at the given position', async () => {
    expect(await run(7)).toBe('first\n\n**NEW**\n\n* item\n\nlast\n')
  })

  it('keeps the nested behavior: after the list item parent', async () => {
    expect(await run(12)).toBe('first\n\n* item\n\n**NEW**\n\nlast\n')
  })

  it('keeps inline mode as is', async () => {
    expect(await run(3, true)).toBe('fi**NEW**rst\n\n* item\n\nlast\n')
  })
})
