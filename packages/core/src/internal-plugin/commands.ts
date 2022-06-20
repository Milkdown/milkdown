/* Copyright 2021, Milkdown by Mirone. */
import { createContainer, createSlice, createTimer, Ctx, MilkdownPlugin, Slice, Timer } from '@milkdown/ctx';
import { callCommandBeforeEditorView } from '@milkdown/exception';
import type { Command } from '@milkdown/prose/state';

import { editorViewCtx, EditorViewReady } from './editor-view';
import { SchemaReady } from './schema';

export type Cmd<T = undefined> = (payload?: T) => Command;
export type CmdKey<T = undefined> = Slice<Cmd<T>>;

type InferParams<T> = T extends CmdKey<infer U> ? U : never;

export class CommandManager {
    #container = createContainer();
    #ctx: Ctx | null = null;

    setCtx = (ctx: Ctx) => {
        this.#ctx = ctx;
    };

    /**
     * Create a command with provided key and command function.
     *
     * @param meta - The key of the command that needs to be created.
     * @param value - The implementation of the command function.
     */
    create<T>(meta: CmdKey<T>, value: Cmd<T>) {
        return meta(this.#container.sliceMap, value);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get<T extends CmdKey<any>>(slice: string): Cmd<InferParams<T>>;
    get<T>(slice: CmdKey<T>): Cmd<T>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(slice: string | CmdKey<any>): Cmd<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(slice: string | CmdKey<any>): Cmd<any> {
        return this.#container.getSlice(slice).get();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    call<T extends CmdKey<any>>(slice: string, payload?: InferParams<T>): boolean;
    call<T>(slice: CmdKey<T>, payload?: T): boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    call(slice: string | CmdKey<any>, payload?: any): boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    call(slice: string | CmdKey<any>, payload?: any): boolean {
        if (this.#ctx == null) {
            throw callCommandBeforeEditorView();
        }
        const cmd = this.get(slice);
        const command = cmd(payload);
        const view = this.#ctx.get(editorViewCtx);
        return command(view.state, view.dispatch, view);
    }
}

export type CmdTuple<T = unknown> = [key: CmdKey<T>, value: Cmd<T>];

export const createCmd = <T>(key: CmdKey<T>, value: Cmd<T>): CmdTuple => [key, value] as CmdTuple;
export const createCmdKey = <T = undefined>(key = 'cmdKey'): CmdKey<T> =>
    createSlice((() => () => false) as Cmd<T>, key);

export const commandsCtx = createSlice({} as CommandManager, 'commands');

export const commandsTimerCtx = createSlice([] as Timer[], 'commandsTimer');
export const CommandsReady = createTimer('CommandsReady');

export const commands: MilkdownPlugin = (pre) => {
    const commandManager = new CommandManager();
    pre.inject(commandsCtx, commandManager).inject(commandsTimerCtx, [SchemaReady]).record(CommandsReady);
    return async (ctx) => {
        await ctx.waitTimers(commandsTimerCtx);

        ctx.done(CommandsReady);
        await ctx.wait(EditorViewReady);
        commandManager.setCtx(ctx);
    };
};
