/* Copyright 2021, Milkdown by Mirone. */
import { Editor, rootCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { nord } from '@milkdown/theme-nord'
import { clipboard } from '@milkdown/plugin-clipboard'

export const setup = () => {
  return Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, document.getElementById('app'))
    })
    .config(nord)
    .use(commonmark)
    .use(clipboard)
    .create()
}
