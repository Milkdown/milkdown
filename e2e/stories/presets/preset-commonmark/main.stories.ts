import type { Meta, StoryObj } from '@storybook/html'
import { Editor, defaultValueCtx, rootCtx } from '@milkdown/core'
import { nord } from '@milkdown/theme-nord'
import { commonmark } from '@milkdown/preset-commonmark'
import { history } from '@milkdown/plugin-history'
import { expect, userEvent, waitFor, within } from '@storybook/test'

import '@milkdown/theme-nord/style.css'

import '../../../src/style.css'

interface Args {
  enableInspector: boolean
  defaultValue: string
  instance: Editor
}

const meta: Meta<Args> = {
  title: 'Presets/Commonmark/Main',
}

export default meta

type Story = StoryObj<Args>

export const Empty: Story = {
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
      .create()

    editor.then((instance) => {
      args.instance = instance
    })

    return root
  },
}

const defaultValue = `
# Milkdown

> A WYSIWYG markdown editor

[Milkdown](https://milkdown.dev) is a **WYSIWYG markdown editor** that provides a clean and simple writing experience.
`

export const WithDefaultValue: Story = {
  ...Empty,
  args: {
    defaultValue: defaultValue.trim(),
  },
}

export const WithInspector: Story = {
  ...Empty,
  args: {
    enableInspector: true,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const getEditor = () => canvas.getByRole('textbox')

    await waitFor(() => expect(getEditor()).toBeInTheDocument())
    const editor = getEditor()
    await userEvent.click(editor)
    await expect(editor).toHaveFocus()

    await expect(args.instance.inspect().length).toBeGreaterThan(0)
  },
}
