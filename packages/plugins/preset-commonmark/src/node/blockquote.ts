import { commandsCtx } from '@milkdown/core'
import { wrapIn } from '@milkdown/prose/commands'
import { wrappingInputRule } from '@milkdown/prose/inputrules'
import type { $NodeSchema } from '@milkdown/utils'
import {
  $command,
  $inputRule,
  $nodeAttr,
  $nodeSchema,
  $useKeymap,
} from '@milkdown/utils'
import { withMeta } from '../__internal__'

/// HTML attributes for blockquote node.
export const blockquoteAttr = $nodeAttr('blockquote')

withMeta(blockquoteAttr, {
  displayName: 'Attr<blockquote>',
  group: 'Blockquote',
})

/// Schema for blockquote node.
export const blockquoteSchema: $NodeSchema<'blockquote'> = $nodeSchema(
  'blockquote',
  (ctx) => ({
    content: 'block+',
    group: 'block',
    defining: true,
    parseDOM: [{ tag: 'blockquote' }],
    toDOM: (node) => ['blockquote', ctx.get(blockquoteAttr.key)(node), 0],
    parseMarkdown: {
      match: ({ type }) => type === 'blockquote',
      runner: (state, node, type) => {
        state.openNode(type).next(node.children).closeNode()
      },
    },
    toMarkdown: {
      match: (node) => node.type.name === 'blockquote',
      runner: (state, node) => {
        state.openNode('blockquote').next(node.content).closeNode()
      },
    },
  })
)

withMeta(blockquoteSchema.node, {
  displayName: 'NodeSchema<blockquote>',
  group: 'Blockquote',
})

withMeta(blockquoteSchema.ctx, {
  displayName: 'NodeSchemaCtx<blockquote>',
  group: 'Blockquote',
})

/// This input rule will convert a line that starts with `> ` into a blockquote.
/// You can type `> ` at the start of a line to create a blockquote.
export const wrapInBlockquoteInputRule = $inputRule((ctx) =>
  wrappingInputRule(/^\s*>\s$/, blockquoteSchema.type(ctx))
)

withMeta(wrapInBlockquoteInputRule, {
  displayName: 'InputRule<wrapInBlockquoteInputRule>',
  group: 'Blockquote',
})

/// This command will wrap the current selection in a blockquote.
export const wrapInBlockquoteCommand = $command(
  'WrapInBlockquote',
  (ctx) => () => wrapIn(blockquoteSchema.type(ctx))
)

withMeta(wrapInBlockquoteCommand, {
  displayName: 'Command<wrapInBlockquoteCommand>',
  group: 'Blockquote',
})

/// Keymap for blockquote.
/// - `Mod-Shift-b`: Wrap selection in blockquote.
export const blockquoteKeymap = $useKeymap('blockquoteKeymap', {
  WrapInBlockquote: {
    shortcuts: 'Mod-Shift-b',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(wrapInBlockquoteCommand.key)
    },
  },
})

withMeta(blockquoteKeymap.ctx, {
  displayName: 'KeymapCtx<blockquote>',
  group: 'Blockquote',
})

withMeta(blockquoteKeymap.shortcuts, {
  displayName: 'Keymap<blockquote>',
  group: 'Blockquote',
})
