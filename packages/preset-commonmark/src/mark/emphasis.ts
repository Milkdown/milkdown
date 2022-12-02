/* Copyright 2021, Milkdown by Mirone. */
import { commandsCtx } from '@milkdown/core'
import { toggleMark } from '@milkdown/prose/commands'
import { $attr, $command, $markSchema, $useKeymap } from '@milkdown/utils'

export const emphasisAttr = $attr('emphasis', {})

export const emphasisSchema = $markSchema('emphasis', ctx => ({
  inclusive: false,
  parseDOM: [
    { tag: 'i' },
    { tag: 'em' },
    { style: 'font-style', getAttrs: value => (value === 'italic') as false },
  ],
  toDOM: () => ['em', ctx.get(emphasisAttr.key)],
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

export const toggleEmphasisCommand = $command('ToggleEmphasis', () => () => toggleMark(emphasisSchema.type()))

export const emphasisKeymap = $useKeymap('emphasisKeymap', {
  ToggleEmphasis: {
    shortcuts: 'Mod-i',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(toggleEmphasisCommand.key)
    },
  },
})

