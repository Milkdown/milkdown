import { commandsCtx } from '@milkdown/core'
import { Selection, TextSelection } from '@milkdown/prose/state'
import { $command, $nodeAttr, $nodeSchema, $useKeymap } from '@milkdown/utils'
import { withMeta } from '../__internal__'

/// HTML attributes for the hardbreak node.
///
/// Default value:
/// - `data-is-inline` - Whether the hardbreak is inline.
export const hardbreakAttr = $nodeAttr('hardbreak', (node) => {
  return {
    'data-type': 'hardbreak',
    'data-is-inline': node.attrs.isInline,
  }
})

withMeta(hardbreakAttr, {
  displayName: 'Attr<hardbreak>',
  group: 'Hardbreak',
})

/// Hardbreak node schema.
export const hardbreakSchema = $nodeSchema('hardbreak', (ctx) => ({
  inline: true,
  group: 'inline',
  attrs: {
    isInline: {
      default: false,
    },
  },
  selectable: false,
  parseDOM: [
    { tag: 'br' },
    {
      tag: 'span[data-type="hardbreak"]',
      getAttrs: () => ({ isInline: true }),
    },
  ],
  toDOM: (node) =>
    node.attrs.isInline
      ? ['span', ctx.get(hardbreakAttr.key)(node), ' ']
      : ['br', ctx.get(hardbreakAttr.key)(node)],
  parseMarkdown: {
    match: ({ type }) => type === 'break',
    runner: (state, node, type) => {
      state.addNode(type, {
        isInline: Boolean(
          (node.data as undefined | { isInline: boolean })?.isInline
        ),
      })
    },
  },
  leafText: () => '\n',
  toMarkdown: {
    match: (node) => node.type.name === 'hardbreak',
    runner: (state, node) => {
      if (node.attrs.isInline) state.addNode('text', undefined, '\n')
      else state.addNode('break')
    },
  },
}))

withMeta(hardbreakSchema.node, {
  displayName: 'NodeSchema<hardbreak>',
  group: 'Hardbreak',
})

withMeta(hardbreakSchema.ctx, {
  displayName: 'NodeSchemaCtx<hardbreak>',
  group: 'Hardbreak',
})

/// Command to insert a hardbreak.
export const insertHardbreakCommand = $command(
  'InsertHardbreak',
  (ctx) => () => (state, dispatch) => {
    const { selection, tr } = state
    if (!(selection instanceof TextSelection)) return false

    if (selection.empty) {
      // Transform two successive hardbreak into a new line
      const node = selection.$from.node()
      if (node.childCount > 0 && node.lastChild?.type.name === 'hardbreak') {
        dispatch?.(
          tr
            .replaceRangeWith(
              selection.to - 1,
              selection.to,
              state.schema.node('paragraph')
            )
            .setSelection(Selection.near(tr.doc.resolve(selection.to)))
            .scrollIntoView()
        )
        return true
      }
    }
    dispatch?.(
      tr
        .setMeta('hardbreak', true)
        .replaceSelectionWith(hardbreakSchema.type(ctx).create())
        .scrollIntoView()
    )
    return true
  }
)

withMeta(insertHardbreakCommand, {
  displayName: 'Command<insertHardbreakCommand>',
  group: 'Hardbreak',
})

/// Keymap for the hardbreak node.
/// - `Shift-Enter` - Insert a hardbreak.
export const hardbreakKeymap = $useKeymap('hardbreakKeymap', {
  InsertHardbreak: {
    shortcuts: 'Shift-Enter',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(insertHardbreakCommand.key)
    },
  },
})

withMeta(hardbreakKeymap.ctx, {
  displayName: 'KeymapCtx<hardbreak>',
  group: 'Hardbreak',
})

withMeta(hardbreakKeymap.shortcuts, {
  displayName: 'Keymap<hardbreak>',
  group: 'Hardbreak',
})
