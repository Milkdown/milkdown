/* Copyright 2021, Milkdown by Mirone. */
import { commandsCtx } from '@milkdown/core'
import { Selection } from '@milkdown/prose/state'
import { $command, $nodeSchema, $useKeymap } from '@milkdown/utils'

export const hardbreakSchema = $nodeSchema('hardbreak', () => ({
  inline: true,
  group: 'inline',
  selectable: false,
  parseDOM: [{ tag: 'br' }],
  toDOM: () => ['br'],
  parseMarkdown: {
    match: ({ type }) => type === 'break',
    runner: (state, _, type) => {
      state.addNode(type)
    },
  },
  toMarkdown: {
    match: node => node.type.name === 'hardbreak',
    runner: (state) => {
      state.addNode('break')
    },
  },
}))

export const insertHardbreakCommand = $command('InsertHardbreak', () => () => (state, dispatch) => {
  const { selection, tr } = state
  if (selection.empty) {
    // Transform two successive hardbreak into a new line
    const node = selection.$from.node()
    if (node.childCount > 0 && node.lastChild?.type.name === 'hardbreak') {
      dispatch?.(
        tr
          .replaceRangeWith(selection.to - 1, selection.to, state.schema.node('paragraph'))
          .setSelection(Selection.near(tr.doc.resolve(selection.to)))
          .scrollIntoView(),
      )
      return true
    }
  }
  dispatch?.(tr.setMeta('hardbreak', true).replaceSelectionWith(hardbreakSchema.type.create()).scrollIntoView())
  return true
})

export const hardbreakKeymap = $useKeymap('hardbreakKeymap', {
  InsertHardbreak: {
    shortcuts: 'Shift-Enter',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(insertHardbreakCommand.key)
    },
  },
})

