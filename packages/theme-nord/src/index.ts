/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx } from '@milkdown/core'
import { editorViewOptionsCtx } from '@milkdown/core'
import { emojiAttr } from '@milkdown/plugin-emoji'
import { blockquoteAttr, imageAttr } from '@milkdown/preset-commonmark'
import 'prosemirror-tables/style/tables.css'
import 'prosemirror-view/style/prosemirror.css'
import './style.css'

export const nordThemeConfig = (ctx: Ctx) => {
  ctx.update(editorViewOptionsCtx, prev => ({
    ...prev,
    attributes: {
      class: 'prose lg:prose-xl mx-auto outline-none overflow-hidden',
    },
  }))

  ctx.update(emojiAttr.key, prev => (node) => {
    const attr = prev(node)
    return {
      ...attr,
      img: {
        ...attr.img,
        class: 'w-[1em] h-[1em] !m-0 inline-block mr-px align-text-top',
      },
    }
  })

  ctx.update(imageAttr.key, prev => (node) => {
    const attr = prev(node)
    return {
      ...attr,
      class: 'max-w-full !my-0 inline-block',
    }
  })

  ctx.update(blockquoteAttr.key, prev => (node) => {
    const attr = prev(node)
    return {
      ...attr,
      class: 'border-l-4 border-gray-300 pl-2',
    }
  })
}
