import { commandsCtx } from '@milkdown/core'
import { markRule } from '@milkdown/prose'
import { toggleMark } from '@milkdown/prose/commands'
import {
  $command,
  $inputRule,
  $markAttr,
  $markSchema,
  $useKeymap,
} from '@milkdown/utils'

import { withMeta } from '../__internal__'

/// HTML attributes for the superscript mark.
export const superscriptAttr = $markAttr('superscript')

withMeta(superscriptAttr, {
  displayName: 'Attr<superscript>',
  group: 'Superscript',
})

/// Superscript mark schema.
/// Pandoc syntax: H^2^O becomes H²O
export const superscriptSchema = $markSchema('superscript', (ctx) => ({
  parseDOM: [
    { tag: 'sup' },
    {
      style: 'vertical-align',
      getAttrs: (value) => (value === 'super') as false,
    },
  ],
  toDOM: (mark) => ['sup', ctx.get(superscriptAttr.key)(mark)],
  parseMarkdown: {
    match: (node) => node.type === 'superscript',
    runner: (state, node, markType) => {
      state.openMark(markType)
      state.next(node.children)
      state.closeMark(markType)
    },
  },
  toMarkdown: {
    match: (mark) => mark.type.name === 'superscript',
    runner: (state, mark) => {
      state.withMark(mark, 'superscript')
    },
  },
}))

withMeta(superscriptSchema.mark, {
  displayName: 'MarkSchema<superscript>',
  group: 'Superscript',
})

withMeta(superscriptSchema.ctx, {
  displayName: 'MarkSchemaCtx<superscript>',
  group: 'Superscript',
})

/// A command to toggle the superscript mark.
export const toggleSuperscriptCommand = $command(
  'ToggleSuperscript',
  (ctx) => () => {
    return toggleMark(superscriptSchema.type(ctx))
  }
)

withMeta(toggleSuperscriptCommand, {
  displayName: 'Command<ToggleSuperscript>',
  group: 'Superscript',
})

/// Input rule to create the superscript mark.
/// Matches ^text^ pattern (Pandoc style)
export const superscriptInputRule = $inputRule((ctx) => {
  return markRule(/(?<!\^)\^([^\s^][^^]*[^\s^]|[^\s^])\^(?!\^)/, superscriptSchema.type(ctx))
})

withMeta(superscriptInputRule, {
  displayName: 'InputRule<superscript>',
  group: 'Superscript',
})

/// Keymap for the superscript mark.
/// - `Mod-Shift-.` - Toggle the superscript mark.
export const superscriptKeymap = $useKeymap('superscriptKeymap', {
  ToggleSuperscript: {
    shortcuts: 'Mod-Shift-.',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(toggleSuperscriptCommand.key)
    },
  },
})

withMeta(superscriptKeymap.ctx, {
  displayName: 'KeymapCtx<superscript>',
  group: 'Superscript',
})

withMeta(superscriptKeymap.shortcuts, {
  displayName: 'Keymap<superscript>',
  group: 'Superscript',
})
