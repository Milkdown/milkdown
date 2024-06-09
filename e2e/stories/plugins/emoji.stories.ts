import type { Meta, StoryObj } from '@storybook/html'
import { emoji } from '@milkdown/plugin-emoji'
import type { CommonArgs } from '../utils/shadow'
import { setupMilkdown } from '../utils/shadow'

const meta: Meta<CommonArgs> = {
  title: 'Plugins/Emoji',
}

export default meta

type Story = StoryObj<CommonArgs>

const defaultValue = `
Raw: 🫥

Shortcut: :+1:
`

export const Default: Story = {
  render: (args) => {
    return setupMilkdown([], args, (editor) => {
      editor.use(emoji)
    })
  },
  args: {
    defaultValue,
  },
}
