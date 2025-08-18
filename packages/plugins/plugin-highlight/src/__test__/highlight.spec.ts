import '@testing-library/jest-dom/vitest'
import { defaultValueCtx, Editor, editorViewCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { createParser } from 'prosemirror-highlight/sugar-high'
import { expect, it } from 'vitest'

import { highlight, highlightPluginConfig } from '..'

function createEditor() {
  const parser = createParser()
  const editor = Editor.make()
  editor
    .config((ctx) => {
      ctx.set(highlightPluginConfig.key, { parser })
    })
    .use(commonmark)
    .use(highlight)
  return editor
}

const defaultValue = `
\`\`\`js
console.log('Hello, world!');
\`\`\`
`

it('should render highlighted code', async () => {
  const editor = createEditor()
  editor.config((ctx) => {
    ctx.set(defaultValueCtx, defaultValue)
  })

  await editor.create()

  const view = editor.ctx.get(editorViewCtx)
  const dom = view.dom

  const spans = dom.querySelectorAll('span')
  expect(spans).toMatchInlineSnapshot(`
    NodeList [
      <span
        class="sh__token--identifier"
        style="color: var(--sh-identifier);"
      >
        console
      </span>,
      <span
        class="sh__token--sign"
        style="color: var(--sh-sign);"
      >
        .
      </span>,
      <span
        class="sh__token--property"
        style="color: var(--sh-property);"
      >
        log
      </span>,
      <span
        class="sh__token--sign"
        style="color: var(--sh-sign);"
      >
        (
      </span>,
      <span
        class="sh__token--string"
        style="color: var(--sh-string);"
      >
        '
      </span>,
      <span
        class="sh__token--string"
        style="color: var(--sh-string);"
      >
        Hello, world!
      </span>,
      <span
        class="sh__token--string"
        style="color: var(--sh-string);"
      >
        '
      </span>,
      <span
        class="sh__token--sign"
        style="color: var(--sh-sign);"
      >
        )
      </span>,
      <span
        class="sh__token--sign"
        style="color: var(--sh-sign);"
      >
        ;
      </span>,
    ]
  `)
})
