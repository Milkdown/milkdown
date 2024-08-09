import type { Meta, StoryObj } from '@storybook/html'
import { basicDark } from '@uiw/codemirror-theme-basic'

import crepeDark from '@milkdown/crepe/theme/crepe-dark.css?inline'
import type { Args } from './setup'
import { longContent, setup, wikiContent } from './setup'

const meta: Meta = {
  title: 'Crepe/Crepe Dark',
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
      style: crepeDark,
      theme: basicDark,
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
