import type { Meta, StoryObj } from '@storybook/html'

import frameDark from '@milkdown/crepe/theme/frame-dark.css?inline'
import { basicDark } from '@uiw/codemirror-theme-basic'

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
  title: 'Crepe/Frame Dark',
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
  language: 'EN',
  modifiedValue: '',
  enableDiff: false,
}

export const Empty: Story = {
  render: (args) => {
    return setup({
      args,
      style: frameDark,
      theme: basicDark,
    })
  },
  argTypes: hideDiffArgs,
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

export const DiffReview: Story = {
  render: (args) => {
    return setupDiffReview({ args, style: frameDark, theme: basicDark })
  },
  args: {
    ...defaultArgs,
    defaultValue: longContent,
    modifiedValue: modifiedLongContent,
    enableDiff: true,
  },
}
