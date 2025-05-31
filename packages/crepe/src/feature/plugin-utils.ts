import type { Ctx } from '@milkdown/kit/ctx'
import type { Selection } from '@milkdown/kit/prose/state'

import { editorViewCtx } from '@milkdown/kit/core'

/// Utility types for plugin development

/// A helper function type for toolbar item state checking
export type ToolbarStateChecker = (ctx: Ctx, selection: Selection) => boolean

/// A helper function type for toolbar item actions
export type ToolbarAction = (ctx: Ctx) => void

/// A helper function type for slash menu actions
export type SlashMenuAction = (ctx: Ctx) => void

/// Common toolbar item configurations
export const ToolbarItemPresets = {
  /// Creates a toolbar item that's disabled when selection is empty
  requiresSelection: (config: {
    key: string
    icon: string
    tooltip?: string
    onClick: ToolbarAction
    isActive?: ToolbarStateChecker
  }) => ({
    ...config,
    isDisabled: (_ctx: Ctx, selection: Selection) => selection.empty,
  }),

  /// Creates a toolbar item that's always enabled
  alwaysEnabled: (config: {
    key: string
    icon: string
    tooltip?: string
    onClick: ToolbarAction
    isActive?: ToolbarStateChecker
  }) => ({
    ...config,
    isDisabled: () => false,
  }),
}

/// Common slash menu item configurations
export const SlashMenuItemPresets = {
  /// Creates a simple text insertion item
  textInsertion: (config: {
    key: string
    label: string
    icon: string
    text: string
  }) => ({
    key: config.key,
    label: config.label,
    icon: config.icon,
    onRun: (ctx: Ctx) => {
      const view = ctx.get(editorViewCtx)
      const { dispatch, state } = view
      const tr = state.tr.insertText(config.text)
      dispatch(tr)
    },
  }),

  /// Creates a block replacement item
  blockReplacement: (config: {
    key: string
    label: string
    icon: string
    nodeType: any // NodeType from prosemirror
    attrs?: any
  }) => ({
    key: config.key,
    label: config.label,
    icon: config.icon,
    onRun: (ctx: Ctx) => {
      const view = ctx.get(editorViewCtx)
      const { dispatch, state } = view
      const { from, to } = state.selection
      const tr = state.tr.setBlockType(from, to, config.nodeType, config.attrs)
      dispatch(tr)
    },
  }),
}
