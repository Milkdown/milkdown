import type { Meta, StoryObj } from '@storybook/html'

import nordDark from '@milkdown/crepe/theme/nord-dark.css?inline'
import { nord } from '@uiw/codemirror-theme-nord'

import type { Args } from './setup'

import {
  hideAIArgs,
  longContent,
  setup,
  setupAIDemo,
  wikiContent,
} from './setup'

const meta: Meta = {
  title: 'Crepe/Nord Dark',
  argTypes: {
    language: {
      options: ['EN', 'JA'],
      control: { type: 'radio' },
    },

    aiProvider: {
      options: ['openai', 'anthropic'],
      control: { type: 'radio' },
    },
    aiModel: {
      control: { type: 'text' },
      description:
        'Override the model id. When empty, defaults to gpt-4o-mini (openai) or claude-sonnet-4-5 (anthropic).',
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
  aiModel: '',
  enableAI: false,
}

export const Empty: Story = {
  render: (args) => {
    return setup({
      args,
      style: nordDark,
      theme: nord,
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
    return setupAIDemo({ args, style: nordDark, theme: nord })
  },
  args: {
    ...defaultArgs,
    defaultValue: longContent,
    enableAI: true,
  },
}
