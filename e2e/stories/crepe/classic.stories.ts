import type { Meta, StoryObj } from '@storybook/html'
import { basicLight } from '@uiw/codemirror-theme-basic'

import classic from '@milkdown/crepe/theme/classic.css?inline'
import type { Args } from './setup'
import { longContent, setup } from './setup'

const meta: Meta = {
  title: 'Crepe/Classic',
}

export default meta

type Story = StoryObj<Args>

const defaultArgs: Omit<Args, 'instance'> = {
  readonly: false,
  defaultValue: '',
  placeholder: 'Type / to use slash command',
  enableCodemirror: true,
}

export const Empty: Story = {
  render: (args) => {
    return setup({
      args,
      style: classic,
      theme: basicLight,
    })
  },
  args: {
    ...defaultArgs,
  },
}

export const WidthDefaultValue: Story = {
  ...Empty,
  args: {
    ...defaultArgs,
    defaultValue: longContent,
  },
}
