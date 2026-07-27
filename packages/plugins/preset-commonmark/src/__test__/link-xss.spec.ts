import '@testing-library/jest-dom/vitest'
import { defaultValueCtx, Editor, editorViewCtx } from '@milkdown/core'
import { expect, it } from 'vitest'

import { commonmark } from '..'

async function renderMarkdown(markdown: string) {
  const editor = Editor.make()
  editor.use(commonmark)
  editor.config((ctx) => {
    ctx.set(defaultValueCtx, markdown)
  })
  await editor.create()
  return editor.ctx.get(editorViewCtx)
}

it('neutralizes a javascript: href when rendering a link', async () => {
  const view = await renderMarkdown(
    '[Click me](javascript:alert(document.cookie))'
  )

  const anchor = view.dom.querySelector('a')
  expect(anchor).toBeInTheDocument()
  // The malicious scheme must not survive into a real, clickable anchor.
  expect(anchor?.getAttribute('href')).toBe('')
})

it('preserves safe hrefs when rendering a link', async () => {
  const view = await renderMarkdown('[Click me](https://example.com/path)')

  const anchor = view.dom.querySelector('a')
  expect(anchor?.getAttribute('href')).toBe('https://example.com/path')
})
