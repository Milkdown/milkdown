import { Editor, rootCtx } from '@milkdown/core'
import { nord } from '@milkdown/theme-nord'
import { commonmark } from '@milkdown/preset-commonmark'
import { math } from '@milkdown/plugin-math'

import { setup } from '../utils'

import '@milkdown/theme-nord/style.css'

import '../style.css'

setup(() => {
  return Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, document.getElementById('app'))
    })
    .config(nord)
    .use(commonmark)
    .use(math)
    .create()
})
