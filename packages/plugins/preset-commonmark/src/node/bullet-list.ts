import { commandsCtx } from '@milkdown/core'
import { expectDomTypeError } from '@milkdown/exception'
import { wrapIn } from '@milkdown/prose/commands'
import { wrappingInputRule } from '@milkdown/prose/inputrules'
import {
  $command,
  $inputRule,
  $nodeAttr,
  $nodeSchema,
  $useKeymap,
} from '@milkdown/utils'

import { isBulletMarker, withMeta } from '../__internal__'

/// HTML attributes for bullet list node.
export const bulletListAttr = $nodeAttr('bulletList')

withMeta(bulletListAttr, {
  displayName: 'Attr<bulletList>',
  group: 'BulletList',
})

/// Schema for bullet list node.
///
/// The `marker` attribute is the character that starts each item in
/// markdown: `-`, `*` or `+`. A list keeps the marker it was parsed or
/// typed with. A list with no marker, for example one that a command made,
/// is written with the `bullet` option of `remarkStringifyOptionsCtx`.
/// `listMarkerHandlerPlugin` is what writes the marker.
export const bulletListSchema = $nodeSchema('bullet_list', (ctx) => {
  return {
    content: 'listItem+',
    group: 'block',
    attrs: {
      spread: {
        default: false,
        validate: 'boolean',
      },
      marker: {
        default: null,
        validate: 'string|null',
      },
    },
    parseDOM: [
      {
        tag: 'ul',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) throw expectDomTypeError(dom)

          const { marker } = dom.dataset
          return {
            spread: dom.dataset.spread === 'true',
            marker: isBulletMarker(marker) ? marker : null,
          }
        },
      },
    ],
    toDOM: (node) => {
      return [
        'ul',
        {
          ...ctx.get(bulletListAttr.key)(node),
          'data-spread': node.attrs.spread,
          ...(node.attrs.marker ? { 'data-marker': node.attrs.marker } : {}),
        },
        0,
      ]
    },
    parseMarkdown: {
      match: ({ type, ordered }) => type === 'list' && !ordered,
      runner: (state, node, type) => {
        const spread = node.spread ?? false
        const marker = isBulletMarker(node.marker) ? node.marker : null
        state.openNode(type, { spread, marker }).next(node.children).closeNode()
      },
    },
    toMarkdown: {
      match: (node) => node.type.name === 'bullet_list',
      runner: (state, node) => {
        state
          .openNode('list', undefined, {
            ordered: false,
            spread: node.attrs.spread,
            marker: node.attrs.marker,
          })
          .next(node.content)
          .closeNode()
      },
    },
  }
})

withMeta(bulletListSchema.node, {
  displayName: 'NodeSchema<bulletList>',
  group: 'BulletList',
})

withMeta(bulletListSchema.ctx, {
  displayName: 'NodeSchemaCtx<bulletList>',
  group: 'BulletList',
})

/// Input rule for wrapping a block in bullet list node.
/// The list keeps the marker that was typed: `-`, `+` or `*`.
export const wrapInBulletListInputRule = $inputRule((ctx) =>
  wrappingInputRule(/^\s*([-+*])\s$/, bulletListSchema.type(ctx), (match) => ({
    marker: match[1],
  }))
)

withMeta(wrapInBulletListInputRule, {
  displayName: 'InputRule<wrapInBulletListInputRule>',
  group: 'BulletList',
})

/// Command for creating bullet list node.
export const wrapInBulletListCommand = $command(
  'WrapInBulletList',
  (ctx) => () => wrapIn(bulletListSchema.type(ctx))
)

withMeta(wrapInBulletListCommand, {
  displayName: 'Command<wrapInBulletListCommand>',
  group: 'BulletList',
})

/// Keymap for bullet list node.
/// - `Mod-Alt-8`: Wrap a block in bullet list.
export const bulletListKeymap = $useKeymap('bulletListKeymap', {
  WrapInBulletList: {
    shortcuts: 'Mod-Alt-8',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(wrapInBulletListCommand.key)
    },
  },
})

withMeta(bulletListKeymap.ctx, {
  displayName: 'KeymapCtx<bulletListKeymap>',
  group: 'BulletList',
})

withMeta(bulletListKeymap.shortcuts, {
  displayName: 'Keymap<bulletListKeymap>',
  group: 'BulletList',
})
