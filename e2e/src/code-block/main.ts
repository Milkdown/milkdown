/* Copyright 2021, Milkdown by Mirone. */

import { Editor, defaultValueCtx, rootCtx } from '@milkdown/core'
import { nord } from '@milkdown/theme-nord'
import { commonmark } from '@milkdown/preset-commonmark'
import { codeBlockComponent } from '@milkdown/components/code-block'

import { setup } from '../utils'

import '@milkdown/theme-nord/style.css'

import '../style.css'

const markdown = `
# Code Block

\`\`\`javascript
const a = 1;
\`\`\`
`

setup(() => {
  return Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, document.getElementById('app'))
      ctx.set(defaultValueCtx, markdown)
    })
    .config(nord)
    .use(commonmark)
    .use(codeBlockComponent)
    .create()
})
