import type { Meta, StoryObj } from '@storybook/html'
import { gfm } from '@milkdown/kit/preset/gfm'
import { listItemBlockComponent } from '@milkdown/kit/component/list-item-block'

import type { CommonArgs } from '../utils/shadow'
import { setupMilkdown } from '../utils/shadow'
import style from './list-item-block.css?inline'

const meta: Meta = {
  title: 'Components/List Item Block',
}

export default meta

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

export const Bullet: StoryObj<CommonArgs> = {
  render: (args) => {
    return setupMilkdown([style], args, (editor) => {
      editor.use(gfm).use(listItemBlockComponent)
    })
  },
  args: {
    readonly: false,
    defaultValue: bullet,
  },
}

export const Ordered: StoryObj<CommonArgs> = {
  ...Bullet,
  args: {
    readonly: false,
    defaultValue: ordered,
  },
}

export const Todo: StoryObj<CommonArgs> = {
  ...Bullet,
  args: {
    readonly: false,
    defaultValue: todo,
  },
}
