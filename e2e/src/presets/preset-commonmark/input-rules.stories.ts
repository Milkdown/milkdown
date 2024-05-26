import type { Meta, StoryObj } from '@storybook/html'
import { Editor, rootCtx } from '@milkdown/core'
import { nord } from '@milkdown/theme-nord'
import { commonmark } from '@milkdown/preset-commonmark'
import { history } from '@milkdown/plugin-history'

import { getMarkdown } from '@milkdown/utils'
import { expect, userEvent, waitFor, within } from '@storybook/test'

import '@milkdown/theme-nord/style.css'

import '../../style.css'

interface Args {
  instance: Editor
}

const meta: Meta<Args> = {
  title: 'Presets/Commonmark/Input Rules',
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

export const StrongByEmphasis: Story = {
  ...preset,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const getEditor = () => canvas.getByRole('textbox')

    await waitFor(() => expect(getEditor()).toBeInTheDocument())
    const editor = getEditor()
    await userEvent.click(editor)

    await expect(editor).toHaveFocus()
    await userEvent.keyboard('**Concorde flies in my room**')

    await expect(args.instance.action(getMarkdown())).toContain('**Concorde flies in my room**')
    await expect(canvasElement.querySelector('strong')).toHaveTextContent('Concorde flies in my room')
  },
}

export const StrongByUnderline: Story = {
  ...preset,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const getEditor = () => canvas.getByRole('textbox')

    await waitFor(() => expect(getEditor()).toBeInTheDocument())
    const editor = getEditor()
    await userEvent.click(editor)

    await expect(editor).toHaveFocus()
    await userEvent.keyboard('__Concorde flies in my room__')

    await expect(args.instance.action(getMarkdown())).toContain('__Concorde flies in my room__')
    await expect(canvasElement.querySelector('strong')).toHaveTextContent('Concorde flies in my room')
  },
}

export const ItalicByEmphasis: Story = {
  ...preset,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const getEditor = () => canvas.getByRole('textbox')

    await waitFor(() => expect(getEditor()).toBeInTheDocument())
    const editor = getEditor()
    await userEvent.click(editor)

    await expect(editor).toHaveFocus()
    await userEvent.keyboard('*Concorde flies in my room*')

    await expect(args.instance.action(getMarkdown())).toContain('*Concorde flies in my room*')
    await expect(canvasElement.querySelector('em')).toHaveTextContent('Concorde flies in my room')
  },
}

export const ItalicByUnderline: Story = {
  ...preset,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const getEditor = () => canvas.getByRole('textbox')

    await waitFor(() => expect(getEditor()).toBeInTheDocument())
    const editor = getEditor()
    await userEvent.click(editor)

    await expect(editor).toHaveFocus()
    await userEvent.keyboard('_Concorde flies in my room_')

    await expect(args.instance.action(getMarkdown())).toContain('_Concorde flies in my room_')
    await expect(canvasElement.querySelector('em')).toHaveTextContent('Concorde flies in my room')
  },
}
