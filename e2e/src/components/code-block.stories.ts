import type { Meta, StoryObj } from '@storybook/html'
import { Editor, defaultValueCtx, editorViewOptionsCtx, rootCtx } from '@milkdown/core'
import { nord } from '@milkdown/theme-nord'
import { commonmark } from '@milkdown/preset-commonmark'
import { history } from '@milkdown/plugin-history'
import { codeBlockComponent, codeBlockConfig } from '@milkdown/components/code-block'
import { oneDark } from '@codemirror/theme-one-dark'
import { languages } from '@codemirror/language-data'
import { basicSetup } from 'codemirror'
import { defaultKeymap } from '@codemirror/commands'
import { keymap } from '@codemirror/view'
import { html } from 'atomico'

import '@milkdown/theme-nord/style.css'
import '../style.css'
import './code-block.css'

const meta: Meta = {
  title: 'Components/Code Block',
}

export default meta

const check = html`
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
`

interface Args {
  defaultValue: string
  readonly: boolean
}

const markdown = `
# Code Block

\`\`\`javascript
const a = 1;
\`\`\`
`

export const Javascript: StoryObj<Args> = {
  render: (args) => {
    const root = document.createElement('div')
    root.classList.add('milkdown-storybook')
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root)
        ctx.set(defaultValueCtx, args.defaultValue)
        ctx.set(editorViewOptionsCtx, {
          editable: () => !args.readonly,
        })
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
      .use(history)
      .create()

    return root
  },
  args: {
    defaultValue: markdown,
    readonly: false,
  },
}
