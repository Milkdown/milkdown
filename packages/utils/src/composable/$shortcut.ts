import type { Ctx, MilkdownPlugin } from '@milkdown/ctx'
import type { Command } from '@milkdown/prose/state'

import {
  KeymapReady,
  editorStateTimerCtx,
  keymapCtx,
  type KeymapItem,
} from '@milkdown/core'

import { addTimer } from './utils'

/// @internal
export type Keymap = Record<string, Command | KeymapItem>

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
    await ctx.wait(KeymapReady)
    const km = ctx.get(keymapCtx)
    const keymap = shortcut(ctx)
    const dispose = km.addObjectKeymap(keymap)
    ;(<$Shortcut>plugin).keymap = keymap

    return () => {
      dispose()
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
      await ctx.wait(KeymapReady)
      const km = ctx.get(keymapCtx)
      const keymap = await shortcut(ctx)
      const dispose = km.addObjectKeymap(keymap)
      plugin.keymap = keymap

      return () => {
        dispose()
      }
    },
    editorStateTimerCtx,
    timerName
  )
}
