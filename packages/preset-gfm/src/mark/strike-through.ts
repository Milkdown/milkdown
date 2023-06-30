/* Copyright 2021, Milkdown by Mirone. */
import { commandsCtx } from '@milkdown/core'
import { $command, $markAttr, $markSchema, $useKeymap } from '@milkdown/utils'
import { toggleMark } from '@milkdown/prose/commands'
import { withMeta } from '../__internal__'

/// HTML attributes for the strikethrough mark.
export const strikethroughAttr = $markAttr('strike_through')

withMeta(strikethroughAttr, {
  displayName: 'Attr<strikethrough>',
  group: 'Strikethrough',
})

/// Strikethrough mark schema.
export const strikethroughSchema = $markSchema('strike_through', ctx => ({
  parseDOM: [
    { tag: 'del' },
    { style: 'text-decoration', getAttrs: value => (value === 'line-through') as false },
  ],
  toDOM: mark => ['del', ctx.get(strikethroughAttr.key)(mark)],
  parseMarkdown: {
    match: node => node.type === 'delete',
    runner: (state, node, markType) => {
      state.openMark(markType)
      state.next(node.children)
      state.closeMark(markType)
    },
  },
  toMarkdown: {
    match: mark => mark.type.name === 'strike_through',
    runner: (state, mark) => {
      state.withMark(mark, 'delete')
    },
  },
}))

withMeta(strikethroughSchema.mark, {
  displayName: 'MarkSchema<strikethrough>',
  group: 'Strikethrough',
})

withMeta(strikethroughSchema.ctx, {
  displayName: 'MarkSchemaCtx<strikethrough>',
  group: 'Strikethrough',
})

/// A command to toggle the strikethrough mark.
export const toggleStrikethroughCommand = $command('ToggleStrikeThrough', () => () => {
  return toggleMark(strikethroughSchema.type())
})

withMeta(toggleStrikethroughCommand, {
  displayName: 'Command<ToggleStrikethrough>',
  group: 'Strikethrough',
})

/// Keymap for the strikethrough mark.
/// - `Mod-Alt-x` - Toggle the strikethrough mark.
export const strikethroughKeymap = $useKeymap('strikeThroughKeymap', {
  ToggleStrikethrough: {
    shortcuts: 'Mod-Alt-x',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(toggleStrikethroughCommand.key)
    },
  },
})

withMeta(strikethroughKeymap.ctx, {
  displayName: 'KeymapCtx<strikethrough>',
  group: 'Strikethrough',
})

withMeta(strikethroughKeymap.shortcuts, {
  displayName: 'Keymap<strikethrough>',
  group: 'Strikethrough',
})
