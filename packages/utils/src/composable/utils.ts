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
/// Replace the entry with the given id in place, or append it if absent.
/// Preserving registration order matters: re-registering a schema (e.g. via
/// `extendSchema`) must not move it to the end, otherwise ProseMirror's
/// content-match walk can pick a different first node type and recurse forever.
export function upsertById<T extends readonly [string, unknown]>(
  list: T[],
  id: string,
  entry: T
): T[] {
  const idx = list.findIndex(([x]) => x === id)
  if (idx === -1) return [...list, entry]
  const next = list.slice()
  next[idx] = entry
  return next
}

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
        if (cleanup) {
          const result = cleanup()
          if (result && 'then' in result) {
            result.catch(console.error)
          }
        }
      }
    }
  }
  ;(<T & { timer: TimerType }>plugin).timer = timer

  return <PluginWithTimer>plugin
}
