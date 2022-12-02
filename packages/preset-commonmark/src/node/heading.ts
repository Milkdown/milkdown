/* Copyright 2021, Milkdown by Mirone. */
import { commandsCtx, editorViewCtx } from '@milkdown/core'
import { expectDomTypeError } from '@milkdown/exception'
import { setBlockType } from '@milkdown/prose/commands'
import { textblockTypeInputRule } from '@milkdown/prose/inputrules'
import type { Node } from '@milkdown/prose/model'
import { Fragment } from '@milkdown/prose/model'
import { $attr, $command, $ctx, $inputRule, $nodeSchema, $useKeymap } from '@milkdown/utils'
import { paragraphSchema } from './paragraph'

const headingIndex = Array(6)
  .fill(0)
  .map((_, i) => i + 1)

const defaultHeadingIdGenerator = (node: Node) =>
  node.textContent
    .replace(/[\p{P}\p{S}]/gu, '')
    .replace(/\s/g, '-')
    .toLowerCase()
    .trim()

export const headingIdGenerator = $ctx(defaultHeadingIdGenerator, 'headingIdGenerator')

export const headingAttr = $attr('heading', {})

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
    parseDOM: headingIndex.map(x => ({
      tag: `h${x}`,
      getAttrs: (node) => {
        if (!(node instanceof HTMLElement))
          throw expectDomTypeError(node)

        return { level: x, id: node.id }
      },
    })),
    toDOM: (node) => {
      return [
        `h${node.attrs.level}`,
        {
          ...ctx.get(headingAttr.key),
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
      match: node => node.type.name === 'heading',
      runner: (state, node) => {
        state.openNode('heading', undefined, { depth: node.attrs.level })
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
  }
})

export const wrapInHeadingInputRule = $inputRule((ctx) => {
  return textblockTypeInputRule(/^(?<hashes>#+)\s$/, headingSchema.type(), (match) => {
    const x = match.groups?.hashes?.length || 0

    const view = ctx.get(editorViewCtx)
    const { $from } = view.state.selection
    const node = $from.node()
    if (node.type.name === 'heading') {
      let level = Number(node.attrs.level) + Number(x)
      if (level > 6)
        level = 6

      return { level }
    }
    return { level: x }
  })
},
)

export const wrapInHeadingCommand = $command('WrapInHeading', () => {
  return (level?: number) => {
    level ??= 1

    if (level < 1)
      return setBlockType(paragraphSchema.type())

    return setBlockType(headingSchema.type(), { level })
  }
})

export const downgradeHeadingCommand = $command('DowngradeHeading', () => () =>
  (state, dispatch, view) => {
    const { $from } = state.selection
    const node = $from.node()
    if (node.type !== headingSchema.type() || !state.selection.empty || $from.parentOffset !== 0)
      return false

    const level = node.attrs.level - 1
    if (!level)
      return setBlockType(paragraphSchema.type())(state, dispatch, view)

    dispatch?.(
      state.tr.setNodeMarkup(state.selection.$from.before(), undefined, {
        ...node.attrs,
        level,
      }),
    )
    return true
  })

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
      return () => commands.call(wrapInHeadingCommand.key, 3)
    },
  },
  TurnIntoH5: {
    shortcuts: 'Mod-Alt-5',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(wrapInHeadingCommand.key, 3)
    },
  },
  TurnIntoH6: {
    shortcuts: 'Mod-Alt-6',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(wrapInHeadingCommand.key, 3)
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

