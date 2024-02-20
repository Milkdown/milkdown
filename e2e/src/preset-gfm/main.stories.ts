/* Copyright 2021, Milkdown by Mirone. */
import type { Meta, StoryObj } from '@storybook/html'
import { Editor, rootCtx } from '@milkdown/core'
import { nord } from '@milkdown/theme-nord'
import { commonmark } from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'
import { history } from '@milkdown/plugin-history'

import '@milkdown/theme-nord/style.css'

import '../style.css'

const meta: Meta = {
  title: 'GFM/Main',
}

export default meta

export const Empty: StoryObj = {
  render: () => {
    const root = document.createElement('div')
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root)
      })
      .config(nord)
      .use(commonmark)
      .use(gfm)
      .use(history)
      .create()

    return root
  },
}
