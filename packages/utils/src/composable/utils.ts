/* Copyright 2021, Milkdown by Mirone. */
import type { Cleanup, Ctx, MilkdownPlugin, SliceType, TimerType } from '@milkdown/core'
import { createTimer } from '@milkdown/core'
import { customAlphabet } from 'nanoid'

export const nanoid = customAlphabet('abcedfghicklmn', 10)

export const addTimer = <T extends MilkdownPlugin, PluginWithTimer extends T = T & { timer: TimerType }>(
  runner: (ctx: Ctx, plugin: PluginWithTimer, done: () => void) => Promise<void | Cleanup>,
  injectTo: SliceType<TimerType[], string>,
  timerName?: string,
): PluginWithTimer => {
  const timer = createTimer(timerName || nanoid())
  let doneCalled = false

  const plugin: MilkdownPlugin = (ctx) => {
    return async () => {
      const done = () => {
        ctx.done(timer)
        doneCalled = true
      }
      ctx.update(injectTo, x => x.concat(timer))

      const cleanup = await runner(ctx, <PluginWithTimer>plugin, done)

      if (!doneCalled)
        ctx.done(timer)

      return () => {
        ctx.update(injectTo, x => x.filter(y => y !== timer))
        ctx.clearTimer(timer)
        cleanup?.()
      }
    }
  };
  (<T & { timer: TimerType }>plugin).timer = timer

  return <PluginWithTimer>plugin
}
