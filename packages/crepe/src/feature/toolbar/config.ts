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
  /// Accessible name for the button, rendered as `title` and
  /// `aria-label`. Without it the button exposes no name, because its
  /// only content is an SVG.
  label?: string
  /// Human-readable form of the keyboard shortcut, for example `⌘B` on
  /// macOS or `Ctrl+B` elsewhere. The `title` appends it for display
  /// only. `aria-keyshortcuts` never reads it, because that attribute
  /// has its own grammar.
  shortcut?: string
  /// The same shortcut in `aria-keyshortcuts` grammar. It joins the
  /// modifiers `Alt`, `Control`, `Shift`, `Meta` and `AltGraph` with `+`,
  /// then adds a `KeyboardEvent.key` value, as in `Meta+B` or
  /// `Control+Shift+H`. This field stays separate from `shortcut`,
  /// because a display glyph such as `⌘B` and the abbreviation `Ctrl` are
  /// both invalid here. One field cannot serve both readers.
  ///
  /// Crepe defaults neither field. The host owns the bound combination
  /// and its spelling on each platform.
  ariaKeyshortcuts?: string
  /// A reference to the keymap entry that binds the command of this
  /// item, for example `keymapRef(strongKeymap.key, 'ToggleBold')`. A set
  /// reference derives `shortcut` and `ariaKeyshortcuts` from the single
  /// place that binds the key, so both follow a host rebinding and need
  /// no repetition per UI region. An explicit value in the two string
  /// fields above still wins, for a shortcut that no milkdown keymap
  /// backs.
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

  // The AI button needs both the feature and a provider. Without a
  // provider the palette opens and `runAICmd` rejects every action in
  // silence. The toolbar `aiIcon` wins over `AIFeatureConfig.aiIcon`, so
  // a consumer can override the toolbar entry alone and keep the tooltip
  // prefix. Only an active AI feature injects the `aiProviderConfig`
  // slice, so the flag check has to guard the lookup.
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

  // The keymap reference of an item is the single place that binds the
  // shortcut, so the display form and `aria-keyshortcuts` derive from it
  // and follow a host rebinding. `??=` lets a configured string win. The
  // loop needs a ctx, because the keymap slices live there. The derived
  // value is read at build time, so a rebind reaches the toolbar on its
  // next open, not on an open one.
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
