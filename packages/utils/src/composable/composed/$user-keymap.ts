/* Copyright 2021, Milkdown by Mirone. */

import type { Ctx, SliceType } from '@milkdown/ctx'
import type { Command } from '@milkdown/prose/state'
import type { $Ctx } from '../$ctx'
import { $ctx } from '../$ctx'
import type { $Shortcut, Keymap } from '../$shortcut'
import { $shortcut } from '../$shortcut'

export type KeymapConfig<K extends string> = Record<K, string | string[]>

export type KeymapItem = {
  shortcuts: string | string[]
  command: (ctx: Ctx) => Command
}

export type UserKeymapConfig<Key extends string> = Record<Key, KeymapItem>

export type $UserKeymap<N extends string, Key extends string> = [$Ctx<KeymapConfig<Key>, `${N}Keymap`>, $Shortcut] & {
  key: SliceType<KeymapConfig<Key>, `${N}Keymap`>
  keymap: Keymap
}

export const $useKeymap = <N extends string, Key extends string>(name: N, userKeymap: UserKeymapConfig<Key>) => {
  const key = Object.fromEntries(Object.entries<KeymapItem>(userKeymap).map(([key, { shortcuts }]) => {
    return [key, shortcuts]
  })) as Record<Key, string | string[]>

  const keymapDef = $ctx(key, `${name}Keymap`)

  const shortcuts = $shortcut((ctx) => {
    const keys = ctx.get(keymapDef.key)

    const keymapTuple = Object.entries<KeymapItem>(userKeymap).flatMap(([key, { command }]) => {
      const targetKeys: string[] = [keys[key as Key]].flat()

      return targetKeys.map(targetKey => [targetKey, command(ctx)] as const)
    })

    return Object.fromEntries(keymapTuple)
  })

  const result = [keymapDef, shortcuts] as $UserKeymap<N, Key>
  result.key = keymapDef.key
  result.keymap = shortcuts.keymap

  return result
}
