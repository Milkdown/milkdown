import { commandsCtx } from '@milkdown/core'
import { setBlockType } from '@milkdown/prose/commands'
import { $command, $nodeAttr, $nodeSchema, $useKeymap } from '@milkdown/utils'
import { serializeText, withMeta } from '../__internal__'

/// HTML attributes for paragraph node.
export const paragraphAttr = $nodeAttr('paragraph')

withMeta(paragraphAttr, {
  displayName: 'Attr<paragraph>',
  group: 'Paragraph',
})

/// Schema for paragraph node.
export const paragraphSchema = $nodeSchema('paragraph', ctx => ({
  content: 'inline*',
  group: 'block',
  parseDOM: [{ tag: 'p' }],
  toDOM: node => ['p', ctx.get(paragraphAttr.key)(node), 0],
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
      serializeText(state, node)
      state.closeNode()
    },
  },
}))

withMeta(paragraphSchema.node, {
  displayName: 'NodeSchema<paragraph>',
  group: 'Paragraph',
})
withMeta(paragraphSchema.ctx, {
  displayName: 'NodeSchemaCtx<paragraph>',
  group: 'Paragraph',
})

/// This command can turn the selected block into paragraph.
export const turnIntoTextCommand = $command('TurnIntoText', ctx => () => setBlockType(paragraphSchema.type(ctx)))

withMeta(turnIntoTextCommand, {
  displayName: 'Command<turnIntoTextCommand>',
  group: 'Paragraph',
})

/// Keymap for paragraph node.
/// - `<Mod-Alt-0>`: Turn the selected block into paragraph.
export const paragraphKeymap = $useKeymap('paragraphKeymap', {
  TurnIntoText: {
    shortcuts: 'Mod-Alt-0',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(turnIntoTextCommand.key)
    },
  },
})

withMeta(paragraphKeymap.ctx, {
  displayName: 'KeymapCtx<paragraph>',
  group: 'Paragraph',
})

withMeta(paragraphKeymap.shortcuts, {
  displayName: 'Keymap<paragraph>',
  group: 'Paragraph',
})
