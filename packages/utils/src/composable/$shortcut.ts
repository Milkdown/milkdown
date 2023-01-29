/* Copyright 2021, Milkdown by Mirone. */

import type { Ctx, MilkdownPlugin } from '@milkdown/core'
import { SchemaReady, editorStateTimerCtx, prosePluginsCtx } from '@milkdown/core'
import { keymap } from '@milkdown/prose/keymap'
import type { Command } from '@milkdown/prose/state'

import { addTimer } from './utils'

export type Keymap = Record<string, Command>

export type $Shortcut = MilkdownPlugin & {
  keymap: Keymap
}

export const $shortcut = (shortcut: (ctx: Ctx) => Keymap): $Shortcut => {
  const plugin: MilkdownPlugin = ctx => async () => {
    await ctx.wait(SchemaReady)
    const k = shortcut(ctx)
    const keymapPlugin = keymap(k)
    ctx.update(prosePluginsCtx, ps => [...ps, keymapPlugin]);
    (<$Shortcut>plugin).keymap = k

    return () => {
      ctx.update(prosePluginsCtx, ps => ps.filter(x => x !== keymapPlugin))
    }
  }

  return <$Shortcut>plugin
}

export const $shortcutAsync = (shortcut: (ctx: Ctx) => Promise<Keymap>, timerName?: string) =>
  addTimer<$Shortcut>(
    async (ctx, plugin) => {
      await ctx.wait(SchemaReady)
      const k = await shortcut(ctx)
      const keymapPlugin = keymap(k)
      ctx.update(prosePluginsCtx, ps => [...ps, keymapPlugin])
      plugin.keymap = k

      return () => {
        ctx.update(prosePluginsCtx, ps => ps.filter(x => x !== keymapPlugin))
      }
    },
    editorStateTimerCtx,
    timerName,
  )
