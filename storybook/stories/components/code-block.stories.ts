import type { Meta, StoryObj } from '@storybook/html'
import {
  codeBlockComponent,
  codeBlockConfig,
} from '@milkdown/kit/component/code-block'
import { oneDark } from '@codemirror/theme-one-dark'
import { languages } from '@codemirror/language-data'
import { basicSetup } from 'codemirror'
import { defaultKeymap } from '@codemirror/commands'
import { keymap } from '@codemirror/view'
import { html } from 'atomico'

import type { CommonArgs } from '../utils/shadow'
import { setupMilkdown } from '../utils/shadow'
import style from './code-block.css?inline'

const meta: Meta = {
  title: 'Components/Code Block',
}

export default meta

const check = html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="w-6 h-6"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M4.5 12.75l6 6 9-13.5"
    />
  </svg>
`

const markdown = `
# Code Block

\`\`\`javascript
const a = 1;
\`\`\`
`

export const Javascript: StoryObj<CommonArgs> = {
  render: (args) => {
    return setupMilkdown([style], args, (editor) => {
      editor
        .config((ctx) => {
          ctx.update(codeBlockConfig.key, (defaultConfig) => ({
            ...defaultConfig,
            languages,
            extensions: [basicSetup, oneDark, keymap.of(defaultKeymap)],
            renderLanguage: (language, selected) => {
              return html`<span class="leading">${selected ? check : null}</span
                >${language}`
            },
          }))
        })
        .use(codeBlockComponent)
    })
  },
  args: {
    defaultValue: markdown,
    readonly: false,
  },
}
