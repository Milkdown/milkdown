import type { Ctx } from '@milkdown/ctx'
import type { Node } from '@milkdown/prose/model'

import { commandsCtx } from '@milkdown/core'
import { setBlockType } from '@milkdown/prose/commands'
import { $command, $nodeAttr, $nodeSchema, $useKeymap } from '@milkdown/utils'

import {
  EMPTY_LINE_PLACEHOLDER,
  serializeText,
  withMeta,
} from '../__internal__'
import { remarkPreserveEmptyLinePlugin } from '../plugin/remark-preserve-empty-line'

/// HTML attributes for paragraph node.
export const paragraphAttr = $nodeAttr('paragraph')

withMeta(paragraphAttr, {
  displayName: 'Attr<paragraph>',
  group: 'Paragraph',
})

/// Schema for paragraph node.
export const paragraphSchema = $nodeSchema('paragraph', (ctx) => ({
  content: 'inline*',
  group: 'block',
  parseDOM: [{ tag: 'p' }],
  toDOM: (node) => ['p', ctx.get(paragraphAttr.key)(node), 0],
  parseMarkdown: {
    match: (node) => node.type === 'paragraph',
    runner: (state, node, type) => {
      state.openNode(type)
      if (node.children) state.next(node.children)
      else state.addText((node.value || '') as string)

      state.closeNode()
    },
  },
  toMarkdown: {
    match: (node) => node.type.name === 'paragraph',
    runner: (state, node) => {
      const isEmpty = !node.content || node.content.size === 0

      // Trailing empty paragraphs are not markdown content; emitting them
      // (with or without a placeholder) only produces blank lines that the
      // next load drops anyway — and a trailing placeholder would be read
      // back as a literal user `<br />`.
      if (isEmpty && isInTrailingEmptyRun(state.rootNode, node)) return

      // A `<br />` in a table cell would be indistinguishable from a
      // user-authored one (cell paragraphs are flattened in mdast), and
      // GFM serializes an empty cell fine without it.
      const inTableCell = state.top()?.type === 'tableCell'

      state.openNode('paragraph')
      if (isEmpty && !inTableCell && shouldPreserveEmptyLine(ctx)) {
        state.addNode('html', undefined, EMPTY_LINE_PLACEHOLDER)
      } else {
        serializeText(state, node)
      }
      state.closeNode()
    },
  },
}))

/// Whether the node belongs to the run of empty paragraphs at the very end
/// of the serialized tree. No placeholder is emitted for that run: a
/// placeholder that ends up trailing in the output would be read back as a
/// user-authored `<br />` (see `remarkPreserveEmptyLinePlugin`), and
/// trailing empty paragraphs are not markdown content.
function isInTrailingEmptyRun(root: Node | null, node: Node) {
  if (!root) return false
  for (let i = root.childCount - 1; i >= 0; i--) {
    const child = root.child(i)
    if (child.type.name !== 'paragraph' || child.content.size > 0) return false
    if (child === node) return true
  }
  return false
}

function shouldPreserveEmptyLine(ctx: Ctx) {
  return ctx.isInjected(remarkPreserveEmptyLinePlugin.id)
}

withMeta(paragraphSchema.node, {
  displayName: 'NodeSchema<paragraph>',
  group: 'Paragraph',
})
withMeta(paragraphSchema.ctx, {
  displayName: 'NodeSchemaCtx<paragraph>',
  group: 'Paragraph',
})

/// This command can turn the selected block into paragraph.
export const turnIntoTextCommand = $command(
  'TurnIntoText',
  (ctx) => () => setBlockType(paragraphSchema.type(ctx))
)

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
