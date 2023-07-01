/* Copyright 2021, Milkdown by Mirone. */

import { Editor, rootCtx } from '@milkdown/core'
import { nord } from '@milkdown/theme-nord'
import { commonmark } from '@milkdown/preset-commonmark'
import { listener, listenerCtx } from '@milkdown/plugin-listener'

import { setup } from '../utils'

import '@milkdown/theme-nord/style.css'

import '../style.css'

setup(() => {
  return Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, document.getElementById('app'))
      ctx.get(listenerCtx).markdownUpdated((_, markdown) => {
        // eslint-disable-next-line no-console
        console.log(markdown)
      })
    })
    .config(nord)
    .use(commonmark)
    .use(listener)
    .create()
})
