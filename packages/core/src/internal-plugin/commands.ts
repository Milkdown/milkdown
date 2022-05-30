/* Copyright 2021, Milkdown by Mirone. */
import { Container, createContainer, createSlice, createTimer, MilkdownPlugin, Slice, Timer } from '@milkdown/ctx';
import { callCommandBeforeEditorView } from '@milkdown/exception';
import type { Command } from '@milkdown/prose';

import { editorViewCtx, EditorViewReady } from './editor-view';
import { SchemaReady } from './schema';

export type Cmd<T = undefined> = (info?: T) => Command;
export type CmdKey<T = undefined> = Slice<Cmd<T>>;

type InferParams<T> = T extends CmdKey<infer U> ? U : never;

export type CommandManager = {
    create: <T>(meta: CmdKey<T>, value: Cmd<T>) => void;
    get: <T>(meta: CmdKey<T>) => Cmd<T> | undefined;
    call: <T>(meta: CmdKey<T>, info?: T) => boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getByName: <T extends CmdKey<any>>(name: string) => Cmd<InferParams<T>> | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callByName: <T extends CmdKey<any>>(name: string, info?: InferParams<T>) => null | boolean;
    callChainCommand: <T extends CmdKey<any>>(name: string, info?: InferParams<T>) => null | boolean;
};

export type CmdTuple<T = unknown> = [key: CmdKey<T>, value: Cmd<T>];

export const createCmd = <T>(key: CmdKey<T>, value: Cmd<T>): CmdTuple => [key, value] as CmdTuple;

export const commandsCtx = createSlice<CommandManager>({} as CommandManager, 'commands');

export const createCmdKey = <T = undefined>(key = 'cmdKey'): CmdKey<T> =>
    createSlice((() => () => false) as Cmd<T>, key);

export const commandsTimerCtx = createSlice<Timer[]>([], 'commandsTimer');
export const CommandsReady = createTimer('CommandsReady');

export const commands: MilkdownPlugin = (pre) => {
    const container = createContainer();
    const commandManager: CommandManager = {
        create: (slice, value) => {
            const cmdChainSlice = container.getSliceByName<Container>(slice.sliceName)
                ?? createSlice<Container>(createContainer(), slice.sliceName)(container.sliceMap);
            const chainContainer = cmdChainSlice.get();
            slice(chainContainer.sliceMap, value);
            cmdChainSlice.set(chainContainer);
        },
        get: (slice) => {
            return container.getSliceByName<Container>(slice.sliceName)?.get().getSlice(slice).get();
        },
        getByName: (name: string) => {
            const slice = container.getSliceByName<Container>(name)?.get().getSliceByName(name);
            if (!slice) return null;
            return slice.get() as never;
        },
        call: () => {
            throw callCommandBeforeEditorView();
        },
        callByName: () => {
            throw callCommandBeforeEditorView();
        },
        callChainCommand: () => {
            throw callCommandBeforeEditorView();
        },
    };
    pre.inject(commandsCtx, commandManager).inject(commandsTimerCtx, [SchemaReady]).record(CommandsReady);
    return async (ctx) => {
        await ctx.waitTimers(commandsTimerCtx);

        ctx.done(CommandsReady);
        await ctx.wait(EditorViewReady);

        ctx.update(commandsCtx, (prev) => ({
            ...prev,
            call: (meta, info) => {
                const command = commandManager.get(meta)?.(info);
                if (!command) return false;
                const view = ctx.get(editorViewCtx);
                return command(view.state, view.dispatch, view);
            },
            callByName: (name, info) => {
                const command = commandManager.getByName(name)?.(info);
                if (!command) return null;
                const view = ctx.get(editorViewCtx);
                return command(view.state, view.dispatch, view);
            },
            callChainCommand: (name, info) => {
                const commandChain = container.getSliceByName<Container>(name)?.get();
                if (!commandChain) return null;

                let result = false;
                for (let slice of commandChain.sliceMap.values()) {
                    const cmd = slice.get() as Cmd<any>;
                    const command = cmd(info);
                    const view = ctx.get(editorViewCtx);
                    result = command(view.state, view.dispatch, view);
                    if (result) break;
                }
                return result;
            },
        }));
    };
}