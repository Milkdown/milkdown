/* Copyright 2021, Milkdown by Mirone. */
import { commandsCtx, createCmd, createCmdKey } from '@milkdown/core'
import { wrapIn } from '@milkdown/prose/commands'
import { wrappingInputRule } from '@milkdown/prose/inputrules'
import { $command, $ctx, $inputRule, $node, $shortcut } from '@milkdown/utils'

export const blockquoteNode = $node('blockquote', () => ({
  content: 'block+',
  group: 'block',
  defining: true,
  parseDOM: [{ tag: 'blockquote' }],
  toDOM: () => ['blockquote', 0],
  parseMarkdown: {
    match: ({ type }) => type === 'blockquote',
    runner: (state, node, type) => {
      state.openNode(type).next(node.children).closeNode()
    },
  },
  toMarkdown: {
    match: node => node.type.name === 'blockquote',
    runner: (state, node) => {
      state.openNode('blockquote').next(node.content).closeNode()
    },
  },
}))

export const wrapInBlockquoteInputRule = $inputRule(() => wrappingInputRule(/^\s*>\s$/, blockquoteNode.type))

export const WrapInBlockquote = createCmdKey('WrapInBlockquote')
export const wrapInBlockquoteCommand = $command(() => createCmd(WrapInBlockquote, () => wrapIn(blockquoteNode.type)))

export const blockquoteKeys = $ctx({ WrapInBlockquote: 'Mod-Shift-b' }, 'BlockquoteConfig')

export const blockquoteShortcuts = $shortcut((ctx) => {
  const commands = ctx.get(commandsCtx)
  const keys = ctx.get(blockquoteKeys.slice)
  return {
    [keys.WrapInBlockquote]: () => commands.call(WrapInBlockquote),
  }
})

export const blockquote = [blockquoteNode, wrapInBlockquoteInputRule, wrapInBlockquoteCommand, blockquoteKeys, blockquoteShortcuts]
