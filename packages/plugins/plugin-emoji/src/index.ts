import type { MilkdownPlugin } from '@milkdown/ctx'
import type { RemarkPluginRaw } from '@milkdown/transformer'
import { expectDomTypeError } from '@milkdown/exception'
import { InputRule } from '@milkdown/prose/inputrules'
import { $inputRule, $nodeAttr, $nodeSchema, $remark } from '@milkdown/utils'
import { get } from 'node-emoji'
import type { RemarkEmojiOptions } from 'remark-emoji'
import remarkEmoji from 'remark-emoji'

import { parse } from './__internal__/parse'
import { twemojiPlugin } from './__internal__/remark-twemoji'
import { withMeta } from './__internal__/with-meta'

/// HTML attributes for emoji node.
export const emojiAttr = $nodeAttr('emoji', () => ({
  span: {},
  img: {},
}))
withMeta(emojiAttr, {
  displayName: 'Attr<emoji>',
})

/// Schema for emoji node.
export const emojiSchema = $nodeSchema('emoji', (ctx) => ({
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
        if (!(dom instanceof HTMLElement)) throw expectDomTypeError(dom)

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
      Object.entries<string>(attrs.img).forEach(([key, value]) =>
        dom.setAttribute(key, value)
      )

    return ['span', { ...attrs.container, 'data-type': 'emoji' }, dom]
  },
  parseMarkdown: {
    match: ({ type }) => type === 'emoji',
    runner: (state, node, type) => {
      state.addNode(type, { html: node.value as string })
    },
  },
  toMarkdown: {
    match: (node) => node.type.name === 'emoji',
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

/// This plugin wraps [remark-emoji](https://github.com/rhysd/remark-emoji).
export const remarkEmojiPlugin = $remark(
  'remarkEmoji',
  () => remarkEmoji as RemarkPluginRaw<RemarkEmojiOptions>
)

withMeta(remarkEmojiPlugin.plugin, {
  displayName: 'Remark<remarkEmojiPlugin>',
})

withMeta(remarkEmojiPlugin.options, {
  displayName: 'RemarkConfig<remarkEmojiPlugin>',
})

/// This plugin is used for transforming emoji to twemoji.
export const remarkTwemojiPlugin = $remark('remarkTwemoji', () => twemojiPlugin)

withMeta(remarkTwemojiPlugin.plugin, {
  displayName: 'Remark<remarkTwemojiPlugin>',
})

withMeta(remarkTwemojiPlugin.options, {
  displayName: 'RemarkConfig<remarkTwemojiPlugin>',
})

/// Input rule for inserting emoji.
/// For example, `:smile:` will be replaced with `😄`.
export const insertEmojiInputRule = $inputRule(
  (ctx) =>
    new InputRule(/(:([^:\s]+):)$/, (state, match, start, end) => {
      const content = match[0]
      if (!content) return null
      const got = get(content)
      if (!got || content.includes(got)) return null

      const html = parse(got, ctx.get(remarkTwemojiPlugin.options.key))

      return state.tr
        .setMeta('emoji', true)
        .replaceRangeWith(start, end, emojiSchema.type(ctx).create({ html }))
        .scrollIntoView()
    })
)

withMeta(insertEmojiInputRule, {
  displayName: 'InputRule<insertEmojiInputRule>',
})

/// All plugins exported by this package.
export const emoji: MilkdownPlugin[] = [
  emojiAttr,
  remarkEmojiPlugin,
  remarkTwemojiPlugin,
  emojiSchema,
  insertEmojiInputRule,
].flat()
