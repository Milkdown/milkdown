import type { Ctx, MilkdownPlugin } from '@milkdown/ctx'
import { InitReady, remarkPluginsCtx } from '@milkdown/core'

import type { RemarkPlugin, RemarkPluginRaw } from '@milkdown/transformer'
import type { $Ctx } from '../$ctx'
import { $ctx } from '../$ctx'

/// @internal
export type $Remark<Id extends string, Options> = [
  optionsCtx: $Ctx<Options, Id>,
  plugin: MilkdownPlugin,
] & {
  id: Id
  plugin: MilkdownPlugin
  options: $Ctx<Options, Id>
}

/// Create a milkdown wrapper for [remark plugin](https://github.com/remarkjs/remark/blob/main/doc/plugins.md).
/// It takes a factory function which returns a [remark plugin](https://github.com/remarkjs/remark/blob/main/doc/plugins.md).
///
/// Additional property:
/// - `id`: The id of the remark plugin.
/// - `plugin`: The remark plugin created.
/// - `options`: The ctx contains the options of the remark plugin.
export function $remark<Id extends string, Options>(
  id: Id,
  remark: (ctx: Ctx) => RemarkPluginRaw<Options>,
  initialOptions?: Options
): $Remark<Id, Options> {
  const options = $ctx<Options, Id>(initialOptions ?? ({} as Options), id)
  const plugin: MilkdownPlugin = (ctx) => async () => {
    await ctx.wait(InitReady)
    const re = remark(ctx)
    const remarkPlugin: RemarkPlugin<Options> = {
      plugin: re,
      options: ctx.get(options.key),
    }
    ctx.update(remarkPluginsCtx, (rp) => [...rp, remarkPlugin as RemarkPlugin])

    return () => {
      ctx.update(remarkPluginsCtx, (rp) => rp.filter((x) => x !== remarkPlugin))
    }
  }

  const result = [options, plugin] as $Remark<Id, Options>
  result.id = id
  result.plugin = plugin
  result.options = options

  return result
}
