/* Copyright 2021, Milkdown by Mirone. */
import type { Slice } from '@milkdown/core'
import type { PluginView } from '@milkdown/prose/state'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import type { $Ctx, $Prose } from '@milkdown/utils'
import { $ctx, $prose } from '@milkdown/utils'

export type TooltipViewFactory = (view: EditorView) => PluginView
export type TooltipViewId<Id extends string> = `${Id}_TOOLTIP_VIEW`

export type TooltipPlugin<Id extends string> = [$Ctx<TooltipViewFactory, TooltipViewId<Id>>, $Prose] & {
  key: Slice<TooltipViewFactory, TooltipViewId<Id>>
  pluginKey: $Prose['key']
}

export const tooltipFactory = <Id extends string>(id: Id) => {
  const tooltipView = $ctx<TooltipViewFactory, TooltipViewId<Id>>(() => ({}), `${id}_TOOLTIP_VIEW`)
  const tooltipPlugin = $prose((ctx) => {
    const view = ctx.get(tooltipView.key)
    return new Plugin({
      key: new PluginKey(`${id}_TOOLTIP`),
      view,
    })
  })
  const result = [tooltipView, tooltipPlugin] as TooltipPlugin<Id>
  result.key = tooltipView.key
  result.pluginKey = tooltipPlugin.key

  return result
}

export const tooltip = tooltipFactory('MILKDOWN')
