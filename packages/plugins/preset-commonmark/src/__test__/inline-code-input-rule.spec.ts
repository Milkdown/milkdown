import '@testing-library/jest-dom/vitest'
import { Editor, editorViewCtx } from '@milkdown/core'
import { getMarkdown } from '@milkdown/utils'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { commonmark } from '..'

async function createEditor() {
  const editor = Editor.make()
  editor.use(commonmark)
  await editor.create()
  return editor
}

function textWithMark(editor: Editor, markName: string) {
  const result: string[] = []
  editor.ctx.get(editorViewCtx).state.doc.descendants((node) => {
    if (node.marks.some((mark) => mark.type.name === markName))
      result.push(node.text ?? '')
  })
  return result
}

describe('mark input rules around inline code', () => {
  it('does not use a delimiter from inline code to create emphasis', async () => {
    const user = userEvent.setup()
    const editor = await createEditor()
    const view = editor.ctx.get(editorViewCtx)

    await user.type(view.dom, '`*_mm`and`*')

    expect(textWithMark(editor, 'inlineCode')).toEqual(['*_mm'])
    expect(textWithMark(editor, 'emphasis')).toEqual([])

    await user.type(view.dom, '_nn`')

    expect(textWithMark(editor, 'inlineCode')).toEqual(['*_mm', '*_nn'])
    expect(textWithMark(editor, 'emphasis')).toEqual([])
    expect(editor.action(getMarkdown())).toBe('`*_mm`and`*_nn`\n')
  })

  it.each(['*`code`*', '**`code`**', '*a `code` b*'])(
    'still creates an outer mark for %s',
    async (markdown) => {
      const user = userEvent.setup()
      const editor = await createEditor()

      await user.type(editor.ctx.get(editorViewCtx).dom, markdown)

      expect(editor.action(getMarkdown())).toBe(`${markdown}\n`)
    }
  )
})
