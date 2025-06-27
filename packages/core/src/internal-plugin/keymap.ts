import type { Command } from '@milkdown/prose/state'

import {
  createSlice,
  createTimer,
  type Ctx,
  type MilkdownPlugin,
  type SliceType,
} from '@milkdown/ctx'
import { ctxCallOutOfScope } from '@milkdown/exception'
import {
  baseKeymap,
  chainCommands,
  deleteSelection,
  joinTextblockBackward,
  selectNodeBackward,
} from '@milkdown/prose/commands'
import { undoInputRule } from '@milkdown/prose/inputrules'

import { SchemaReady } from './schema'

/// @internal
export type KeymapItem = {
  key: string
  onRun: (ctx: Ctx) => Command
  priority?: number
}

/// @internal
export type KeymapKey = SliceType<KeymapItem>

function overrideBaseKeymap(keymap: Record<string, Command>) {
  const handleBackspace = chainCommands(
    undoInputRule,
    deleteSelection,
    joinTextblockBackward,
    selectNodeBackward
  )
  keymap.Backspace = handleBackspace
  return keymap
}

/// The keymap manager.
/// This class is used to manage the keymap.
export class KeymapManager {
  /// @internal
  #ctx: Ctx | null = null

  #keymap: KeymapItem[] = []

  /// @internal
  setCtx = (ctx: Ctx) => {
    this.#ctx = ctx
  }

  get ctx() {
    return this.#ctx
  }

  /// Add a keymap item.
  /// When not passing a priority, the priority will be 50.
  /// For the same key, the keymap with higher priority will be executed first.
  /// If the priority is the same, the keymap will be executed in the order of addition.
  add = (keymap: KeymapItem) => {
    this.#keymap.push(keymap)

    return () => {
      this.#keymap = this.#keymap.filter((item) => item !== keymap)
    }
  }

  /// Add an object of keymap items.
  addObjectKeymap = (keymaps: Record<string, Command | KeymapItem>) => {
    const remove: (() => void)[] = []
    Object.entries(keymaps).forEach(([key, command]) => {
      if (typeof command === 'function') {
        const keymapItem = {
          key,
          onRun: () => command,
        }

        this.#keymap.push(keymapItem)
        remove.push(() => {
          this.#keymap = this.#keymap.filter((item) => item !== keymapItem)
        })
      } else {
        this.#keymap.push(command)
        remove.push(() => {
          this.#keymap = this.#keymap.filter((item) => item !== command)
        })
      }
    })

    return () => {
      remove.forEach((fn) => fn())
    }
  }

  /// Add the prosemirror base keymap.
  addBaseKeymap = () => {
    const base = overrideBaseKeymap(baseKeymap)
    return this.addObjectKeymap(base)
  }

  /// @internal
  build = () => {
    const keymap: Record<string, KeymapItem[]> = {}
    this.#keymap.forEach((item) => {
      keymap[item.key] = [...(keymap[item.key] || []), item]
    })

    const output: Record<string, Command> = Object.fromEntries(
      Object.entries(keymap).map(([key, items]) => {
        const sortedItems = items.sort(
          (a, b) => (b.priority ?? 50) - (a.priority ?? 50)
        )

        const command: Command = (state, dispatch, view) => {
          const ctx = this.#ctx
          if (ctx == null) throw ctxCallOutOfScope()

          const commands = sortedItems.map((item) => item.onRun(ctx))
          const chained = chainCommands(...commands)

          return chained(state, dispatch, view)
        }

        return [key, command] as const
      })
    )

    return output
  }
}

/// A slice which stores the keymap manager.
export const keymapCtx = createSlice(new KeymapManager(), 'keymap')

/// A slice which stores timers that need to be waited for before starting to run the plugin.
/// By default, it's `[SchemaReady]`.
export const keymapTimerCtx = createSlice([SchemaReady], 'keymapTimer')

/// The timer which will be resolved when the keymap plugin is ready.
export const KeymapReady = createTimer('KeymapReady')

/// The keymap plugin.
/// This plugin will create a keymap manager.
///
/// This plugin will wait for the schema plugin.
export const keymap: MilkdownPlugin = (ctx) => {
  const km = new KeymapManager()
  km.setCtx(ctx)
  ctx
    .inject(keymapCtx, km)
    .inject(keymapTimerCtx, [SchemaReady])
    .record(KeymapReady)

  return async () => {
    await ctx.waitTimers(keymapTimerCtx)

    ctx.done(KeymapReady)

    return () => {
      ctx.remove(keymapCtx).remove(keymapTimerCtx).clearTimer(KeymapReady)
    }
  }
}
