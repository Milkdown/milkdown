/* Copyright 2021, Milkdown by Mirone. */

import { Editor, defaultValueCtx, rootCtx } from '@milkdown/core'
import { nord } from '@milkdown/theme-nord'
import { commonmark } from '@milkdown/preset-commonmark'
import { codeBlockComponent, codeBlockConfig } from '@milkdown/components/code-block'
import { oneDark } from '@codemirror/theme-one-dark'
import { languages } from '@codemirror/language-data'
import { basicSetup } from 'codemirror'
import { defaultKeymap } from '@codemirror/commands'
import { keymap } from '@codemirror/view'
import { html } from 'atomico'

import { setup } from '../utils'

import '@milkdown/theme-nord/style.css'

import '../style.css'

import './style.css'

const markdown = `
# Code Block

\`\`\`javascript
const a = 1;
\`\`\`
`

const check = html`
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
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
        renderLanguage: (language, selected) => {
          return html`<span class="leading">${selected ? check : null}</span>${language}`
        },
      }))
    })
    .config(nord)
    .use(commonmark)
    .use(codeBlockComponent)
    .create()
})
