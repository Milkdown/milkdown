import { defaultValueCtx, Editor, editorViewCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import '@testing-library/jest-dom/vitest'
import { test, expect } from 'vitest'

import { emoji } from '.'

test('show normal emoji', async () => {
  const editor = Editor.make()
    .config((ctx) => {
      ctx.set(defaultValueCtx, 'Emoji :+1:')
    })
    .use(commonmark)
    .use(emoji)

  await editor.create()

  const view = editor.ctx.get(editorViewCtx)
  expect(view.dom.querySelector('[data-type="emoji"]')).toBeInTheDocument()
})

test('show emoji not in twemoji', async () => {
  const editor = Editor.make()
    .config((ctx) => {
      ctx.set(
        defaultValueCtx,
        "HTML entities should render as symbols (™, ©, etc.) regardless of the emoji plugin's presence."
      )
    })
    .use(commonmark)
    .use(emoji)

  await editor.create()

  const view = editor.ctx.get(editorViewCtx)
  // ™ and ©
  expect(view.dom.querySelectorAll('[data-type="emoji"]')).toHaveLength(2)
})
