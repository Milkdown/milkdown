import type { Meta, StoryObj } from '@storybook/html'
import { Editor, rootCtx } from '@milkdown/core'
import { nord } from '@milkdown/theme-nord'
import { commonmark } from '@milkdown/preset-commonmark'
import { history } from '@milkdown/plugin-history'

import { getMarkdown } from '@milkdown/utils'
import { expect, userEvent, waitFor, within } from '@storybook/test'

import '@milkdown/theme-nord/style.css'

import '../../../src/style.css'
import { pressMod } from '../../../src/misc'

interface Args {
  instance: Editor
}

const meta: Meta<Args> = {
  title: 'Presets/Commonmark/Shortcut',
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

export const StrongByKeyboard: Story = {
  ...preset,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const getEditor = () => canvas.getByRole('textbox')

    await waitFor(() => expect(getEditor()).toBeInTheDocument())
    const editor = getEditor()
    await userEvent.click(editor)

    await expect(editor).toHaveFocus()

    await userEvent.keyboard(pressMod('b'))

    const text = 'Concorde flies in my room'
    await userEvent.keyboard(text)

    await expect(args.instance.action(getMarkdown())).toContain(`**${text}**`)

    const strong = canvasElement.querySelector('strong')

    await expect(strong).toHaveTextContent(text)
    await userEvent.pointer([{ target: strong as HTMLElement, offset: 0, keys: '[MouseLeft>]' }, { offset: text.length }])

    await userEvent.keyboard(pressMod('b'))

    await expect(canvasElement.querySelector('strong')).toBeNull()
  },
}

export const ItalicByKeyboard: Story = {
  ...preset,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const getEditor = () => canvas.getByRole('textbox')

    await waitFor(() => expect(getEditor()).toBeInTheDocument())
    const editor = getEditor()
    await userEvent.click(editor)

    await expect(editor).toHaveFocus()

    await userEvent.keyboard(pressMod('i'))

    const text = 'Concorde flies in my room'
    await userEvent.keyboard(text)

    await expect(args.instance.action(getMarkdown())).toContain(`*${text}*`)

    const strong = canvasElement.querySelector('em')

    await expect(strong).toHaveTextContent(text)
    await userEvent.pointer([{ target: strong as HTMLElement, offset: 0, keys: '[MouseLeft>]' }, { offset: text.length }])

    await userEvent.keyboard(pressMod('i'))

    await expect(canvasElement.querySelector('em')).toBeNull()
  },
}
