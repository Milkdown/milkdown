import { commandsCtx, remarkStringifyOptionsCtx } from '@milkdown/core'
import {
  $command,
  $inputRule,
  $markAttr,
  $markSchema,
  $useKeymap,
} from '@milkdown/utils'
import { toggleMark } from '@milkdown/prose/commands'
import { markRule } from '@milkdown/prose'
import { withMeta } from '../__internal__'

/// HTML attributes for the emphasis mark.
export const emphasisAttr = $markAttr('emphasis')

withMeta(emphasisAttr, {
  displayName: 'Attr<emphasis>',
  group: 'Emphasis',
})

/// Emphasis mark schema.
export const emphasisSchema = $markSchema('emphasis', (ctx) => ({
  attrs: {
    marker: {
      default: ctx.get(remarkStringifyOptionsCtx).emphasis || '*',
    },
  },
  parseDOM: [
    { tag: 'i' },
    { tag: 'em' },
    { style: 'font-style', getAttrs: (value) => (value === 'italic') as false },
  ],
  toDOM: (mark) => ['em', ctx.get(emphasisAttr.key)(mark)],
  parseMarkdown: {
    match: (node) => node.type === 'emphasis',
    runner: (state, node, markType) => {
      state.openMark(markType, { marker: node.marker })
      state.next(node.children)
      state.closeMark(markType)
    },
  },
  toMarkdown: {
    match: (mark) => mark.type.name === 'emphasis',
    runner: (state, mark) => {
      state.withMark(mark, 'emphasis', undefined, {
        marker: mark.attrs.marker,
      })
    },
  },
}))

withMeta(emphasisSchema.mark, {
  displayName: 'MarkSchema<emphasis>',
  group: 'Emphasis',
})

withMeta(emphasisSchema.ctx, {
  displayName: 'MarkSchemaCtx<emphasis>',
  group: 'Emphasis',
})

/// A command to toggle the emphasis mark.
export const toggleEmphasisCommand = $command('ToggleEmphasis', (ctx) => () => {
  return toggleMark(emphasisSchema.type(ctx))
})

withMeta(toggleEmphasisCommand, {
  displayName: 'Command<toggleEmphasisCommand>',
  group: 'Emphasis',
})

/// Input rule for use `*` to create emphasis mark.
export const emphasisStarInputRule = $inputRule((ctx) => {
  return markRule(/(?:^|[^*])\*([^*]+)\*$/, emphasisSchema.type(ctx), {
    getAttr: () => ({
      marker: '*',
    }),
    updateCaptured: ({ fullMatch, start }) =>
      !fullMatch.startsWith('*')
        ? { fullMatch: fullMatch.slice(1), start: start + 1 }
        : {},
  })
})

withMeta(emphasisStarInputRule, {
  displayName: 'InputRule<emphasis>|Star',
  group: 'Emphasis',
})

/// Input rule for use `_` to create emphasis mark.
export const emphasisUnderscoreInputRule = $inputRule((ctx) => {
  return markRule(/(?:^|[^_])_([^_]+)_$/, emphasisSchema.type(ctx), {
    getAttr: () => ({
      marker: '_',
    }),
    updateCaptured: ({ fullMatch, start }) =>
      !fullMatch.startsWith('_')
        ? { fullMatch: fullMatch.slice(1), start: start + 1 }
        : {},
  })
})

withMeta(emphasisUnderscoreInputRule, {
  displayName: 'InputRule<emphasis>|Underscore',
  group: 'Emphasis',
})

/// Keymap for the emphasis mark.
/// - `Mod-i` - Toggle the emphasis mark.
export const emphasisKeymap = $useKeymap('emphasisKeymap', {
  ToggleEmphasis: {
    shortcuts: 'Mod-i',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(toggleEmphasisCommand.key)
    },
  },
})

withMeta(emphasisKeymap.ctx, {
  displayName: 'KeymapCtx<emphasis>',
  group: 'Emphasis',
})

withMeta(emphasisKeymap.shortcuts, {
  displayName: 'Keymap<emphasis>',
  group: 'Emphasis',
})
