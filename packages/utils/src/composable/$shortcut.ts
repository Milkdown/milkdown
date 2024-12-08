import type { Ctx, MilkdownPlugin } from '@milkdown/ctx'
import {
  SchemaReady,
  editorStateTimerCtx,
  prosePluginsCtx,
} from '@milkdown/core'
import { keymap } from '@milkdown/prose/keymap'
import type { Command } from '@milkdown/prose/state'

import { addTimer } from './utils'

/// @internal
export type Keymap = Record<string, Command>

/// @internal
export type $Shortcut = MilkdownPlugin & {
  keymap: Keymap
}

/// Create a shortcut for the editor.
/// It takes a factory function which returns a [prosemirror keymap](https://prosemirror.net/docs/ref/#keymap).
///
/// Additional property:
/// - `keymap`: The prosemirror keymap created.
export function $shortcut(shortcut: (ctx: Ctx) => Keymap): $Shortcut {
  const plugin: MilkdownPlugin = (ctx) => async () => {
    await ctx.wait(SchemaReady)
    const k = shortcut(ctx)
    const keymapPlugin = keymap(k)
    ctx.update(prosePluginsCtx, (ps) => [...ps, keymapPlugin])
    ;(<$Shortcut>plugin).keymap = k

    return () => {
      ctx.update(prosePluginsCtx, (ps) => ps.filter((x) => x !== keymapPlugin))
    }
  }

  return <$Shortcut>plugin
}

/// The async version for `$shortcut`. You can use `await` in the factory when creating the keymap.
///
/// Additional property:
/// - `keymap`: The prosemirror keymap created.
/// - `timer`: The timer which will be resolved when the plugin is ready.
export function $shortcutAsync(
  shortcut: (ctx: Ctx) => Promise<Keymap>,
  timerName?: string
) {
  return addTimer<$Shortcut>(
    async (ctx, plugin) => {
      await ctx.wait(SchemaReady)
      const k = await shortcut(ctx)
      const keymapPlugin = keymap(k)
      ctx.update(prosePluginsCtx, (ps) => [...ps, keymapPlugin])
      plugin.keymap = k

      return () => {
        ctx.update(prosePluginsCtx, (ps) =>
          ps.filter((x) => x !== keymapPlugin)
        )
      }
    },
    editorStateTimerCtx,
    timerName
  )
}
