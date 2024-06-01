import type { Meta, StoryObj } from '@storybook/html'
import { Editor, defaultValueCtx, rootCtx } from '@milkdown/core'
import { nord } from '@milkdown/theme-nord'
import { commonmark } from '@milkdown/preset-commonmark'
import { history } from '@milkdown/plugin-history'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { expect, userEvent, waitFor, within } from '@storybook/test'

import '@milkdown/theme-nord/style.css'

import '../../src/style.css'
import './listener.css'

interface Args {
  enableInspector: boolean
  defaultValue: string
  instance: Editor
}

const meta: Meta<Args> = {
  title: 'Plugins/Listener',
}

export default meta

type Story = StoryObj<Args>

export const Default: Story = {
  render: (args) => {
    const root = document.createElement('div')
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
    const editor = Editor.make()
      .enableInspector(args.enableInspector ?? false)
      .config((ctx) => {
        ctx.set(defaultValueCtx, args.defaultValue ?? '')
        ctx.set(rootCtx, root)
        const listener = ctx.get(listenerCtx)
        listener.markdownUpdated((_, markdown, prevMarkdown) => {
          code.textContent = markdown
          prevCode.textContent = prevMarkdown
        })
      })
      .config(nord)
      .use(commonmark)
      .use(history)
      .use(listener)
      .create()

    editor.then((instance) => {
      args.instance = instance
      root.appendChild(content)
    })

    return root
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const getEditor = () => canvas.getByRole('textbox')
    await waitFor(() => expect(getEditor()).toBeInTheDocument())

    const editor = getEditor()
    await userEvent.click(editor)
    await userEvent.keyboard('**Concorde flies in my room**')

    await waitFor(() => expect(canvas.getByTestId('editorContent')).toHaveTextContent('**Concorde flies in my room**'))
    await expect(canvas.getByTestId('prevContent')).toHaveTextContent('\\*\\*Concorde flies in my room\\*')
  },
}
