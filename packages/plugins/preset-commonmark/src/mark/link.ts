import { expectDomTypeError } from '@milkdown/exception'
import { toggleMark } from '@milkdown/prose/commands'
import type { Node as ProseNode } from '@milkdown/prose/model'
import { TextSelection } from '@milkdown/prose/state'
import { $command, $markAttr, $markSchema } from '@milkdown/utils'
import { withMeta } from '../__internal__'

/// HTML attributes for the link mark.
export const linkAttr = $markAttr('link')

withMeta(linkAttr, {
  displayName: 'Attr<link>',
  group: 'Link',
})

/// Link mark schema.
export const linkSchema = $markSchema('link', (ctx) => ({
  attrs: {
    href: {},
    title: { default: null },
  },
  parseDOM: [
    {
      tag: 'a[href]',
      getAttrs: (dom) => {
        if (!(dom instanceof HTMLElement)) throw expectDomTypeError(dom)

        return {
          href: dom.getAttribute('href'),
          title: dom.getAttribute('title'),
        }
      },
    },
  ],
  toDOM: (mark) => ['a', { ...ctx.get(linkAttr.key)(mark), ...mark.attrs }],
  parseMarkdown: {
    match: (node) => node.type === 'link',
    runner: (state, node, markType) => {
      const url = node.url as string
      const title = node.title as string
      state.openMark(markType, { href: url, title })
      state.next(node.children)
      state.closeMark(markType)
    },
  },
  toMarkdown: {
    match: (mark) => mark.type.name === 'link',
    runner: (state, mark) => {
      state.withMark(mark, 'link', undefined, {
        title: mark.attrs.title,
        url: mark.attrs.href,
      })
    },
  },
}))

withMeta(linkSchema.mark, {
  displayName: 'MarkSchema<link>',
  group: 'Link',
})

/// @internal
export interface UpdateLinkCommandPayload {
  href?: string
  title?: string
}
/// A command to toggle the link mark.
/// You can pass the `href` and `title` to the link.
export const toggleLinkCommand = $command(
  'ToggleLink',
  (ctx) =>
    (payload: UpdateLinkCommandPayload = {}) =>
      toggleMark(linkSchema.type(ctx), payload)
)

withMeta(toggleLinkCommand, {
  displayName: 'Command<toggleLinkCommand>',
  group: 'Link',
})

/// A command to update the link mark.
/// You can pass the `href` and `title` to update the link.
export const updateLinkCommand = $command(
  'UpdateLink',
  (ctx) =>
    (payload: UpdateLinkCommandPayload = {}) =>
    (state, dispatch) => {
      if (!dispatch) return false

      let node: ProseNode | undefined
      let pos = -1
      const { selection } = state
      const { from, to } = selection
      state.doc.nodesBetween(from, from === to ? to + 1 : to, (n, p) => {
        if (linkSchema.type(ctx).isInSet(n.marks)) {
          node = n
          pos = p
          return false
        }

        return undefined
      })

      if (!node) return false

      const mark = node.marks.find(({ type }) => type === linkSchema.type(ctx))
      if (!mark) return false

      const start = pos
      const end = pos + node.nodeSize
      const { tr } = state
      const linkMark = linkSchema
        .type(ctx)
        .create({ ...mark.attrs, ...payload })
      if (!linkMark) return false

      dispatch(
        tr
          .removeMark(start, end, mark)
          .addMark(start, end, linkMark)
          .setSelection(new TextSelection(tr.selection.$anchor))
          .scrollIntoView()
      )

      return true
    }
)

withMeta(updateLinkCommand, {
  displayName: 'Command<updateLinkCommand>',
  group: 'Link',
})
