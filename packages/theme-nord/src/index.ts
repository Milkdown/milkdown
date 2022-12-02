/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx } from '@milkdown/core'
import { emojiAttr } from '@milkdown/plugin-emoji'
import { imageAttr } from '@milkdown/preset-commonmark'
import 'prosemirror-tables/style/tables.css'
import 'prosemirror-view/style/prosemirror.css'
import './style.css'

export const nordThemeConfig = (ctx: Ctx) => {
  ctx.update(emojiAttr.key, prev => (node) => {
    const attr = prev(node)
    return {
      ...attr,
      img: {
        ...attr.img,
        class: 'w-[1em] h-[1em] inline-block mr-px align-text-top',
      },
    }
  })
  ctx.update(imageAttr.key, prev => (node) => {
    const attr = prev(node)
    return {
      ...attr,
      class: 'max-w-full inline-block',
    }
  })
}
