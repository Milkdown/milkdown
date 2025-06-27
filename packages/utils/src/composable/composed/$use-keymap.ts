import type { Ctx, SliceType } from '@milkdown/ctx'
import type { Command } from '@milkdown/prose/state'

import type { $Ctx } from '../$ctx'
import type { $Shortcut, Keymap } from '../$shortcut'

import { $ctx } from '../$ctx'
import { $shortcut } from '../$shortcut'

/// @internal
export type KeymapConfig<K extends string> = Record<
  K,
  {
    shortcuts: string | string[]
    priority?: number
  }
>

/// @internal
export interface KeymapItem {
  shortcuts: string | string[]
  priority?: number
  command: (ctx: Ctx) => Command
}

/// @internal
export type UserKeymapConfig<Key extends string> = Record<Key, KeymapItem>

/// @internal
export type $UserKeymap<N extends string, Key extends string> = [
  $Ctx<KeymapConfig<Key>, `${N}Keymap`>,
  $Shortcut,
] & {
  key: SliceType<KeymapConfig<Key>, `${N}Keymap`>
  keymap: Keymap
  ctx: $Ctx<KeymapConfig<Key>, `${N}Keymap`>
  shortcuts: $Shortcut
}

/// Create a keymap which can be customized by user.
/// It takes two arguments:
/// - `name`: The name of the keymap.
/// - `userKeymap`: The keymap config which contains the shortcuts and the command.
export function $useKeymap<N extends string, Key extends string>(
  name: N,
  userKeymap: UserKeymapConfig<Key>
) {
  const key = Object.fromEntries(
    Object.entries<KeymapItem>(userKeymap).map(
      ([key, { shortcuts, priority }]) => {
        return [key, { shortcuts, priority }]
      }
    )
  ) as KeymapConfig<Key>

  const keymapDef = $ctx<KeymapConfig<Key>, `${N}Keymap`>(key, `${name}Keymap`)

  const shortcuts = $shortcut((ctx) => {
    const keys = ctx.get(keymapDef.key)

    const keymapTuple = Object.entries<KeymapItem>(userKeymap).flatMap(
      ([key, { command }]) => {
        const target = keys[key as Key]
        const targetKeys = [target.shortcuts].flat()
        const priority = target.priority

        return targetKeys.map(
          (targetKey) =>
            [
              targetKey,
              {
                key: targetKey,
                onRun: command,
                priority,
              },
            ] as const
        )
      }
    )

    return Object.fromEntries(keymapTuple)
  })

  const result = [keymapDef, shortcuts] as $UserKeymap<N, Key>
  result.ctx = keymapDef
  result.shortcuts = shortcuts
  result.key = keymapDef.key
  result.keymap = shortcuts.keymap

  return result
}
