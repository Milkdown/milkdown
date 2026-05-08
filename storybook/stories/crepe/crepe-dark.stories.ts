import type { Meta, StoryObj } from '@storybook/html'

import crepeDark from '@milkdown/crepe/theme/classic-dark.css?inline'
import { basicDark } from '@uiw/codemirror-theme-basic'

import type { Args } from './setup'

import {
  hideAIArgs,
  longContent,
  setup,
  setupAIDemo,
  wikiContent,
} from './setup'

const meta: Meta = {
  title: 'Crepe/Crepe Dark',
  argTypes: {
    language: {
      options: ['EN', 'JA'],
      control: { type: 'radio' },
    },

    aiProvider: {
      options: ['openai', 'anthropic'],
      control: { type: 'radio' },
    },
  },
}

export default meta

type Story = StoryObj<Args>

const defaultArgs: Args = {
  readonly: false,
  defaultValue: '',
  enableCodemirror: true,
  enableTopBar: false,
  language: 'EN',
  aiProvider: 'openai',
  aiModel: 'gpt-4o-mini',
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
  argTypes: hideAIArgs,
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

export const AIDemo: Story = {
  render: (args) => {
    return setupAIDemo({ args, style: crepeDark, theme: basicDark })
  },
  args: {
    ...defaultArgs,
    defaultValue: longContent,
    enableAI: true,
  },
}
