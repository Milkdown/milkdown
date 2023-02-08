/* Copyright 2021, Milkdown by Mirone. */
import { commandsCtx } from '@milkdown/core'
import { toggleMark } from '@milkdown/prose/commands'
import { $command, $markAttr, $markSchema, $useKeymap } from '@milkdown/utils'

/// HTML attributes for the emphasis mark.
export const emphasisAttr = $markAttr('emphasis')

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

/// A command to toggle the emphasis mark.
export const toggleEmphasisCommand = $command('ToggleEmphasis', () => () => toggleMark(emphasisSchema.type()))

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
