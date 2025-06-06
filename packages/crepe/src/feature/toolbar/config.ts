import type { Ctx } from '@milkdown/kit/ctx'

import { toggleLinkCommand } from '@milkdown/kit/component/link-tooltip'
import { commandsCtx } from '@milkdown/kit/core'
import {
  emphasisSchema,
  inlineCodeSchema,
  isMarkSelectedCommand,
  isNodeSelectedCommand,
  linkSchema,
  strongSchema,
  toggleEmphasisCommand,
  toggleInlineCodeCommand,
  toggleStrongCommand,
} from '@milkdown/kit/preset/commonmark'
import {
  strikethroughSchema,
  toggleStrikethroughCommand,
} from '@milkdown/kit/preset/gfm'

import type { ToolbarFeatureConfig } from '.'

import { CrepeFeature } from '..'
import { useCrepeFeatures } from '../../core/slice'
import {
  boldIcon,
  codeIcon,
  functionsIcon,
  italicIcon,
  linkIcon,
  strikethroughIcon,
} from '../../icons'
import { GroupBuilder } from '../../utils/group-builder'
import { toggleLatexCommand } from '../latex/command'
import { mathInlineSchema } from '../latex/inline-latex'

export type ToolbarItem = {
  active: (ctx: Ctx) => boolean
  icon: string
}

export function getGroups(config?: ToolbarFeatureConfig, ctx?: Ctx) {
  const groupBuilder = new GroupBuilder<ToolbarItem>()

  groupBuilder
    .addGroup('formatting', 'Formatting')
    .addItem('bold', {
      icon: config?.boldIcon ?? boldIcon,
      active: (ctx) => {
        const commands = ctx.get(commandsCtx)
        return commands.call(isMarkSelectedCommand.key, strongSchema.type(ctx))
      },
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        commands.call(toggleStrongCommand.key)
      },
    })
    .addItem('italic', {
      icon: config?.italicIcon ?? italicIcon,
      active: (ctx) => {
        const commands = ctx.get(commandsCtx)
        return commands.call(
          isMarkSelectedCommand.key,
          emphasisSchema.type(ctx)
        )
      },
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        commands.call(toggleEmphasisCommand.key)
      },
    })
    .addItem('strikethrough', {
      icon: config?.strikethroughIcon ?? strikethroughIcon,
      active: (ctx) => {
        const commands = ctx.get(commandsCtx)
        return commands.call(
          isMarkSelectedCommand.key,
          strikethroughSchema.type(ctx)
        )
      },
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        commands.call(toggleStrikethroughCommand.key)
      },
    })

  const functionGroup = groupBuilder.addGroup('function', 'Function')
  functionGroup.addItem('code', {
    icon: config?.codeIcon ?? codeIcon,
    active: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return commands.call(
        isMarkSelectedCommand.key,
        inlineCodeSchema.type(ctx)
      )
    },
    onRun: (ctx) => {
      const commands = ctx.get(commandsCtx)
      commands.call(toggleInlineCodeCommand.key)
    },
  })

  const flags = ctx && useCrepeFeatures(ctx).get()
  const isLatexEnabled = flags?.includes(CrepeFeature.Latex)
  if (isLatexEnabled) {
    functionGroup.addItem('latex', {
      icon: config?.latexIcon ?? functionsIcon,
      active: (ctx) => {
        const commands = ctx.get(commandsCtx)
        return commands.call(
          isNodeSelectedCommand.key,
          mathInlineSchema.type(ctx)
        )
      },
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        commands.call(toggleLatexCommand.key)
      },
    })
  }
  functionGroup.addItem('link', {
    icon: config?.linkIcon ?? linkIcon,
    active: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return commands.call(isMarkSelectedCommand.key, linkSchema.type(ctx))
    },
    onRun: (ctx) => {
      const commands = ctx.get(commandsCtx)
      commands.call(toggleLinkCommand.key)
    },
  })

  config?.buildToolbar?.(groupBuilder)

  return groupBuilder.build()
}
