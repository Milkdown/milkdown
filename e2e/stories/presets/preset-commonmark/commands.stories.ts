import type { Meta, StoryObj } from '@storybook/html'
import { Editor, rootCtx } from '@milkdown/core'
import { nord } from '@milkdown/theme-nord'
import { commonmark, toggleEmphasisCommand, toggleStrongCommand } from '@milkdown/preset-commonmark'
import { history } from '@milkdown/plugin-history'

import { callCommand, getMarkdown } from '@milkdown/utils'
import { expect, userEvent, waitFor, within } from '@storybook/test'

interface Args {
  instance: Editor
}

const meta: Meta<Args> = {
  title: 'Presets/Commonmark/Commands',
}

export default meta

type Story = StoryObj<Args>

const preset: Story = {
  render: (args) => {
    const root = document.createElement('div')
    const editor = Editor.make()
      .config((ctx) => {
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

export const ToggleStrong: Story = {
  ...preset,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const getEditor = () => canvas.getByRole('textbox')

    await waitFor(() => expect(getEditor()).toBeInTheDocument())
    const editor = getEditor()
    await userEvent.click(editor)
    await expect(editor).toHaveFocus()

    args.instance.action(callCommand(toggleStrongCommand.key))
    const text = 'Concorde flies in my room'
    await userEvent.keyboard(text)

    await expect(args.instance.action(getMarkdown())).toContain(`**${text}**`)

    const strong = canvasElement.querySelector('strong') ?? undefined

    await expect(strong).toHaveTextContent(text)
    await userEvent.pointer([{ target: strong, offset: 0, keys: '[MouseLeft>]' }, { offset: text.length }])

    args.instance.action(callCommand(toggleStrongCommand.key))
    await expect(canvasElement.querySelector('strong')).toBeNull()

    args.instance.action(callCommand(toggleStrongCommand.key))
    await expect(canvasElement.querySelector('strong')).toBeInTheDocument()
  },
}

export const ToggleItalic: Story = {
  ...preset,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const getEditor = () => canvas.getByRole('textbox')

    await waitFor(() => expect(getEditor()).toBeInTheDocument())
    const editor = getEditor()
    await userEvent.click(editor)
    await expect(editor).toHaveFocus()

    args.instance.action(callCommand(toggleEmphasisCommand.key))
    const text = 'Concorde flies in my room'
    await userEvent.keyboard(text)

    await expect(args.instance.action(getMarkdown())).toContain(`*${text}*`)

    const em = canvasElement.querySelector('em') ?? undefined

    await expect(em).toHaveTextContent(text)
    await userEvent.pointer([{ target: em, offset: 0, keys: '[MouseLeft>]' }, { offset: text.length }])

    args.instance.action(callCommand(toggleEmphasisCommand.key))
    await expect(canvasElement.querySelector('em')).toBeNull()

    args.instance.action(callCommand(toggleEmphasisCommand.key))
    await expect(canvasElement.querySelector('em')).toBeInTheDocument()
  },
}
