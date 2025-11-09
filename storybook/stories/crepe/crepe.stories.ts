import type { Meta, StoryObj } from '@storybook/html'

import crepe from '@milkdown/crepe/theme/crepe.css?inline'
import { basicLight } from '@uiw/codemirror-theme-basic'

import type { Args } from './setup'

import { longContent, setup, wikiContent } from './setup'

const meta: Meta = {
  title: 'Crepe/Crepe',
  argTypes: {
    language: {
      options: ['EN', 'JA'],
      control: { type: 'radio' },
    },
    toolbarMode: {
      options: ['floating', 'top'],
      control: { type: 'radio' },
      description: 'Toolbar display mode: floating (appears on selection) or top (fixed at top)',
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
  toolbarMode: 'floating',
}

export const Empty: Story = {
  render: (args) => {
    return setup({
      args,
      style: crepe,
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

export const WithTopToolbar: Story = {
  ...Empty,
  args: {
    ...defaultArgs,
    toolbarMode: 'top',
    defaultValue: longContent,
  },
}
