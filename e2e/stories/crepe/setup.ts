import { Crepe, CrepeFeature } from '@milkdown/crepe'
import all from '@milkdown/crepe/theme/common/style.css?inline'
import type { Extension } from '@codemirror/state'

export interface Args {
  instance: Crepe
  readonly: boolean
  defaultValue: string
  placeholder: string
  enableCodemirror: boolean
}

export interface setupConfig {
  args: Args
  style: string
  theme: Extension
}

export function setup({ args, style, theme }: setupConfig) {
  const root = document.createElement('div')
  const shadow = root.attachShadow({ mode: 'open' })
  const allSheet = new CSSStyleSheet()
  allSheet.replaceSync(all)
  const classicSheet = new CSSStyleSheet()
  classicSheet.replaceSync(style)
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
        theme,
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
}

export const longContent = `
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
