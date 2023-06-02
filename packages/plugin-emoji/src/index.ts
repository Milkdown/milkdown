/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin } from '@milkdown/ctx'
import type { RemarkPlugin } from '@milkdown/transformer'
import { expectDomTypeError } from '@milkdown/exception'
import { InputRule } from '@milkdown/prose/inputrules'
import { $ctx, $inputRule, $nodeAttr, $nodeSchema, $remark } from '@milkdown/utils'
import { get } from 'node-emoji'
import remarkEmoji from 'remark-emoji'
import type Twemoji from 'twemoji'

import { parse } from './__internal__/parse'
import { twemojiPlugin } from './__internal__/remark-twemoji'
import { withMeta } from './__internal__/with-meta'

type TwemojiOptions = Exclude<Parameters<typeof Twemoji.parse>[1], Function | undefined>

/// @internal
export interface EmojiConfig {
  twemojiOptions?: TwemojiOptions
}

/// A slice that contains [options for twemoji](https://github.com/twitter/twemoji#object-as-parameter).
export const emojiConfig = $ctx<EmojiConfig, 'emojiConfig'>({}, 'emojiConfig')
withMeta(emojiConfig, {
  displayName: 'Ctx<emojiConfig>',
})

/// HTML attributes for emoji node.
export const emojiAttr = $nodeAttr('emoji', () => ({
  span: {},
  img: {},
}))
withMeta(emojiAttr, {
  displayName: 'Attr<emoji>',
})

/// Schema for emoji node.
export const emojiSchema = $nodeSchema('emoji', ctx => ({
  group: 'inline',
  inline: true,
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
    const attrs = ctx.get(emojiAttr.key)(node)
    const tmp = document.createElement('span')
    tmp.innerHTML = node.attrs.html
    const dom = tmp.firstElementChild?.cloneNode()
    tmp.remove()
    if (dom && dom instanceof HTMLElement)
      Object.entries<string>(attrs.img).forEach(([key, value]) => dom.setAttribute(key, value))

    return ['span', { ...attrs.container, 'data-type': 'emoji' }, dom]
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

withMeta(emojiSchema.node, {
  displayName: 'NodeSchema<emoji>',
})
withMeta(emojiSchema.ctx, {
  displayName: 'NodeSchemaCtx<emoji>',
})

/// Input rule for inserting emoji.
/// For example, `:smile:` will be replaced with `😄`.
export const insertEmojiInputRule = $inputRule(ctx => new InputRule(/(:([^:\s]+):)$/, (state, match, start, end) => {
  const content = match[0]
  if (!content)
    return null
  const got = get(content)
  if (!got || content.includes(got))
    return null

  const html = parse(got, ctx.get(emojiConfig.key).twemojiOptions)

  return state.tr
    .setMeta('emoji', true)
    .replaceRangeWith(start, end, emojiSchema.type().create({ html }))
    .scrollIntoView()
}))

withMeta(insertEmojiInputRule, {
  displayName: 'InputRule<insertEmojiInputRule>',
})

/// This plugin wraps [remark-emoji](https://github.com/rhysd/remark-emoji).
export const remarkEmojiPlugin = $remark(() => remarkEmoji as RemarkPlugin)

withMeta(remarkEmojiPlugin, {
  displayName: 'Remark<remarkEmojiPlugin>',
})

/// This plugin is used for transforming emoji to twemoji.
export const remarkTwemojiPlugin = $remark(ctx => twemojiPlugin(ctx.get(emojiConfig.key).twemojiOptions))

withMeta(remarkTwemojiPlugin, {
  displayName: 'Remark<remarkTwemojiPlugin>',
})

/// All plugins exported by this package.
export const emoji: MilkdownPlugin[] = [
  emojiAttr,
  emojiConfig,
  remarkEmojiPlugin,
  remarkTwemojiPlugin,
  emojiSchema,
  insertEmojiInputRule,
].flat()
