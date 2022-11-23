/* Copyright 2021, Milkdown by Mirone. */
import { commandsCtx } from '@milkdown/core'
import { toggleMark } from '@milkdown/prose/commands'
import { $command, $markSchema, $useKeymap } from '@milkdown/utils'

export const strongSchema = $markSchema('strong', () => ({
  inclusive: false,
  parseDOM: [
    { tag: 'b' },
    { tag: 'strong' },
    { style: 'font-style', getAttrs: value => (value === 'bold') as false },
  ],
  toDOM: () => ['strong'],
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

export const toggleStrongCommand = $command('ToggleStrong', () => () => toggleMark(strongSchema.type))

export const strongKeymap = $useKeymap('strongKeymap', {
  ToggleBold: {
    shortcuts: ['Mod-b'],
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(toggleStrongCommand.key)
    },
  },
})
