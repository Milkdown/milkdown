import type { CmdKey } from '@milkdown/core'
import { commandsCtx } from '@milkdown/core'
import type { Ctx } from '@milkdown/ctx'

type InferParams<T> = T extends CmdKey<infer U> ? U : never

/// Call a command. You can pass the command key and the payload to the macro.
export function callCommand<T extends CmdKey<any>>(
  slice: string,
  payload?: InferParams<T>
): (ctx: Ctx) => boolean
export function callCommand<T>(
  slice: CmdKey<T>,
  payload?: T
): (ctx: Ctx) => boolean
export function callCommand(
  slice: string | CmdKey<any>,
  payload?: any
): (ctx: Ctx) => boolean
export function callCommand(
  slice: string | CmdKey<any>,
  payload?: any
): (ctx: Ctx) => boolean {
  return (ctx: Ctx) => {
    return ctx.get(commandsCtx).call(slice, payload)
  }
}
