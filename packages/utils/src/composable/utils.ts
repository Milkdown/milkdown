/* Copyright 2021, Milkdown by Mirone. */
import type { Cleanup, Ctx, MilkdownPlugin, Slice, Timer } from '@milkdown/core'
import { createTimer } from '@milkdown/core'
import { customAlphabet } from 'nanoid'

export const nanoid = customAlphabet('abcedfghicklmn', 10)

export const addTimer = <T extends MilkdownPlugin, PluginWithTimer extends T = T & { timer: Timer }>(
  runner: (ctx: Ctx, plugin: PluginWithTimer, done: () => void) => Promise<void | Cleanup>,
  injectTo: Slice<Timer[], string>,
  timerName?: string,
): PluginWithTimer => {
  const timer = createTimer(timerName || nanoid())
  let doneCalled = false

  const plugin: MilkdownPlugin = () => {
    return async (ctx) => {
      const done = () => {
        ctx.done(timer)
        doneCalled = true
      }
      ctx.update(injectTo, x => x.concat(timer))

      const cleanup = await runner(ctx, <PluginWithTimer>plugin, done)

      if (!doneCalled)
        ctx.done(timer)

      return (post) => {
        ctx.update(injectTo, x => x.filter(y => y !== timer))
        post.clearTimer(timer)
        cleanup?.(post)
      }
    }
  };
  (<T & { timer: Timer }>plugin).timer = timer

  return <PluginWithTimer>plugin
}
