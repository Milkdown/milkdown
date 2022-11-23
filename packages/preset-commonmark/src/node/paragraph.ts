/* Copyright 2021, Milkdown by Mirone. */
import { commandsCtx } from '@milkdown/core'
import { setBlockType } from '@milkdown/prose/commands'
import type { Node } from '@milkdown/prose/model'
import { Fragment } from '@milkdown/prose/model'
import { $command, $nodeSchema, $useKeymap } from '@milkdown/utils'

export const paragraphSchema = $nodeSchema('paragraph', () => ({
  content: 'inline*',
  group: 'block',
  parseDOM: [{ tag: 'p' }],
  toDOM: () => ['p', 0],
  parseMarkdown: {
    match: node => node.type === 'paragraph',
    runner: (state, node, type) => {
      state.openNode(type)
      if (node.children)
        state.next(node.children)

      else
        state.addText((node.value || '') as string)

      state.closeNode()
    },
  },
  toMarkdown: {
    match: node => node.type.name === 'paragraph',
    runner: (state, node) => {
      state.openNode('paragraph')
      const lastIsHardbreak = node.childCount >= 1 && node.lastChild?.type.name === 'hardbreak'
      if (lastIsHardbreak) {
        const contentArr: Node[] = []
        node.content.forEach((n, _, i) => {
          if (i === node.childCount - 1)
            return

          contentArr.push(n)
        })
        state.next(Fragment.fromArray(contentArr))
      }
      else {
        state.next(node.content)
      }
      state.closeNode()
    },
  },
}))

export const turnIntoTextCommand = $command('TurnIntoText', () => () => setBlockType(paragraphSchema.type))

export const paragraphKeymap = $useKeymap('paragraphKeymap', {
  TurnIntoText: {
    shortcuts: 'Mod-Alt-0',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(turnIntoTextCommand.key)
    },
  },
})
