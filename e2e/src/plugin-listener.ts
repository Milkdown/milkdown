/* Copyright 2021, Milkdown by Mirone. */
import { Editor, rootCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { nord } from '@milkdown/theme-nord'
import { listener, listenerCtx } from '@milkdown/plugin-listener'

export const setup = () => {
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
}
