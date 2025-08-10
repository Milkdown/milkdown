import '@testing-library/jest-dom/vitest'
import { Editor, editorViewCtx } from '@milkdown/core'
import { getMarkdown } from '@milkdown/utils'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'

import { commonmark } from '..'

function createEditor() {
  const editor = Editor.make()
  editor.use(commonmark)
  return editor
}

it(`should handle trailing space`, async () => {
  const user = userEvent.setup()
  const editor = createEditor()

  await editor.create()

  const view = editor.ctx.get(editorViewCtx)

  await user.type(view.dom, 'word ')

  const markdown = editor.action(getMarkdown())
  expect(markdown).toBe('word \n')
})
