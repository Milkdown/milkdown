import type { Meta, StoryObj } from '@storybook/html'
import { gfm } from '@milkdown/kit/preset/gfm'

import { tableBlock } from '@milkdown/kit/component/table-block'
import tableStyle from '@milkdown/kit/prose/tables/style/tables.css?inline'
import { cursor } from '@milkdown/kit/plugin/cursor'
import { history } from '@milkdown/kit/plugin/history'
import type { CommonArgs } from '../utils/shadow'
import { setupMilkdown } from '../utils/shadow'
import style from './table-block.css?inline'

const meta: Meta = {
  title: 'Components/Table Block',
}

export default meta

const table = `
| Fruit | Animal | Vegetable |
| ----- | :----: | --------: |
| Apple | Cat    | Carrot    |
| Banana| Dog    | Cabbage   |
| Cherry| Horse  | Celery    |
`

export const Table: StoryObj<CommonArgs> = {
  render: (args) => {
    return setupMilkdown([style, tableStyle], args, (editor) => {
      editor.use(history).use(cursor).use(tableBlock).use(gfm)
    })
  },
  args: {
    readonly: false,
    defaultValue: table,
  },
}
