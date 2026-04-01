import type { Meta, StoryObj } from '@storybook/html'

import crepe from '@milkdown/crepe/theme/classic.css?inline'
import { basicLight } from '@uiw/codemirror-theme-basic'

import type { Args } from './setup'

import {
  hideDiffArgs,
  longContent,
  modifiedLongContent,
  setup,
  setupDiffReview,
  wikiContent,
} from './setup'

const meta: Meta = {
  title: 'Crepe/Crepe',
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
  enableTopBar: false,
  modifiedValue: '',
  enableDiff: false,
  language: 'EN',
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
  argTypes: hideDiffArgs,
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

export const DiffReview: Story = {
  render: (args) => {
    return setupDiffReview({ args, style: crepe, theme: basicLight })
  },
  args: {
    ...defaultArgs,
    defaultValue: longContent,
    modifiedValue: modifiedLongContent,
    enableDiff: true,
  },
}
