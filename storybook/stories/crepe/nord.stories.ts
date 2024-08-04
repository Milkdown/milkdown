import type { Meta, StoryObj } from '@storybook/html'
import { basicLight } from '@uiw/codemirror-theme-basic'

import nord from '@milkdown/crepe/theme/nord.css?inline'
import type { Args } from './setup'
import { longContent, setup, wikiContent } from './setup'

const meta: Meta = {
  title: 'Crepe/Nord',
  argTypes: {
    language: {
      options: ['EN', 'JA'],
      control: { type: 'radio' },
    },
  },
}

export default meta

type Story = StoryObj<Args>

const defaultArgs: Omit<Args, 'instance'> = {
  readonly: false,
  defaultValue: '',
  enableCodemirror: true,
  language: 'EN',
}

export const Empty: Story = {
  render: (args) => {
    return setup({
      args,
      style: nord,
      theme: basicLight,
    })
  },
  args: {
    ...defaultArgs,
  },
}

export const WithDefaultValue: Story = {
  ...Empty,
  args: {
    ...defaultArgs,
    defaultValue: longContent,
  },
}

export const WikiValue: Story = {
  ...Empty,
  args: {
    ...defaultArgs,
    defaultValue: wikiContent,
  },
}
