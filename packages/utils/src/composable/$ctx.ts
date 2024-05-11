import type { MilkdownPlugin, SliceType } from '@milkdown/ctx'
import { createSlice } from '@milkdown/ctx'

/// @internal
export type $Ctx<T, N extends string> = MilkdownPlugin & {
  key: SliceType<T, N>
}

/// Create a slice plugin. The plugin will be registered in the `ctx` and can be accessed by other parts of the editor.
/// ```ts
/// const counterCtx = $ctx(0, 'counter');
/// ```
///
/// Additional property:
/// - `key`: The key of the slice.
export function $ctx<T, N extends string>(value: T, name: N): $Ctx<T, N> {
  const slice = createSlice(value, name)
  const plugin: $Ctx<T, N> = (ctx) => {
    ctx.inject(slice)
    return () => {
      return () => {
        ctx.remove(slice)
      }
    }
  }

  plugin.key = slice

  return plugin
}
