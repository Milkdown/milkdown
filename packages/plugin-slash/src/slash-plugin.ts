import type { SliceType } from '@milkdown/ctx'
import type { PluginSpec } from '@milkdown/prose/state'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import type { $Ctx, $Prose } from '@milkdown/utils'
import { $ctx, $prose } from '@milkdown/utils'

/// @internal
export type SlashPluginSpecId<Id extends string> = `${Id}_SLASH_SPEC`

/// @internal
export type SlashPlugin<Id extends string, State = any> = [$Ctx<PluginSpec<State>, SlashPluginSpecId<Id>>, $Prose] & {
  key: SliceType<PluginSpec<State>, SlashPluginSpecId<Id>>
  pluginKey: $Prose['key']
}

/// Create a slash plugin with a unique id.
export function slashFactory<Id extends string, State = any>(id: Id) {
  const slashSpec = $ctx<PluginSpec<State>, SlashPluginSpecId<Id>>({}, `${id}_SLASH_SPEC`)
  const slashPlugin = $prose((ctx) => {
    const spec = ctx.get(slashSpec.key)
    return new Plugin({
      key: new PluginKey(`${id}_SLASH`),
      ...spec,
    })
  })
  const result = [slashSpec, slashPlugin] as SlashPlugin<Id>
  result.key = slashSpec.key
  result.pluginKey = slashPlugin.key
  slashSpec.meta = {
    package: '@milkdown/plugin-slash',
    displayName: `Ctx<slashSpec>|${id}`,
  }
  slashPlugin.meta = {
    package: '@milkdown/plugin-slash',
    displayName: `Prose<slash>|${id}`,
  }

  return result
}
