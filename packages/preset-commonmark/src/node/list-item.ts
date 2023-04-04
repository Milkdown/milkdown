/* Copyright 2021, Milkdown by Mirone. */
import { commandsCtx } from '@milkdown/core'
import { expectDomTypeError } from '@milkdown/exception'
import { liftListItem, sinkListItem, splitListItem } from '@milkdown/prose/schema-list'
import { $command, $nodeAttr, $nodeSchema, $useKeymap } from '@milkdown/utils'
import { withMeta } from '../__internal__'

/// HTML attributes for list item node.
export const listItemAttr = $nodeAttr('listItem')

withMeta(listItemAttr, {
  displayName: 'Attr<listItem>',
  group: 'ListItem',
})

/// Schema for list item node.
export const listItemSchema = $nodeSchema('list_item', ctx => ({
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
      ...ctx.get(listItemAttr.key)(node),
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

withMeta(listItemSchema.node, {
  displayName: 'NodeSchema<listItem>',
  group: 'ListItem',
})

withMeta(listItemSchema.ctx, {
  displayName: 'NodeSchemaCtx<listItem>',
  group: 'ListItem',
})

/// The command to sink list item.
///
/// For example:
/// ```md
/// * List item 1
/// * List item 2 <- cursor here
/// ```
/// Will get:
/// ```md
/// * List item 1
///   * List item 2
/// ```
export const sinkListItemCommand = $command('SinkListItem', () => () => sinkListItem(listItemSchema.type()))

withMeta(sinkListItemCommand, {
  displayName: 'Command<sinkListItemCommand>',
  group: 'ListItem',
})

/// The command to lift list item.
///
/// For example:
/// ```md
/// * List item 1
///   * List item 2 <- cursor here
/// ```
/// Will get:
/// ```md
/// * List item 1
/// * List item 2
/// ```
export const liftListItemCommand = $command('SplitListItem', () => () => liftListItem(listItemSchema.type()))

withMeta(liftListItemCommand, {
  displayName: 'Command<liftListItemCommand>',
  group: 'ListItem',
})

/// The command to split a list item.
///
/// For example:
/// ```md
/// * List item 1
/// * List item 2 <- cursor here
/// ```
/// Will get:
/// ```md
/// * List item 1
/// * List item 2
/// * <- cursor here
/// ```
export const splitListItemCommand = $command('SplitListItem', () => () => splitListItem(listItemSchema.type()))

withMeta(splitListItemCommand, {
  displayName: 'Command<splitListItemCommand>',
  group: 'ListItem',
})

/// Keymap for list item node.
/// - `<Enter>`: Split the current list item.
/// - `<Tab>/<Mod-]>`: Sink the current list item.
/// - `<Shift-Tab>/<Mod-[>`: Lift the current list item.
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

withMeta(listItemKeymap.ctx, {
  displayName: 'KeymapCtx<listItem>',
  group: 'ListItem',
})

withMeta(listItemKeymap.shortcuts, {
  displayName: 'Keymap<listItem>',
  group: 'ListItem',
})
