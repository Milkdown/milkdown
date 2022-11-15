/* Copyright 2021, Milkdown by Mirone. */

import type { Ctx, MilkdownPlugin } from '@milkdown/core'
import { SchemaReady, editorStateTimerCtx, prosePluginsCtx } from '@milkdown/core'
import { keymap } from '@milkdown/prose/keymap'
import type { Command } from '@milkdown/prose/state'

import { addTimer } from './utils'

type Keymap = Record<string, Command>

export type $Shortcut = MilkdownPlugin & {
  keymap: Keymap
}

export const $shortcut = (shortcut: (ctx: Ctx) => Keymap): $Shortcut => {
  const plugin: MilkdownPlugin = () => async (ctx) => {
    await ctx.wait(SchemaReady)
    const k = shortcut(ctx)
    ctx.update(prosePluginsCtx, ps => [...ps, keymap(k)]);
    (<$Shortcut>plugin).keymap = k
  }

  return <$Shortcut>plugin
}

export const $shortcutAsync = (shortcut: (ctx: Ctx) => Promise<Keymap>, timerName?: string) =>
  addTimer<$Shortcut>(
    async (ctx, plugin) => {
      await ctx.wait(SchemaReady)
      const k = await shortcut(ctx)
      ctx.update(prosePluginsCtx, ps => [...ps, keymap(k)])
      plugin.keymap = k
    },
    editorStateTimerCtx,
    timerName,
  )
