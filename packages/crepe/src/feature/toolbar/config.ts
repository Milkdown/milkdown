import type { Ctx } from '@milkdown/kit/ctx'

import { toggleLinkCommand } from '@milkdown/kit/component/link-tooltip'
import { commandsCtx, editorViewCtx, schemaCtx } from '@milkdown/kit/core'
import {
  emphasisKeymap,
  emphasisSchema,
  inlineCodeKeymap,
  inlineCodeSchema,
  isMarkSelectedCommand,
  isNodeSelectedCommand,
  linkSchema,
  strongKeymap,
  strongSchema,
  toggleEmphasisCommand,
  toggleInlineCodeCommand,
  toggleStrongCommand,
} from '@milkdown/kit/preset/commonmark'
import {
  strikethroughKeymap,
  strikethroughSchema,
  toggleStrikethroughCommand,
} from '@milkdown/kit/preset/gfm'

import type { ToolbarFeatureConfig } from '.'
import type { KeymapRef } from '../../utils/keyboard-shortcut'

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
import { keymapRef, resolveKeymapShortcut } from '../../utils/keyboard-shortcut'
import { aiProviderConfig } from '../ai/commands'
import { aiInstructionTooltipAPI } from '../ai/instruction-tooltip'
import { mathInlineId, toggleLatexCommandName } from '../latex/constants'

export type ToolbarItem = {
  active: (ctx: Ctx) => boolean
  icon: string
  /// Accessible name for the button, rendered as `title` and `aria-label`.
  /// Without it the button exposes no name at all — its only content is an SVG.
  label?: string
  /// Human-readable form of the item's keyboard shortcut, e.g. `⌘B` on macOS or
  /// `Ctrl+B` elsewhere. Appended to the `title` for display only — it is never
  /// used for `aria-keyshortcuts`, which has its own grammar.
  shortcut?: string
  /// The same shortcut in `aria-keyshortcuts` grammar: `+`-joined modifiers from
  /// `Alt` / `Control` / `Shift` / `Meta` / `AltGraph` plus a `KeyboardEvent.key`
  /// value, e.g. `Meta+B` or `Control+Shift+H`. Kept separate from `shortcut`
  /// because display glyphs (`⌘B`) and the abbreviation `Ctrl` are both invalid
  /// here, and a single field cannot satisfy both readers.
  ///
  /// Crepe defaults neither: which combo is bound, and how it is spelled per
  /// platform, is the host's business.
  ariaKeyshortcuts?: string
  /// A reference to the keymap entry that binds this item's command, e.g.
  /// `keymapRef(strongKeymap.key, 'ToggleBold')`. When set, `shortcut` and
  /// `ariaKeyshortcuts` are derived from it — the single source of truth — so
  /// they follow any host rebinding and never have to be spelled per UI region.
  /// The two string fields above still win when set explicitly, for shortcuts
  /// not backed by a milkdown keymap.
  keymap?: KeymapRef
}

export function getGroups(config?: ToolbarFeatureConfig, ctx?: Ctx) {
  const groupBuilder = new GroupBuilder<ToolbarItem>()

  groupBuilder
    .addGroup('formatting', 'Formatting')
    .addItem('bold', {
      icon: config?.boldIcon ?? boldIcon,
      label: config?.boldLabel ?? 'Bold',
      keymap: keymapRef(strongKeymap.key, 'ToggleBold'),
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
      keymap: keymapRef(emphasisKeymap.key, 'ToggleEmphasis'),
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
      keymap: keymapRef(strikethroughKeymap.key, 'ToggleStrikethrough'),
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
    keymap: keymapRef(inlineCodeKeymap.key, 'ToggleInlineCode'),
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

  const groups = groupBuilder.build()

  // Derive display + `aria-keyshortcuts` from each item's keymap reference —
  // the one place the shortcut is actually bound — so they follow any host
  // rebinding. `??=` lets an explicitly configured string win. Runs only with a
  // ctx (the keymap slices live there); the derived value is read at build time,
  // so a rebind shows up the next time the toolbar opens, not on an open one.
  if (ctx) {
    for (const group of groups) {
      for (const item of group.items) {
        if (!item.keymap) continue
        const resolved = resolveKeymapShortcut(ctx, item.keymap)
        if (!resolved) continue
        item.shortcut ??= resolved.display
        item.ariaKeyshortcuts ??= resolved.aria
      }
    }
  }

  return groups
}
