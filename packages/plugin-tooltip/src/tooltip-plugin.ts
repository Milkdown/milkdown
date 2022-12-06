/* Copyright 2021, Milkdown by Mirone. */
import type { Slice } from '@milkdown/core'
import type { PluginSpec } from '@milkdown/prose/state'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import type { $Ctx, $Prose } from '@milkdown/utils'
import { $ctx, $prose } from '@milkdown/utils'

export type TooltipSpecId<Id extends string> = `${Id}_TOOLTIP_SPEC`

export type TooltipPlugin<Id extends string, State = any> = [$Ctx<PluginSpec<State>, TooltipSpecId<Id>>, $Prose] & {
  key: Slice<PluginSpec<State>, TooltipSpecId<Id>>
  pluginKey: $Prose['key']
}

export const tooltipFactory = <Id extends string, State = any>(id: Id) => {
  const tooltipSpec = $ctx<PluginSpec<State>, TooltipSpecId<Id>>({}, `${id}_TOOLTIP_SPEC`)
  const tooltipPlugin = $prose((ctx) => {
    const spec = ctx.get(tooltipSpec.key)
    return new Plugin({
      key: new PluginKey(`${id}_TOOLTIP`),
      ...spec,
    })
  })
  const result = [tooltipSpec, tooltipPlugin] as TooltipPlugin<Id>
  result.key = tooltipSpec.key
  result.pluginKey = tooltipPlugin.key

  return result
}

export const tooltip = tooltipFactory('MILKDOWN')
