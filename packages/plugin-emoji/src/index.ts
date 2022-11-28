/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin, RemarkPlugin } from '@milkdown/core'
import { expectDomTypeError } from '@milkdown/exception'
import { InputRule } from '@milkdown/prose/inputrules'
import { $ctx, $inputRule, $nodeSchema, $remark } from '@milkdown/utils'
import nodeEmoji from 'node-emoji'
import remarkEmoji from 'remark-emoji'

import { parse } from './parse'
import { twemojiPlugin } from './remark-twemoji'

export interface EmojiConfig {
  maxListSize?: number
  twemojiOptions?: TwemojiOptions
}

export const emojiConfig = $ctx<EmojiConfig, 'emojiConfig'>({
}, 'emojiConfig')

export const emojiSchema = $nodeSchema('emoji', () => ({
  group: 'inline',
  inline: true,
  atom: true,
  attrs: {
    html: {
      default: '',
    },
  },
  parseDOM: [
    {
      tag: 'span[data-type="emoji"]',
      getAttrs: (dom) => {
        if (!(dom instanceof HTMLElement))
          throw expectDomTypeError(dom)

        return { html: dom.innerHTML }
      },
    },
  ],
  toDOM: (node) => {
    const span = document.createElement('span')
    span.classList.add('emoji-wrapper')
    span.dataset.type = 'emoji'
    span.innerHTML = node.attrs.html
    return { dom: span }
  },
  parseMarkdown: {
    match: ({ type }) => type === 'emoji',
    runner: (state, node, type) => {
      state.addNode(type, { html: node.value as string })
    },
  },
  toMarkdown: {
    match: node => node.type.name === 'emoji',
    runner: (state, node) => {
      const span = document.createElement('span')
      span.innerHTML = node.attrs.html
      const img = span.querySelector('img')
      const title = img?.title || img?.alt
      span.remove()
      state.addNode('text', undefined, title)
    },
  },
}))

export const insertEmojiInputRule = $inputRule(ctx => new InputRule(/(:([^:\s]+):)$/, (state, match, start, end) => {
  const content = match[0]
  if (!content)
    return null
  const got = nodeEmoji.get(content)
  if (!got || content.includes(got))
    return null

  const html = parse(got, ctx.get(emojiConfig.key).twemojiOptions)

  return state.tr
    .setMeta('emoji', true)
    .replaceRangeWith(start, end, emojiSchema.type().create({ html }))
    .scrollIntoView()
}))

export const remarkEmojiPlugin = $remark(() => remarkEmoji as RemarkPlugin)
export const remarkTwemojiPlugin = $remark(ctx => twemojiPlugin(ctx.get(emojiConfig.key).twemojiOptions))

export const emoji: MilkdownPlugin[] = [
  emojiConfig,
  remarkEmojiPlugin,
  remarkTwemojiPlugin,
  emojiSchema,
  insertEmojiInputRule,
].flat()
