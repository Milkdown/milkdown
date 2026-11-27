import { editorViewCtx } from '@milkdown/core'
import { insertPos, getMarkdown } from '@milkdown/utils'
import { describe, expect, it } from 'vitest'

import { withEditor } from './test-utils'

function run(source: string, markdown: string, pos: number, inline = false) {
  return withEditor(source, (editor) => {
    editor.action(insertPos(markdown, pos, inline))
    return editor.action(getMarkdown())
  })
}

describe('insertPos block mode', () => {
  // first: 0-7, bullet list: 7-17 (list item: 8-16), last: 17-23.
  const source = 'first\n\n- item\n\nlast'

  it('inserts at the start of the document', async () => {
    expect(await run(source, '**NEW**', 0)).toBe(
      '**NEW**\n\nfirst\n\n* item\n\nlast\n'
    )
  })

  it('inserts after a top-level textblock when pos is inside it', async () => {
    expect(await run(source, '**NEW**', 3)).toBe(
      'first\n\n**NEW**\n\n* item\n\nlast\n'
    )
    expect(await run(source, '**NEW**', 20)).toBe(
      'first\n\n* item\n\nlast\n\n**NEW**\n'
    )
  })

  it('inserts between top-level blocks at the given position', async () => {
    expect(await run(source, '**NEW**', 7)).toBe(
      'first\n\n**NEW**\n\n* item\n\nlast\n'
    )
  })

  it('inserts outside a container that can not hold the content', async () => {
    // At the start of the bullet list, before its first item.
    expect(await run(source, '**NEW**', 8)).toBe(
      'first\n\n**NEW**\n\n* item\n\nlast\n'
    )
    // At the end of the bullet list, after its last item.
    expect(await run(source, '**NEW**', 16)).toBe(
      'first\n\n* item\n\n**NEW**\n\nlast\n'
    )
  })

  it('inserts inside the list item holding pos', async () => {
    expect(await run(source, '**NEW**', 12)).toBe(
      'first\n\n* item\n\n  **NEW**\n\nlast\n'
    )
  })

  it('does not split a list when pos is in a middle item', async () => {
    expect(await run('1. a\n2. b\n\nend', 'NEW', 3)).toBe(
      '1. a\n\n   NEW\n2. b\n\nend\n'
    )
  })

  it('inserts inside the blockquote holding pos', async () => {
    expect(await run('> a\n>\n> b', 'NEW', 2)).toBe('> a\n>\n> NEW\n>\n> b\n')
    expect(await run('> a\n>\n> b', 'NEW', 4)).toBe('> a\n>\n> NEW\n>\n> b\n')
  })

  it('keeps the structure of the inserted blocks', async () => {
    expect(await run(source, '> quote', 0)).toBe(
      '> quote\n\nfirst\n\n* item\n\nlast\n'
    )
    expect(await run(source, '1. one\n2. two', 7)).toBe(
      'first\n\n1. one\n2. two\n\n* item\n\nlast\n'
    )
  })

  it('keeps the attributes of the inserted nodes', async () => {
    expect(await run('x', '![img](a.png)', 0)).toBe('![img](a.png)\n\nx\n')
  })

  it('replaces the empty paragraph of a new editor', async () => {
    const result = await withEditor('', (editor) => {
      editor.action(insertPos('Hello', 1))
      return editor.ctx.get(editorViewCtx).state.doc.toJSON()
    })
    expect(result).toEqual({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] },
      ],
    })
  })

  it('does nothing for empty markdown', async () => {
    expect(await run(source, '', 3)).toBe('first\n\n* item\n\nlast\n')
  })

  it('throws for a position outside the document', async () => {
    await expect(run(source, 'NEW', 99)).rejects.toThrow(RangeError)
  })
})

describe('insertPos inline mode', () => {
  it('inserts the markdown as inline content at pos', async () => {
    expect(await run('first\n\n- item\n\nlast', '**NEW**', 3, true)).toBe(
      'fi**NEW**rst\n\n* item\n\nlast\n'
    )
  })
})
