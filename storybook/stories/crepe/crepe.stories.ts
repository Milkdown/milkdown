import type { Meta, StoryObj } from '@storybook/html'

import crepe from '@milkdown/crepe/theme/classic.css?inline'
import { basicLight } from '@uiw/codemirror-theme-basic'

import type { Args } from './setup'

import {
  hideAIArgs,
  longContent,
  setup,
  setupAIDemo,
  wikiContent,
} from './setup'

const meta: Meta = {
  title: 'Crepe/Crepe',
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
  enableAI: false,
  language: 'EN',
  aiProvider: 'openai',
  aiModel: 'gpt-4o-mini',
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
  argTypes: hideAIArgs,
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
    return setupAIDemo({ args, style: crepe, theme: basicLight })
  },
  args: {
    ...defaultArgs,
    defaultValue: longContent,
    enableAI: true,
  },
}
