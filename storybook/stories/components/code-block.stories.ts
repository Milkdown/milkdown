import type { Meta, StoryObj } from '@storybook/html'

import { defaultKeymap } from '@codemirror/commands'
import { languages } from '@codemirror/language-data'
import { oneDark } from '@codemirror/theme-one-dark'
import { keymap } from '@codemirror/view'
import {
  codeBlockComponent,
  codeBlockConfig,
} from '@milkdown/kit/component/code-block'
import { basicSetup } from 'codemirror'

import type { CommonArgs } from '../utils/shadow'

import { setupMilkdown } from '../utils/shadow'
import style from './code-block.css?inline'

const meta: Meta = {
  title: 'Components/Code Block',
}

export default meta

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
            renderLanguage: (language, selected) =>
              `${selected ? '✓' : '   '} ${language}`,
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

export const Preview: StoryObj<CommonArgs> = {
  render: (args) => {
    return setupMilkdown([style], args, (editor) => {
      editor
        .config((ctx) => {
          ctx.update(codeBlockConfig.key, (defaultConfig) => ({
            ...defaultConfig,
            languages,
            extensions: [basicSetup, oneDark, keymap.of(defaultKeymap)],
            renderLanguage: (language, selected) =>
              `${selected ? '✓' : '   '} ${language}`,
            renderPreview: (language, content, applyPreview) => {
              // async rendering
              if (language === 'JavaScript') {
                setTimeout(() => {
                  applyPreview(`<div>Preview: ${content}</div>`)
                }, 1000)
                return
              }

              // sync rendering
              if (language === 'TypeScript') {
                return `<div>Preview: ${content}</div>`
              }

              // no preview
              return null
            },
            previewToggleButton: (previewOnlyMode) =>
              previewOnlyMode ? '|🪖Show' : '|🫥Hide',
            previewLoading: 'Preview Rendering...',
          }))
        })
        .use(codeBlockComponent)
    })
  },
  args: {
    defaultValue: `
# Code Block

\`\`\`JavaScript
const a = 1;
\`\`\`

\`\`\`TypeScript
function () {}
\`\`\`

\`\`\`css
h {}
\`\`\`
`,
    readonly: true,
  },
}
