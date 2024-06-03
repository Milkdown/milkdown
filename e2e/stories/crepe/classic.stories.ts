import type { Meta, StoryObj } from '@storybook/html'
import { Crepe, CrepeFeature } from '@milkdown/crepe'
import { basicLight } from '@uiw/codemirror-theme-basic'

import all from '@milkdown/crepe/theme/common/style.css?inline'
import classic from '@milkdown/crepe/theme/classic.css?inline'

const meta: Meta = {
  title: 'Crepe/Main',
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
    const shadow = root.attachShadow({ mode: 'open' })
    const allSheet = new CSSStyleSheet()
    allSheet.replaceSync(all)
    const classicSheet = new CSSStyleSheet()
    classicSheet.replaceSync(classic)
    shadow.adoptedStyleSheets = [allSheet, classicSheet]
    root.appendChild(shadow)
    const crepeRoot = document.createElement('div')
    shadow.appendChild(crepeRoot)

    const crepe = new Crepe({
      root: crepeRoot,
      defaultValue: args.defaultValue,
      features: {
        [CrepeFeature.CodeMirror]: args.enableCodemirror,
      },
      featureConfigs: {
        [CrepeFeature.Placeholder]: {
          text: args.placeholder,
        },
        [CrepeFeature.CodeMirror]: {
          theme: basicLight,
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
