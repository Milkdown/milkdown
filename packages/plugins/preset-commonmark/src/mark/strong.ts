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

/// HTML attributes for the strong mark.
export const strongAttr = $markAttr('strong')

withMeta(strongAttr, {
  displayName: 'Attr<strong>',
  group: 'Strong',
})

/// Strong mark schema.
export const strongSchema = $markSchema('strong', (ctx) => ({
  attrs: {
    marker: {
      default: ctx.get(remarkStringifyOptionsCtx).strong || '*',
    },
  },
  parseDOM: [
    // This works around a Google Docs misbehavior where
    // pasted content will be inexplicably wrapped in `<b>`
    // tags with a font-weight normal.
    {
      tag: 'b',
      getAttrs: (node: HTMLElement) =>
        node.style.fontWeight != 'normal' && null,
    },
    { tag: 'strong' },
    { style: 'font-style', getAttrs: (value) => (value === 'bold') as false },
    { style: 'font-weight=400', clearMark: (m) => m.type.name == 'strong' },
    {
      style: 'font-weight',
      getAttrs: (value: string) =>
        /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
    },
  ],
  toDOM: (mark) => ['strong', ctx.get(strongAttr.key)(mark)],
  parseMarkdown: {
    match: (node) => node.type === 'strong',
    runner: (state, node, markType) => {
      state.openMark(markType, { marker: node.marker })
      state.next(node.children)
      state.closeMark(markType)
    },
  },
  toMarkdown: {
    match: (mark) => mark.type.name === 'strong',
    runner: (state, mark) => {
      state.withMark(mark, 'strong', undefined, {
        marker: mark.attrs.marker,
      })
    },
  },
}))

withMeta(strongSchema.mark, {
  displayName: 'MarkSchema<strong>',
  group: 'Strong',
})

withMeta(strongSchema.ctx, {
  displayName: 'MarkSchemaCtx<strong>',
  group: 'Strong',
})

/// A command to toggle the strong mark.
export const toggleStrongCommand = $command('ToggleStrong', (ctx) => () => {
  return toggleMark(strongSchema.type(ctx))
})

withMeta(toggleStrongCommand, {
  displayName: 'Command<toggleStrongCommand>',
  group: 'Strong',
})

/// A input rule that will capture the strong mark.
export const strongInputRule = $inputRule((ctx) => {
  return markRule(/(?:\*\*|__)([^*_]+)(?:\*\*|__)$/, strongSchema.type(ctx), {
    getAttr: (match) => {
      return {
        marker: match[0].startsWith('*') ? '*' : '_',
      }
    },
  })
})

withMeta(strongInputRule, {
  displayName: 'InputRule<strong>',
  group: 'Strong',
})

/// Keymap for the strong mark.
/// - `Mod-b` - Toggle the strong mark.
export const strongKeymap = $useKeymap('strongKeymap', {
  ToggleBold: {
    shortcuts: ['Mod-b'],
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(toggleStrongCommand.key)
    },
  },
})

withMeta(strongKeymap.ctx, {
  displayName: 'KeymapCtx<strong>',
  group: 'Strong',
})

withMeta(strongKeymap.shortcuts, {
  displayName: 'Keymap<strong>',
  group: 'Strong',
})
