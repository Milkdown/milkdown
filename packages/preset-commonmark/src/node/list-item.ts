/* Copyright 2021, Milkdown by Mirone. */
import { commandsCtx } from '@milkdown/core'
import { expectDomTypeError } from '@milkdown/exception'
import { liftListItem, sinkListItem, splitListItem } from '@milkdown/prose/schema-list'
import { $command, $nodeSchema, $useKeymap } from '@milkdown/utils'

export const listItemSchema = $nodeSchema('list_item', () => ({
  group: 'listItem',
  content: 'paragraph block*',
  attrs: {
    label: {
      default: '•',
    },
    listType: {
      default: 'bullet',
    },
    spread: {
      default: 'true',
    },
  },
  defining: true,
  parseDOM: [
    {
      tag: 'li',
      getAttrs: (dom) => {
        if (!(dom instanceof HTMLElement))
          throw expectDomTypeError(dom)

        return {
          label: dom.dataset.label,
          listType: dom.dataset['list-type'],
          spread: dom.dataset.spread,
        }
      },
    },
  ],
  toDOM: node => [
    'li',
    {
      'data-label': node.attrs.label,
      'data-list-type': node.attrs.listType,
      'data-spread': node.attrs.spread,
    },
    0,
  ],
  parseMarkdown: {
    match: ({ type }) => type === 'listItem',
    runner: (state, node, type) => {
      const label = node.label != null ? `${node.label}.` : '•'
      const listType = node.label != null ? 'ordered' : 'bullet'
      const spread = node.spread != null ? `${node.spread}` : 'true'
      state.openNode(type, { label, listType, spread })
      state.next(node.children)
      state.closeNode()
    },
  },
  toMarkdown: {
    match: node => node.type.name === 'list_item',
    runner: (state, node) => {
      state.openNode('listItem', undefined, { spread: node.attrs.spread === 'true' })
      state.next(node.content)
      state.closeNode()
    },
  },
}))

export const sinkListItemCommand = $command('SinkListItem', () => () => sinkListItem(listItemSchema.type()))
export const splitListItemCommand = $command('SplitListItem', () => () => splitListItem(listItemSchema.type()))
export const liftListItemCommand = $command('SplitListItem', () => () => liftListItem(listItemSchema.type()))

export const listItemKeymap = $useKeymap('listItemKeymap', {
  NextListItem: {
    shortcuts: 'Enter',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(splitListItemCommand.key)
    },
  },
  SinkListItem: {
    shortcuts: ['Tab', 'Mod-]'],
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(sinkListItemCommand.key)
    },
  },
  LiftListItem: {
    shortcuts: ['Shift-Tab', 'Mod-['],
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(liftListItemCommand.key)
    },
  },
})

