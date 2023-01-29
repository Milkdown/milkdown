/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx, MilkdownPlugin, SliceType } from '@milkdown/ctx'
import { Container, createSlice, createTimer } from '@milkdown/ctx'
import { callCommandBeforeEditorView } from '@milkdown/exception'
import type { Command } from '@milkdown/prose/state'

import { EditorViewReady, editorViewCtx } from './editor-view'
import { SchemaReady } from './schema'

export type Cmd<T = undefined> = (payload?: T) => Command
export type CmdKey<T = undefined> = SliceType<Cmd<T>>

type InferParams<T> = T extends CmdKey<infer U> ? U : never

export class CommandManager {
  #container = new Container()
  #ctx: Ctx | null = null

  setCtx = (ctx: Ctx) => {
    this.#ctx = ctx
  }

  /**
     * Create a command with provided key and command function.
     *
     * @param meta - The key of the command that needs to be created.
     * @param value - The implementation of the command function.
     */
  create<T>(meta: CmdKey<T>, value: Cmd<T>) {
    const slice = meta.create(this.#container.sliceMap)
    slice.set(value)
    return slice
  }

  get<T extends CmdKey<any>>(slice: string): Cmd<InferParams<T>>
  get<T>(slice: CmdKey<T>): Cmd<T>
  get(slice: string | CmdKey<any>): Cmd<any>
  get(slice: string | CmdKey<any>): Cmd<any> {
    return this.#container.get(slice).get()
  }

  call<T extends CmdKey<any>>(slice: string, payload?: InferParams<T>): boolean
  call<T>(slice: CmdKey<T>, payload?: T): boolean
  call(slice: string | CmdKey<any>, payload?: any): boolean
  call(slice: string | CmdKey<any>, payload?: any): boolean {
    if (this.#ctx == null)
      throw callCommandBeforeEditorView()

    const cmd = this.get(slice)
    const command = cmd(payload)
    const view = this.#ctx.get(editorViewCtx)
    return command(view.state, view.dispatch, view)
  }

  remove<T extends CmdKey<any>>(slice: string): void
  remove<T>(slice: CmdKey<T>): void
  remove(slice: string | CmdKey<any>): void
  remove(slice: string | CmdKey<any>): void {
    return this.#container.remove(slice)
  }
}

export type CmdTuple<T = unknown> = [key: CmdKey<T>, value: Cmd<T>]

export const createCmd = <T>(key: CmdKey<T>, value: Cmd<T>): CmdTuple => [key, value] as CmdTuple
export const createCmdKey = <T = undefined>(key = 'cmdKey'): CmdKey<T> =>
  createSlice((() => () => false) as Cmd<T>, key)

export const commandsCtx = createSlice(new CommandManager(), 'commands')
export const commandsTimerCtx = createSlice([SchemaReady], 'commandsTimer')
export const CommandsReady = createTimer('CommandsReady')

export const commands: MilkdownPlugin = (ctx) => {
  ctx.inject(commandsCtx).inject(commandsTimerCtx).record(CommandsReady)
  ctx.get(commandsCtx).setCtx(ctx)
  return async () => {
    await ctx.waitTimers(commandsTimerCtx)

    ctx.done(CommandsReady)
    await ctx.wait(EditorViewReady)

    return () => {
      ctx.remove(commandsCtx).remove(commandsTimerCtx).clearTimer(CommandsReady)
    }
  }
}
