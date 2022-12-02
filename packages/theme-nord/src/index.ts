/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx } from '@milkdown/core'
import { emojiAttr } from '@milkdown/plugin-emoji'
import 'prosemirror-tables/style/tables.css'
import 'prosemirror-view/style/prosemirror.css'
import './style.css'

export const nordThemeConfig = (ctx: Ctx) => {
  ctx.update(emojiAttr.key, prev => ({
    ...prev,
    img: {
      ...prev.img,
      class: 'w-[1em] h-[1em] inline-block',
    },
  }))
}
