import type { Meta, StoryObj } from '@storybook/html'
import { Editor, defaultValueCtx, editorViewOptionsCtx, rootCtx } from '@milkdown/core'
import { nord } from '@milkdown/theme-nord'
import { gfm } from '@milkdown/preset-gfm'
import { commonmark } from '@milkdown/preset-commonmark'
import { history } from '@milkdown/plugin-history'
import { listItemBlockComponent } from '@milkdown/components/list-item-block'

import './list-item-block.css'

const meta: Meta = {
  title: 'Components/List Item Block',
}

export default meta

interface Args {
  readonly: boolean
  defaultValue: string
}

const bullet = `
- List item 1
    - List item 1.1
    - List item 1.2
- List item 2
- List item 3
`

const ordered = `
1. List item 1
    1. List item 1.1
    2. List item 1.2
2. List item 2
3. List item 3
`

const todo = `
- [ ] Todo list item 1
    - [ ] Todo List item 1.1
    - [ ] Todo List item 1.2
- [ ] Todo list item 2
- [ ] Todo list item 3
`

export const Bullet: StoryObj<Args> = {
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
      .use(gfm)
      .use(listItemBlockComponent)
      .use(history)
      .create()

    return root
  },
  args: {
    readonly: false,
    defaultValue: bullet,
  },
}

export const Ordered: StoryObj<Args> = {
  ...Bullet,
  args: {
    readonly: false,
    defaultValue: ordered,
  },
}

export const Todo: StoryObj<Args> = {
  ...Bullet,
  args: {
    readonly: false,
    defaultValue: todo,
  },
}
