import type { Ctx } from '@milkdown/kit/ctx'

import { toggleLinkCommand } from '@milkdown/kit/component/link-tooltip'
import { commandsCtx, editorViewCtx, schemaCtx } from '@milkdown/kit/core'
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
import { mathInlineId, toggleLatexCommandName } from '../latex/constants'

export type ToolbarItem = {
  active: (ctx: Ctx) => boolean
  icon: string
  /// Accessible name for the button, rendered as `title` and `aria-label`.
  /// Without it the button exposes no name at all — its only content is an SVG.
  label?: string
  /// Display form of the item's keyboard shortcut, e.g. `⌘B` or `Ctrl+B`.
  /// Appended to the `title` and exposed as `aria-keyshortcuts`. Crepe sets no
  /// default: the combo a host actually binds is the host's business, and
  /// rendering it per platform is too.
  shortcut?: string
}

export function getGroups(config?: ToolbarFeatureConfig, ctx?: Ctx) {
  const groupBuilder = new GroupBuilder<ToolbarItem>()

  groupBuilder
    .addGroup('formatting', 'Formatting')
    .addItem('bold', {
      icon: config?.boldIcon ?? boldIcon,
      label: config?.boldLabel ?? 'Bold',
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
      label: config?.italicLabel ?? 'Italic',
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
      label: config?.strikethroughLabel ?? 'Strikethrough',
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
    label: config?.codeLabel ?? 'Inline code',
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
      label: config?.latexLabel ?? 'Inline math',
      active: (ctx) => {
        const commands = ctx.get(commandsCtx)
        const nodeType = ctx.get(schemaCtx).nodes[mathInlineId]
        return commands.call(isNodeSelectedCommand.key, nodeType)
      },
      onRun: (ctx) => {
        const commands = ctx.get(commandsCtx)
        commands.call(toggleLatexCommandName)
      },
    })
  }
  functionGroup.addItem('link', {
    icon: config?.linkIcon ?? linkIcon,
    label: config?.linkLabel ?? 'Link',
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
        label: config?.aiLabel ?? 'Ask AI',
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
