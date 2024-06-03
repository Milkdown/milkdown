import type { Meta, StoryObj } from '@storybook/html'
import { Editor, defaultValueCtx, editorViewOptionsCtx, rootCtx } from '@milkdown/core'
import { nord } from '@milkdown/theme-nord'
import { commonmark } from '@milkdown/preset-commonmark'
import { history } from '@milkdown/plugin-history'
import { imageInlineComponent } from '@milkdown/components/image-inline'

import './inline-image-block.css'

const meta: Meta = {
  title: 'Components/Inline Image Block',
}

export default meta

interface Args {
  readonly: boolean
  defaultValue: string
}

const logo = `
![typescript](/typescript-label.svg)
`

const empty = `
![]()
`

export const Empty: StoryObj<Args> = {
  render: (args) => {
    const root = document.createElement('div')
    root.classList.add('milkdown-storybook')
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root)
        ctx.set(defaultValueCtx, args.defaultValue)
        ctx.set(editorViewOptionsCtx, {
          editable: () => !args.readonly,
        })
      })
      .config(nord)
      .use(commonmark)
      .use(imageInlineComponent)
      .use(history)
      .create()

    return root
  },
  args: {
    readonly: false,
    defaultValue: empty,
  },
}

export const Logo: StoryObj<Args> = {
  ...Empty,
  args: {
    readonly: false,
    defaultValue: logo,
  },
}
