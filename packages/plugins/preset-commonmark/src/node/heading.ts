import { commandsCtx, editorViewCtx } from '@milkdown/core'
import { expectDomTypeError } from '@milkdown/exception'
import { setBlockType } from '@milkdown/prose/commands'
import { textblockTypeInputRule } from '@milkdown/prose/inputrules'
import type { Node } from '@milkdown/prose/model'
import {
  $command,
  $ctx,
  $inputRule,
  $nodeAttr,
  $nodeSchema,
  $useKeymap,
} from '@milkdown/utils'
import { serializeText, withMeta } from '../__internal__'
import { paragraphSchema } from './paragraph'

const headingIndex = Array(6)
  .fill(0)
  .map((_, i) => i + 1)

function defaultHeadingIdGenerator(node: Node) {
  return node.textContent
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
}

/// This is a slice contains a function to generate heading id.
/// You can configure it to generate id in your own way.
export const headingIdGenerator = $ctx(
  defaultHeadingIdGenerator,
  'headingIdGenerator'
)

withMeta(headingIdGenerator, {
  displayName: 'Ctx<HeadingIdGenerator>',
  group: 'Heading',
})

/// HTML attributes for heading node.
export const headingAttr = $nodeAttr('heading')

withMeta(headingAttr, {
  displayName: 'Attr<heading>',
  group: 'Heading',
})

/// Schema for heading node.
export const headingSchema = $nodeSchema('heading', (ctx) => {
  const getId = ctx.get(headingIdGenerator.key)
  return {
    content: 'inline*',
    group: 'block',
    defining: true,
    attrs: {
      id: {
        default: '',
      },
      level: {
        default: 1,
      },
    },
    parseDOM: headingIndex.map((x) => ({
      tag: `h${x}`,
      getAttrs: (node) => {
        if (!(node instanceof HTMLElement)) throw expectDomTypeError(node)

        return { level: x, id: node.id }
      },
    })),
    toDOM: (node) => {
      return [
        `h${node.attrs.level}`,
        {
          ...ctx.get(headingAttr.key)(node),
          id: node.attrs.id || getId(node),
        },
        0,
      ]
    },
    parseMarkdown: {
      match: ({ type }) => type === 'heading',
      runner: (state, node, type) => {
        const depth = node.depth as number
        state.openNode(type, { level: depth })
        state.next(node.children)
        state.closeNode()
      },
    },
    toMarkdown: {
      match: (node) => node.type.name === 'heading',
      runner: (state, node) => {
        state.openNode('heading', undefined, { depth: node.attrs.level })
        serializeText(state, node)
        state.closeNode()
      },
    },
  }
})

withMeta(headingSchema.node, {
  displayName: 'NodeSchema<heading>',
  group: 'Heading',
})

withMeta(headingSchema.ctx, {
  displayName: 'NodeSchemaCtx<heading>',
  group: 'Heading',
})

/// This input rule can turn the selected block into heading.
/// You can input numbers of `#` and a `space` to create heading.
export const wrapInHeadingInputRule = $inputRule((ctx) => {
  return textblockTypeInputRule(
    /^(?<hashes>#+)\s$/,
    headingSchema.type(ctx),
    (match) => {
      const x = match.groups?.hashes?.length || 0

      const view = ctx.get(editorViewCtx)
      const { $from } = view.state.selection
      const node = $from.node()
      if (node.type.name === 'heading') {
        let level = Number(node.attrs.level) + Number(x)
        if (level > 6) level = 6

        return { level }
      }
      return { level: x }
    }
  )
})

withMeta(wrapInHeadingInputRule, {
  displayName: 'InputRule<wrapInHeadingInputRule>',
  group: 'Heading',
})

/// This command can turn the selected block into heading.
/// You can pass the level of heading to this command.
/// By default, the level is 1, which means it will create a `h1` element.
export const wrapInHeadingCommand = $command('WrapInHeading', (ctx) => {
  return (level?: number) => {
    level ??= 1

    if (level < 1) return setBlockType(paragraphSchema.type(ctx))

    return setBlockType(headingSchema.type(ctx), { level })
  }
})

withMeta(wrapInHeadingCommand, {
  displayName: 'Command<wrapInHeadingCommand>',
  group: 'Heading',
})

/// This command can downgrade the selected heading.
/// For example, if you have a `h2` element, and you call this command, you will get a `h1` element.
/// If the element is already a `h1` element, it will turn it into a `p` element.
export const downgradeHeadingCommand = $command(
  'DowngradeHeading',
  (ctx) => () => (state, dispatch, view) => {
    const { $from } = state.selection
    const node = $from.node()
    if (
      node.type !== headingSchema.type(ctx) ||
      !state.selection.empty ||
      $from.parentOffset !== 0
    )
      return false

    const level = node.attrs.level - 1
    if (!level)
      return setBlockType(paragraphSchema.type(ctx))(state, dispatch, view)

    dispatch?.(
      state.tr.setNodeMarkup(state.selection.$from.before(), undefined, {
        ...node.attrs,
        level,
      })
    )
    return true
  }
)

withMeta(downgradeHeadingCommand, {
  displayName: 'Command<downgradeHeadingCommand>',
  group: 'Heading',
})

/// Keymap for heading node.
/// - `<Mod-Alt-{1-6}>`: Turn the selected block into `h{1-6}` element.
/// - `<Delete>/<Backspace>`: Downgrade the selected heading.
export const headingKeymap = $useKeymap('headingKeymap', {
  TurnIntoH1: {
    shortcuts: 'Mod-Alt-1',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(wrapInHeadingCommand.key, 1)
    },
  },
  TurnIntoH2: {
    shortcuts: 'Mod-Alt-2',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(wrapInHeadingCommand.key, 2)
    },
  },
  TurnIntoH3: {
    shortcuts: 'Mod-Alt-3',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(wrapInHeadingCommand.key, 3)
    },
  },
  TurnIntoH4: {
    shortcuts: 'Mod-Alt-4',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(wrapInHeadingCommand.key, 4)
    },
  },
  TurnIntoH5: {
    shortcuts: 'Mod-Alt-5',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(wrapInHeadingCommand.key, 5)
    },
  },
  TurnIntoH6: {
    shortcuts: 'Mod-Alt-6',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(wrapInHeadingCommand.key, 6)
    },
  },
  DowngradeHeading: {
    shortcuts: ['Delete', 'Backspace'],
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(downgradeHeadingCommand.key)
    },
  },
})

withMeta(headingKeymap.ctx, {
  displayName: 'KeymapCtx<heading>',
  group: 'Heading',
})

withMeta(headingKeymap.shortcuts, {
  displayName: 'Keymap<heading>',
  group: 'Heading',
})
