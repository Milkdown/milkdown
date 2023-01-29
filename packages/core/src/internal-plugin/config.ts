/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx, MilkdownPlugin } from '@milkdown/ctx'
import { createTimer } from '@milkdown/ctx'

export const ConfigReady = createTimer('ConfigReady')

export type Config = (ctx: Ctx) => void | Promise<void>

export const config
    = (configure: Config): MilkdownPlugin =>
      (ctx) => {
        ctx.record(ConfigReady)

        return async () => {
          await configure(ctx)
          ctx.done(ConfigReady)

          return () => {
            ctx.clearTimer(ConfigReady)
          }
        }
      }
