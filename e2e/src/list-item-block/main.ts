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

- List item 1
- List item 2
  - Sub list item 1
  - Sub list item 2
- List item 3

1. numbered list item 1
2. numbered list item 2

- [ ] Todo list item 1
- [ ] Todo list item 2
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
