/* Copyright 2021, Milkdown by Mirone. */

import { Editor, defaultValueCtx, rootCtx } from '@milkdown/core'
import { nord } from '@milkdown/theme-nord'
import { commonmark } from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'
import { listItemBlockComponent } from '@milkdown/components/list-item-block'
import { history } from '@milkdown/plugin-history'

import { setup } from '../utils'

import '@milkdown/theme-nord/style.css'

import '../style.css'

import './style.css'

const markdown = `
# List Item Block

- List Item 1
- List Item 2
  - Sub List Item 1
  - Sub List Item 2
- List Item 3

- [ ] Todo List Item 1
- [ ] Todo List Item 2
`

setup(() => {
  return Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, document.getElementById('app'))
      ctx.set(defaultValueCtx, markdown)
    })
    .config(nord)
    .use(history)
    .use(commonmark)
    .use(gfm)
    .use(listItemBlockComponent)
    .create()
})
