import type { Ctx } from '@milkdown/kit/ctx'

import { toggleLinkCommand } from '@milkdown/kit/component/link-tooltip'
import { commandsCtx, editorViewCtx } from '@milkdown/kit/core'
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
  aiIcon,
  boldIcon,
  codeIcon,
  functionsIcon,
  italicIcon,
  linkIcon,
  strikethroughIcon,
} from '../../icons'
import { GroupBuilder } from '../../utils/group-builder'
import { aiProviderConfig } from '../ai/commands'
import { aiInstructionTooltipAPI } from '../ai/instruction-tooltip'
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

  // Skip the AI button entirely when the feature is disabled or when no
  // provider is configured — without a provider the palette would open
  // but `runAICmd` would silently reject every action. Toolbar-level
  // `aiIcon` wins over `AIFeatureConfig.aiIcon` so consumers can override
  // just the toolbar entry without touching the tooltip prefix.
  // The aiProviderConfig slice is only injected when the AI feature is
  // active, so guard the lookup behind the flag check.
  if (ctx && flags?.includes(CrepeFeature.AI)) {
    const aiCfg = ctx.get(aiProviderConfig.key)
    if (aiCfg.provider) {
      functionGroup.addItem('ai', {
        icon: config?.aiIcon ?? aiCfg.aiIcon ?? aiIcon,
        active: () => false,
        onRun: (ctx) => {
          const api = ctx.get(aiInstructionTooltipAPI.key)
          const view = ctx.get(editorViewCtx)
          const { from, to } = view.state.selection
          api.show(from, to)
        },
      })
    }
  }

  config?.buildToolbar?.(groupBuilder)

  return groupBuilder.build()
}
