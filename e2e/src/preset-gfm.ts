/* Copyright 2021, Milkdown by Mirone. */
import { Editor, rootCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'
import { nord } from '@milkdown/theme-nord'
import { history } from '@milkdown/plugin-history'

export const setup = () => {
  return Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, document.getElementById('app'))
    })
    .config(nord)
    .enableInspector()
    .use(commonmark)
    .use(gfm)
    .use(history)
    .create()
}
