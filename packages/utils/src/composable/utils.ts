import type {
  Cleanup,
  Ctx,
  MilkdownPlugin,
  SliceType,
  TimerType,
} from '@milkdown/ctx'
import { createTimer } from '@milkdown/ctx'
import { customAlphabet } from 'nanoid'

/// @internal
export const nanoid = customAlphabet('abcedfghicklmn', 10)

/// @internal
export type WithTimer<T> = T & { timer: TimerType }

/// @internal
export function addTimer<
  T extends MilkdownPlugin,
  PluginWithTimer extends T = WithTimer<T>,
>(
  runner: (
    ctx: Ctx,
    plugin: PluginWithTimer,
    done: () => void
  ) => Promise<void | Cleanup>,
  injectTo: SliceType<TimerType[], string>,
  timerName?: string
): PluginWithTimer {
  const timer = createTimer(timerName || nanoid())
  let doneCalled = false

  const plugin: MilkdownPlugin = (ctx) => {
    ctx.record(timer)
    ctx.update(injectTo, (x) => x.concat(timer))

    return async () => {
      const done = () => {
        ctx.done(timer)
        doneCalled = true
      }

      const cleanup = await runner(ctx, <PluginWithTimer>plugin, done)

      if (!doneCalled) ctx.done(timer)

      return () => {
        ctx.update(injectTo, (x) => x.filter((y) => y !== timer))
        ctx.clearTimer(timer)
        cleanup?.()
      }
    }
  }
  ;(<T & { timer: TimerType }>plugin).timer = timer

  return <PluginWithTimer>plugin
}
