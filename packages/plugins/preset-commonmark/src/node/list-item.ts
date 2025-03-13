import { commandsCtx } from '@milkdown/core'
import { expectDomTypeError } from '@milkdown/exception'
import {
  liftListItem,
  sinkListItem,
  splitListItem,
} from '@milkdown/prose/schema-list'
import { $command, $nodeAttr, $nodeSchema, $useKeymap } from '@milkdown/utils'
import { type Command, TextSelection } from '@milkdown/prose/state'
import type { Ctx } from '@milkdown/ctx'
import { withMeta } from '../__internal__'

/// HTML attributes for list item node.
export const listItemAttr = $nodeAttr('listItem')

withMeta(listItemAttr, {
  displayName: 'Attr<listItem>',
  group: 'ListItem',
})

/// Schema for list item node.
export const listItemSchema = $nodeSchema('list_item', (ctx) => ({
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
        if (!(dom instanceof HTMLElement)) throw expectDomTypeError(dom)

        return {
          label: dom.dataset.label,
          listType: dom.dataset.listType,
          spread: dom.dataset.spread,
        }
      },
    },
  ],
  toDOM: (node) => [
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
    match: (node) => node.type.name === 'list_item',
    runner: (state, node) => {
      state.openNode('listItem', undefined, {
        spread: node.attrs.spread === 'true',
      })
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
export const sinkListItemCommand = $command(
  'SinkListItem',
  (ctx) => () => sinkListItem(listItemSchema.type(ctx))
)

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
export const liftListItemCommand = $command(
  'LiftListItem',
  (ctx) => () => liftListItem(listItemSchema.type(ctx))
)

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
export const splitListItemCommand = $command(
  'SplitListItem',
  (ctx) => () => splitListItem(listItemSchema.type(ctx))
)

withMeta(splitListItemCommand, {
  displayName: 'Command<splitListItemCommand>',
  group: 'ListItem',
})

function liftFirstListItem(ctx: Ctx): Command {
  return (state, dispatch, view) => {
    const { selection } = state
    if (!(selection instanceof TextSelection)) return false

    const { empty, $from } = selection

    // selection should be empty and at the start of the node
    if (!empty || $from.parentOffset !== 0) return false

    const parentItem = $from.node(-1)
    // selection should be in list item and list item should be the first child of the list
    if (
      parentItem.type !== listItemSchema.type(ctx) ||
      parentItem.firstChild !== $from.node()
    )
      return false

    const list = $from.node(-2)
    // list should have only one list item
    if (list.childCount > 1) return false

    return liftListItem(listItemSchema.type(ctx))(state, dispatch, view)
  }
}

/// The command to remove list item **only if**:
///
/// - Selection is at the start of the list item.
/// - List item is the only child of the list.
///
/// Most of the time, you shouldn't use this command directly.
export const liftFirstListItemCommand = $command(
  'LiftFirstListItem',
  (ctx) => () => liftFirstListItem(ctx)
)

withMeta(liftFirstListItemCommand, {
  displayName: 'Command<liftFirstListItemCommand>',
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
  LiftFirstListItem: {
    shortcuts: ['Backspace', 'Delete'],
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(liftFirstListItemCommand.key)
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
