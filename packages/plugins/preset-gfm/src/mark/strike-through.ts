import { commandsCtx } from '@milkdown/core'
import { $command, $inputRule, $markAttr, $markSchema, $useKeymap } from '@milkdown/utils'
import { toggleMark } from '@milkdown/prose/commands'
import { markRule } from '@milkdown/prose'
import { withMeta } from '../__internal__'

/// HTML attributes for the strikethrough mark.
export const strikethroughAttr = $markAttr('strike_through')

withMeta(strikethroughAttr, {
  displayName: 'Attr<strikethrough>',
  group: 'Strikethrough',
})

/// Strikethrough mark schema.
export const strikethroughSchema = $markSchema('strike_through', ctx => ({
  parseDOM: [
    { tag: 'del' },
    { style: 'text-decoration', getAttrs: value => (value === 'line-through') as false },
  ],
  toDOM: mark => ['del', ctx.get(strikethroughAttr.key)(mark)],
  parseMarkdown: {
    match: node => node.type === 'delete',
    runner: (state, node, markType) => {
      state.openMark(markType)
      state.next(node.children)
      state.closeMark(markType)
    },
  },
  toMarkdown: {
    match: mark => mark.type.name === 'strike_through',
    runner: (state, mark) => {
      state.withMark(mark, 'delete')
    },
  },
}))

withMeta(strikethroughSchema.mark, {
  displayName: 'MarkSchema<strikethrough>',
  group: 'Strikethrough',
})

withMeta(strikethroughSchema.ctx, {
  displayName: 'MarkSchemaCtx<strikethrough>',
  group: 'Strikethrough',
})

/// A command to toggle the strikethrough mark.
export const toggleStrikethroughCommand = $command('ToggleStrikeThrough', ctx => () => {
  return toggleMark(strikethroughSchema.type(ctx))
})

withMeta(toggleStrikethroughCommand, {
  displayName: 'Command<ToggleStrikethrough>',
  group: 'Strikethrough',
})

/// Input rule to create the strikethrough mark.
export const strikethroughInputRule = $inputRule((ctx) => {
  return markRule(/~([^~]+)~$/, strikethroughSchema.type(ctx))
})

withMeta(strikethroughInputRule, {
  displayName: 'InputRule<strikethrough>',
  group: 'Strikethrough',
})

/// Keymap for the strikethrough mark.
/// - `Mod-Alt-x` - Toggle the strikethrough mark.
export const strikethroughKeymap = $useKeymap('strikeThroughKeymap', {
  ToggleStrikethrough: {
    shortcuts: 'Mod-Alt-x',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(toggleStrikethroughCommand.key)
    },
  },
})

withMeta(strikethroughKeymap.ctx, {
  displayName: 'KeymapCtx<strikethrough>',
  group: 'Strikethrough',
})

withMeta(strikethroughKeymap.shortcuts, {
  displayName: 'Keymap<strikethrough>',
  group: 'Strikethrough',
})
