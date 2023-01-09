/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx, MilkdownPlugin } from '@milkdown/core'
import { editorViewOptionsCtx } from '@milkdown/core'
import { emojiAttr } from '@milkdown/plugin-emoji'
import { blockquoteAttr, blockquoteSchema, imageAttr, inlineCodeAttr, inlineCodeSchema } from '@milkdown/preset-commonmark'

import './style.css'

export const nordThemeConfig = (ctx: Ctx) => {
  ctx.set(editorViewOptionsCtx, ({
    attributes: {
      class: 'prose dark:prose-invert mx-auto p-1 box-border outline-none',
    },
  }))

  ctx.set(emojiAttr.key, () => ({
    span: {},
    img: {
      class: 'w-[1em] h-[1em] !m-0 inline-block mr-px align-text-top',
    },
  }))

  ctx.set(imageAttr.key, () => ({
    class: 'max-w-full !my-0 inline-block',
  }))

  ctx.set(blockquoteAttr.key, () => ({
    class: 'border-l-4 border-nord10 pl-4',
  }))

  ctx.set(inlineCodeAttr.key, () => ({
    class: 'font-mono text-nord10',
  }))
}

const extendedInlineCode = inlineCodeSchema.extendSchema((prev) => {
  return (ctx) => {
    return {
      ...prev(ctx),
      toDOM: mark => ['span', { class: 'not-prose' }, ['code', ctx.get(inlineCodeAttr.key)(mark), 0]],
    }
  }
})

const extendedBlockquote = blockquoteSchema.extendSchema((prev) => {
  return (ctx) => {
    return {
      ...prev(ctx),
      toDOM: node => ['div', { class: 'not-prose' }, ['blockquote', ctx.get(blockquoteAttr.key)(node), 0]],
    }
  }
})

export const nordPlugins: MilkdownPlugin[] = [extendedInlineCode, extendedBlockquote]
