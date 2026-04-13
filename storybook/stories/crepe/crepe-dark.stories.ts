import type { Meta, StoryObj } from '@storybook/html'

import crepeDark from '@milkdown/crepe/theme/classic-dark.css?inline'
import { basicDark } from '@uiw/codemirror-theme-basic'

import type { Args } from './setup'

import {
  hideDiffArgs,
  longContent,
  modifiedLongContent,
  setup,
  setupDiffReview,
  setupAIDemo,
  setupStreamingDemo,
  wikiContent,
} from './setup'

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
  enableTopBar: false,
  language: 'EN',
  modifiedValue: '',
  enableAI: false,
}

export const Empty: Story = {
  render: (args) => {
    return setup({
      args,
      style: crepeDark,
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
    return setupDiffReview({ args, style: crepeDark, theme: basicDark })
  },
  args: {
    ...defaultArgs,
    defaultValue: longContent,
    modifiedValue: modifiedLongContent,
    enableAI: true,
  },
}

export const StreamingDemo: Story = {
  render: (args) => {
    return setupStreamingDemo({ args, style: crepeDark, theme: basicDark })
  },
  args: {
    ...defaultArgs,
    enableAI: true,
  },
}

export const AIDemo: Story = {
  render: (args) => {
    return setupAIDemo({ args, style: crepeDark, theme: basicDark })
  },
  args: {
    ...defaultArgs,
    defaultValue: longContent,
    modifiedValue: modifiedLongContent,
    enableAI: true,
  },
}
