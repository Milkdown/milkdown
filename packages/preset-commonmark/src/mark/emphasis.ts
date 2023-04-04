/* Copyright 2021, Milkdown by Mirone. */
import { commandsCtx } from '@milkdown/core'
import { toggleMark } from '@milkdown/prose/commands'
import { $command, $markAttr, $markSchema, $useKeymap } from '@milkdown/utils'
import { withMeta } from '../__internal__'

/// HTML attributes for the emphasis mark.
export const emphasisAttr = $markAttr('emphasis')

withMeta(emphasisAttr, {
  displayName: 'Attr<emphasis>',
  group: 'Emphasis',
})

/// Emphasis mark schema.
export const emphasisSchema = $markSchema('emphasis', ctx => ({
  inclusive: false,
  parseDOM: [
    { tag: 'i' },
    { tag: 'em' },
    { style: 'font-style', getAttrs: value => (value === 'italic') as false },
  ],
  toDOM: mark => ['em', ctx.get(emphasisAttr.key)(mark)],
  parseMarkdown: {
    match: node => node.type === 'emphasis',
    runner: (state, node, markType) => {
      state.openMark(markType)
      state.next(node.children)
      state.closeMark(markType)
    },
  },
  toMarkdown: {
    match: mark => mark.type.name === 'emphasis',
    runner: (state, mark) => {
      state.withMark(mark, 'emphasis')
    },
  },
}))

withMeta(emphasisSchema.mark, {
  displayName: 'MarkSchema<emphasis>',
  group: 'Emphasis',
})

withMeta(emphasisSchema.ctx, {
  displayName: 'MarkSchemaCtx<emphasis>',
  group: 'Emphasis',
})

/// A command to toggle the emphasis mark.
export const toggleEmphasisCommand = $command('ToggleEmphasis', () => () => toggleMark(emphasisSchema.type()))

withMeta(toggleEmphasisCommand, {
  displayName: 'Command<toggleEmphasisCommand>',
  group: 'Emphasis',
})

/// Keymap for the emphasis mark.
/// - `Mod-i` - Toggle the emphasis mark.
export const emphasisKeymap = $useKeymap('emphasisKeymap', {
  ToggleEmphasis: {
    shortcuts: 'Mod-i',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(toggleEmphasisCommand.key)
    },
  },
})

withMeta(emphasisKeymap.ctx, {
  displayName: 'KeymapCtx<emphasis>',
  group: 'Emphasis',
})

withMeta(emphasisKeymap.shortcuts, {
  displayName: 'Keymap<emphasis>',
  group: 'Emphasis',
})
