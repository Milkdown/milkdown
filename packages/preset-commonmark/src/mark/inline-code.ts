/* Copyright 2021, Milkdown by Mirone. */
import { commandsCtx } from '@milkdown/core'
import type { MarkType } from '@milkdown/prose/model'
import { $command, $markAttr, $markSchema, $useKeymap } from '@milkdown/utils'

export const inlineCodeAttr = $markAttr('inlineCode')
export const inlineCodeSchema = $markSchema('inlineCode', ctx => ({
  priority: 100,
  code: true,
  inclusive: false,
  parseDOM: [{ tag: 'code' }],
  toDOM: mark => ['code', ctx.get(inlineCodeAttr.key)(mark)],
  parseMarkdown: {
    match: node => node.type === 'inlineCode',
    runner: (state, node, markType) => {
      state.openMark(markType)
      state.addText(node.value as string)
      state.closeMark(markType)
    },
  },
  toMarkdown: {
    match: mark => mark.type.name === 'inlineCode',
    runner: (state, mark, node) => {
      state.withMark(mark, 'inlineCode', node.text || '')
    },
  },
}))

export const toggleInlineCodeCommand = $command('ToggleInlineCode', () => () => (state, dispatch) => {
  const { selection, tr } = state
  if (selection.empty)
    return false
  const { from, to } = selection

  const has = state.doc.rangeHasMark(from, to, inlineCodeSchema.type())
  // remove exists inlineCode mark if have
  if (has) {
    dispatch?.(tr.removeMark(from, to, inlineCodeSchema.type()))
    return true
  }

  const restMarksName = Object.keys(state.schema.marks).filter(x => x !== inlineCodeSchema.type.name)

  // remove other marks
  restMarksName
    .map(name => state.schema.marks[name] as MarkType)
    .forEach((t) => {
      tr.removeMark(from, to, t)
    })

  // add inlineCode mark
  dispatch?.(tr.addMark(from, to, inlineCodeSchema.type().create()))
  return true
})

export const inlineCodeKeymap = $useKeymap('inlineCodeKeymap', {
  ToggleInlineCode: {
    shortcuts: 'Mod-e',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(toggleInlineCodeCommand.key)
    },
  },
})

