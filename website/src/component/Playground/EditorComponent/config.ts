/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx } from '@milkdown/core'
import { editorViewOptionsCtx } from '@milkdown/core'
import { emojiAttr } from '@milkdown/plugin-emoji'

import './style.css'

export const nordThemeConfig = (ctx: Ctx) => {
  ctx.set(editorViewOptionsCtx, ({
    attributes: {
      class: 'mx-auto p-1 box-border',
    },
  }))

  ctx.set(emojiAttr.key, () => ({
    span: {},
    img: {
      class: 'w-[1em] h-[1em] !m-0 inline-block mr-px align-text-top',
    },
  }))
}
