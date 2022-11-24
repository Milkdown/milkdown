/* Copyright 2021, Milkdown by Mirone. */
import { commandsCtx } from '@milkdown/core'
import { expectDomTypeError } from '@milkdown/exception'
import { wrapIn } from '@milkdown/prose/commands'
import { wrappingInputRule } from '@milkdown/prose/inputrules'
import { $command, $inputRule, $nodeSchema, $useKeymap } from '@milkdown/utils'

export const bulletListSchema = $nodeSchema('bullet_list', () => {
  return {
    content: 'listItem+',
    group: 'block',
    attrs: {
      spread: {
        default: false,
      },
    },
    parseDOM: [
      {
        tag: 'ul',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement))
            throw expectDomTypeError(dom)

          return {
            spread: dom.dataset.spread,
          }
        },
      },
    ],
    toDOM: (node) => {
      return [
        'ul',
        {
          'data-spread': node.attrs.spread,
        },
        0,
      ]
    },
    parseMarkdown: {
      match: ({ type, ordered }) => type === 'list' && !ordered,
      runner: (state, node, type) => {
        const spread = node.spread != null ? `${node.spread}` : 'false'
        state.openNode(type, { spread }).next(node.children).closeNode()
      },
    },
    toMarkdown: {
      match: node => node.type.name === 'bullet_list',
      runner: (state, node) => {
        state
          .openNode('list', undefined, { ordered: false, spread: node.attrs.spread === 'true' })
          .next(node.content)
          .closeNode()
      },
    },
  }
})

export const wrapInBulletListInputRule = $inputRule(() => wrappingInputRule(/^\s*([-+*])\s$/, bulletListSchema.type()))

export const wrapInBulletListCommand = $command('WrapInBulletList', () => () => wrapIn(bulletListSchema.type()))

export const bulletListKeymap = $useKeymap('bulletListKeymap', {
  WrapInBulletList: {
    shortcuts: 'Mod-Alt-8',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(wrapInBulletListCommand.key)
    },
  },
})
