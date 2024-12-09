import type { Meta, StoryObj } from '@storybook/html'
import { EditorStatus } from '@milkdown/kit/core'
import { listener, listenerCtx } from '@milkdown/kit/plugin/listener'
import { action } from '@storybook/addon-actions'

import type { CommonArgs } from '../utils/shadow'
import { setupMilkdown } from '../utils/shadow'
import style from './listener.css?inline'

const meta: Meta<CommonArgs> = {
  title: 'Plugins/Listener',
}

export default meta

type Story = StoryObj<CommonArgs>

export const Default: Story = {
  render: (args) => {
    const content = document.createElement('pre')
    content.classList.add('preview-content')
    const code = document.createElement('code')
    code.id = 'editorContent'
    code.dataset.testid = 'editorContent'
    const prevCode = document.createElement('code')
    prevCode.id = 'prevContent'
    prevCode.dataset.testid = 'prevContent'
    content.appendChild(prevCode)
    content.appendChild(code)

    return setupMilkdown([style], args, (editor, _, wrapper) => {
      editor
        .config((ctx) => {
          const listener = ctx.get(listenerCtx)
          listener.markdownUpdated((_, markdown, prevMarkdown) => {
            code.textContent = markdown
            prevCode.textContent = prevMarkdown
            action('markdown')({
              markdown: JSON.stringify(markdown),
              prevMarkdown: JSON.stringify(prevMarkdown),
            })
          })
        })
        .use(listener)

      editor.onStatusChange((status) => {
        if (status === EditorStatus.Created) wrapper.appendChild(content)
      })
    })
  },
  args: {
    defaultValue: '',
  },
}
