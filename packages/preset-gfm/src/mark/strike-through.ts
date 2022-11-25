/* Copyright 2021, Milkdown by Mirone. */
import { commandsCtx } from '@milkdown/core'
import { toggleMark } from '@milkdown/prose/commands'
import { $command, $markSchema, $useKeymap } from '@milkdown/utils'

export const strikethroughSchema = $markSchema('strike_through', () => ({
  inclusive: false,
  parseDOM: [
    { tag: 'del' },
    { style: 'text-decoration', getAttrs: value => (value === 'line-through') as false },
  ],
  toDOM: () => ['del'],
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

export const toggleStrikethroughCommand = $command('ToggleStrikeThrough', () => () => toggleMark(strikethroughSchema.type()))

export const strikethroughKeymap = $useKeymap('strikeThroughKeymap', {
  ToggleStrikethrough: {
    shortcuts: 'Mod-Alt-x',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(toggleStrikethroughCommand.key)
    },
  },
})

