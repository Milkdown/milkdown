/* Copyright 2021, Milkdown by Mirone. */

import { Editor, defaultValueCtx, rootCtx } from '@milkdown/core'
import { nord } from '@milkdown/theme-nord'
import { commonmark } from '@milkdown/preset-commonmark'
import { codeBlockComponent, codeBlockConfig } from '@milkdown/components/code-block'
import { oneDark } from '@codemirror/theme-one-dark'
import { languages } from '@codemirror/language-data'
import { basicSetup } from '@codemirror/basic-setup'
import { defaultKeymap } from '@codemirror/commands'
import { keymap } from '@codemirror/view'

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
      ctx.update(codeBlockConfig.key, defaultConfig => ({
        ...defaultConfig,
        languages,
        extensions: [basicSetup, oneDark, keymap.of(defaultKeymap)],
      }))
    })
    .config(nord)
    .use(commonmark)
    .use(codeBlockComponent)
    .create()
})
