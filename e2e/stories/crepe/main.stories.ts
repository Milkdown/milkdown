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
    root.classList.add('crepe')

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

const longContent = `
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

![]()

![0.5](/milkdown-logo.png)

\`\`\`typescript
const crepe = new Crepe({
  theme: CrepeTheme.Classic,
})
\`\`\`

* List Item 1
* List Item 2
    * List Item 3
    * List Item 4
* List Item 5
* List Item 6

1. List Item 1
2. List Item 2
    1. List Item 1
    2. List Item 2
3. List Item 3

> Is this the **real life**?
> Is this just *fantasy*?
> Caught in a \`landslide\`,
> No escape from [reality](https://en.wikipedia.org/wiki/Bohemian_Rhapsody).
`

export const WidthDefaultValue: Story = {
  ...Empty,
  args: {
    ...defaultArgs,
    defaultValue: longContent,
  },
}
