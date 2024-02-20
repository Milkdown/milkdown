/* Copyright 2021, Milkdown by Mirone. */
import type { Meta, StoryObj } from '@storybook/html'
import { Crepe, CrepeFeature, CrepeTheme } from '@milkdown/crepe'

const meta: Meta = {
  title: 'Crepe/Main',
  argTypes: {
    theme: {
      control: 'select',
      options: ['Classic', 'Classic Dark', 'Headless'],
      mapping: {
        'Classic': CrepeTheme.Classic,
        'Classic Dark': CrepeTheme.ClassicDark,
        'Headless': CrepeTheme.Headless,
      },
    },
  },
}

interface Args {
  instance: Crepe
  readonly: boolean
  defaultValue: string
  placeholder: string
  enableCodemirror: boolean
  theme: string
}

export default meta

type Story = StoryObj<Args>

const defaultArgs: Omit<Args, 'instance'> = {
  readonly: false,
  defaultValue: '',
  placeholder: 'Type / to use slash command',
  enableCodemirror: true,
  theme: 'Classic',
}

export const Empty: Story = {
  render: (args) => {
    const root = document.createElement('div')

    const crepe = new Crepe({
      root,
      theme: args.theme as CrepeTheme,
      defaultValue: args.defaultValue,
      features: {
        [CrepeFeature.CodeMirror]: args.enableCodemirror,
      },
      featureConfigs: {
        [CrepeFeature.Placeholder]: {
          text: args.placeholder,
        },
      },
    })
    crepe
      .setReadonly(args.readonly)
      .create()
      .then(() => {
        args.instance = crepe
      })

    return root
  },
  args: {
    ...defaultArgs,
  },
}
