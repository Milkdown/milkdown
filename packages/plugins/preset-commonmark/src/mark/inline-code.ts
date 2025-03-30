import { commandsCtx } from '@milkdown/core'
import type { MarkType } from '@milkdown/prose/model'
import {
  $command,
  $inputRule,
  $markAttr,
  $markSchema,
  $useKeymap,
} from '@milkdown/utils'
import { markRule } from '@milkdown/prose'
import { withMeta } from '../__internal__'

/// HTML attributes for the inlineCode mark.
export const inlineCodeAttr = $markAttr('inlineCode')

withMeta(inlineCodeAttr, {
  displayName: 'Attr<inlineCode>',
  group: 'InlineCode',
})

/// InlineCode mark schema.
export const inlineCodeSchema = $markSchema('inlineCode', (ctx) => ({
  priority: 100,
  code: true,
  parseDOM: [{ tag: 'code' }],
  toDOM: (mark) => ['code', ctx.get(inlineCodeAttr.key)(mark)],
  parseMarkdown: {
    match: (node) => node.type === 'inlineCode',
    runner: (state, node, markType) => {
      state.openMark(markType)
      state.addText(node.value as string)
      state.closeMark(markType)
    },
  },
  toMarkdown: {
    match: (mark) => mark.type.name === 'inlineCode',
    runner: (state, mark, node) => {
      state.withMark(mark, 'inlineCode', node.text || '')
    },
  },
}))

withMeta(inlineCodeSchema.mark, {
  displayName: 'MarkSchema<inlineCode>',
  group: 'InlineCode',
})

withMeta(inlineCodeSchema.ctx, {
  displayName: 'MarkSchemaCtx<inlineCode>',
  group: 'InlineCode',
})

/// A command to toggle the inlineCode mark.
export const toggleInlineCodeCommand = $command(
  'ToggleInlineCode',
  (ctx) => () => (state, dispatch) => {
    const { selection, tr } = state
    if (selection.empty) return false
    const { from, to } = selection

    const has = state.doc.rangeHasMark(from, to, inlineCodeSchema.type(ctx))
    // remove exists inlineCode mark if have
    if (has) {
      dispatch?.(tr.removeMark(from, to, inlineCodeSchema.type(ctx)))
      return true
    }

    const restMarksName = Object.keys(state.schema.marks).filter(
      (x) => x !== inlineCodeSchema.type.name
    )

    // remove other marks
    restMarksName
      .map((name) => state.schema.marks[name] as MarkType)
      .forEach((t) => {
        tr.removeMark(from, to, t)
      })

    // add inlineCode mark
    dispatch?.(tr.addMark(from, to, inlineCodeSchema.type(ctx).create()))
    return true
  }
)

withMeta(toggleInlineCodeCommand, {
  displayName: 'Command<toggleInlineCodeCommand>',
  group: 'InlineCode',
})

/// Input rule for create inlineCode mark.
export const inlineCodeInputRule = $inputRule((ctx) => {
  return markRule(/(?:`)([^`]+)(?:`)$/, inlineCodeSchema.type(ctx))
})

withMeta(inlineCodeInputRule, {
  displayName: 'InputRule<inlineCodeInputRule>',
  group: 'InlineCode',
})

/// Keymap for the inlineCode mark.
/// - `Mod-e` - Toggle the inlineCode mark.
export const inlineCodeKeymap = $useKeymap('inlineCodeKeymap', {
  ToggleInlineCode: {
    shortcuts: 'Mod-e',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(toggleInlineCodeCommand.key)
    },
  },
})

withMeta(inlineCodeKeymap.ctx, {
  displayName: 'KeymapCtx<inlineCode>',
  group: 'InlineCode',
})

withMeta(inlineCodeKeymap.shortcuts, {
  displayName: 'Keymap<inlineCode>',
  group: 'InlineCode',
})
