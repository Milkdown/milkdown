import type { Ctx, MilkdownPlugin, SliceType } from '@milkdown/ctx'
import { Container, createSlice, createTimer } from '@milkdown/ctx'
import { callCommandBeforeEditorView } from '@milkdown/exception'
import type { Command } from '@milkdown/prose/state'

import { withMeta } from '../__internal__'
import { SchemaReady } from './schema'
import { editorViewCtx } from './atoms'

/// @internal
export type Cmd<T = undefined> = (payload?: T) => Command

/// @internal
export type CmdKey<T = undefined> = SliceType<Cmd<T>>

type InferParams<T> = T extends CmdKey<infer U> ? U : never

/// The command manager.
/// This manager will manage all commands in editor.
/// Generally, you don't need to use this manager directly.
/// You can use the `$command` and `$commandAsync` in `@milkdown/utils` to create and call a command.
export class CommandManager {
  /// @internal
  #container = new Container()

  /// @internal
  #ctx: Ctx | null = null

  /// @internal
  setCtx = (ctx: Ctx) => {
    this.#ctx = ctx
  }

  get ctx() {
    return this.#ctx
  }

  /// Register a command into the manager.
  create<T>(meta: CmdKey<T>, value: Cmd<T>) {
    const slice = meta.create(this.#container.sliceMap)
    slice.set(value)
    return slice
  }

  /// Get a command from the manager.
  get<T extends CmdKey<any>>(slice: string): Cmd<InferParams<T>>
  get<T>(slice: CmdKey<T>): Cmd<T>
  get(slice: string | CmdKey<any>): Cmd<any>
  get(slice: string | CmdKey<any>): Cmd<any> {
    return this.#container.get(slice).get()
  }

  /// Remove a command from the manager.
  remove<T extends CmdKey<any>>(slice: string): void
  remove<T>(slice: CmdKey<T>): void
  remove(slice: string | CmdKey<any>): void
  remove(slice: string | CmdKey<any>): void {
    return this.#container.remove(slice)
  }

  /// Call a registered command.
  call<T extends CmdKey<any>>(slice: string, payload?: InferParams<T>): boolean
  call<T>(slice: CmdKey<T>, payload?: T): boolean
  call(slice: string | CmdKey<any>, payload?: any): boolean
  call(slice: string | CmdKey<any>, payload?: any): boolean {
    if (this.#ctx == null) throw callCommandBeforeEditorView()

    const cmd = this.get(slice)
    const command = cmd(payload)
    const view = this.#ctx.get(editorViewCtx)
    return command(view.state, view.dispatch, view)
  }
}

/// Create a command key, which is a slice type that contains a command.
export function createCmdKey<T = undefined>(key = 'cmdKey'): CmdKey<T> {
  return createSlice((() => () => false) as Cmd<T>, key)
}

/// A slice which contains the command manager.
export const commandsCtx = createSlice(new CommandManager(), 'commands')

/// A slice which stores timers that need to be waited for before starting to run the plugin.
/// By default, it's `[SchemaReady]`.
export const commandsTimerCtx = createSlice([SchemaReady], 'commandsTimer')

/// The timer which will be resolved when the commands plugin is ready.
export const CommandsReady = createTimer('CommandsReady')

/// The commands plugin.
/// This plugin will create a command manager.
///
/// This plugin will wait for the schema plugin.
export const commands: MilkdownPlugin = (ctx) => {
  const cmd = new CommandManager()
  cmd.setCtx(ctx)
  ctx
    .inject(commandsCtx, cmd)
    .inject(commandsTimerCtx, [SchemaReady])
    .record(CommandsReady)
  return async () => {
    await ctx.waitTimers(commandsTimerCtx)

    ctx.done(CommandsReady)

    return () => {
      ctx.remove(commandsCtx).remove(commandsTimerCtx).clearTimer(CommandsReady)
    }
  }
}

withMeta(commands, {
  displayName: 'Commands',
})
