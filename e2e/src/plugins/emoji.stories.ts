import type { Meta, StoryObj } from '@storybook/html'
import { Editor, defaultValueCtx, rootCtx } from '@milkdown/core'
import { nord } from '@milkdown/theme-nord'
import { commonmark } from '@milkdown/preset-commonmark'
import { history } from '@milkdown/plugin-history'
import { emoji } from '@milkdown/plugin-emoji'

import '@milkdown/theme-nord/style.css'

import '../style.css'

interface Args {
  enableInspector: boolean
  defaultValue: string
  instance: Editor
}

const meta: Meta<Args> = {
  title: 'Plugins/Emoji',
}

export default meta

type Story = StoryObj<Args>

const defaultValue = `
Raw: 🫥

Shortcut: :+1:
`

export const Default: Story = {
  render: (args) => {
    const root = document.createElement('div')
    const editor = Editor.make()
      .enableInspector(args.enableInspector ?? false)
      .config((ctx) => {
        ctx.set(defaultValueCtx, args.defaultValue ?? '')
        ctx.set(rootCtx, root)
      })
      .config(nord)
      .use(commonmark)
      .use(history)
      .use(emoji)
      .create()

    editor.then((instance) => {
      args.instance = instance
    })

    return root
  },
  args: {
    defaultValue,
  },
}
