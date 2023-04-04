/* Copyright 2021, Milkdown by Mirone. */
import { commandsCtx } from '@milkdown/core'
import { toggleMark } from '@milkdown/prose/commands'
import { $command, $markAttr, $markSchema, $useKeymap } from '@milkdown/utils'
import { withMeta } from '../__internal__'

/// HTML attributes for the strong mark.
export const strongAttr = $markAttr('strong')

withMeta(strongAttr, {
  displayName: 'Attr<strong>',
  group: 'Strong',
})

/// Strong mark schema.
export const strongSchema = $markSchema('strong', ctx => ({
  inclusive: false,
  parseDOM: [
    { tag: 'b' },
    { tag: 'strong' },
    { style: 'font-style', getAttrs: value => (value === 'bold') as false },
  ],
  toDOM: mark => ['strong', ctx.get(strongAttr.key)(mark)],
  parseMarkdown: {
    match: node => node.type === 'strong',
    runner: (state, node, markType) => {
      state.openMark(markType)
      state.next(node.children)
      state.closeMark(markType)
    },
  },
  toMarkdown: {
    match: mark => mark.type.name === 'strong',
    runner: (state, mark) => {
      state.withMark(mark, 'strong')
    },
  },
}))

withMeta(strongSchema.mark, {
  displayName: 'MarkSchema<strong>',
  group: 'Strong',
})

withMeta(strongSchema.ctx, {
  displayName: 'MarkSchemaCtx<strong>',
  group: 'Strong',
})

/// A command to toggle the strong mark.
export const toggleStrongCommand = $command('ToggleStrong', () => () => toggleMark(strongSchema.type()))

withMeta(toggleStrongCommand, {
  displayName: 'Command<toggleStrongCommand>',
  group: 'Strong',
})

/// Keymap for the strong mark.
/// - `Mod-b` - Toggle the strong mark.
export const strongKeymap = $useKeymap('strongKeymap', {
  ToggleBold: {
    shortcuts: ['Mod-b'],
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(toggleStrongCommand.key)
    },
  },
})

withMeta(strongKeymap.ctx, {
  displayName: 'KeymapCtx<strong>',
  group: 'Strong',
})

withMeta(strongKeymap.shortcuts, {
  displayName: 'Keymap<strong>',
  group: 'Strong',
})
