/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin, RemarkPlugin } from '@milkdown/core'
import { expectDomTypeError } from '@milkdown/exception'
import { InputRule } from '@milkdown/prose/inputrules'
import { $attr, $ctx, $inputRule, $nodeSchema, $remark } from '@milkdown/utils'
import nodeEmoji from 'node-emoji'
import remarkEmoji from 'remark-emoji'
import type Twemoji from 'twemoji'

import { parse } from './parse'
import { twemojiPlugin } from './remark-twemoji'

type TwemojiOptions = Exclude<Parameters<typeof Twemoji.parse>[1], Function | undefined>

export interface EmojiConfig {
  twemojiOptions?: TwemojiOptions
}

export const emojiConfig = $ctx<EmojiConfig, 'emojiConfig'>({}, 'emojiConfig')

export const emojiAttr = $attr('emoji', {
  span: {},
  img: {},
})

export const emojiSchema = $nodeSchema('emoji', ctx => ({
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
    const attrs = ctx.get(emojiAttr.key)
    const tmp = document.createElement('span')
    tmp.innerHTML = node.attrs.html
    const dom = tmp.firstElementChild?.cloneNode()
    tmp.remove()
    if (dom && dom instanceof HTMLElement)
      Object.entries<string>(attrs.img).forEach(([key, value]) => dom.setAttribute(key, value))

    return ['span', { 'data-type': 'emoji', ...attrs.container }, dom]
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
  emojiAttr,
  emojiConfig,
  remarkEmojiPlugin,
  remarkTwemojiPlugin,
  emojiSchema,
  insertEmojiInputRule,
].flat()
