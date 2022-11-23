/* Copyright 2021, Milkdown by Mirone. */

import type { Cmd, CmdKey, Ctx, MilkdownPlugin } from '@milkdown/core'
import { SchemaReady, commandsCtx, commandsTimerCtx, createCmdKey } from '@milkdown/core'

import { addTimer } from './utils'

export type $Command<T> = MilkdownPlugin & {
  run: (payload?: T) => boolean
  key: CmdKey<T>
}

export const $command = <T, K extends string>(key: K, cmd: (ctx: Ctx) => Cmd<T>): $Command<T> => {
  const cmdKey = createCmdKey<T>(key)

  const plugin: MilkdownPlugin = () => async (ctx) => {
    await ctx.wait(SchemaReady)
    const command = cmd(ctx)
    ctx.get(commandsCtx).create(cmdKey, command);
    (<$Command<T>>plugin).run = (payload?: T) => ctx.get(commandsCtx).call(key, payload);
    (<$Command<T>>plugin).key = cmdKey

    return () => {
      ctx.get(commandsCtx).remove(cmdKey)
    }
  }

  return <$Command<T>>plugin
}

export const $commandAsync = <T, K extends string>(key: K, cmd: (ctx: Ctx) => Promise<Cmd<T>>, timerName?: string) => {
  const cmdKey = createCmdKey<T>(key)
  return addTimer<$Command<T>>(
    async (ctx, plugin) => {
      await ctx.wait(SchemaReady)
      const command = await cmd(ctx)
      ctx.get(commandsCtx).create(cmdKey, command);
      (<$Command<T>>plugin).run = (payload?: T) => ctx.get(commandsCtx).call(key, payload);
      (<$Command<T>>plugin).key = cmdKey
      return () => {
        ctx.get(commandsCtx).remove(cmdKey)
      }
    },
    commandsTimerCtx,
    timerName,
  )
}
