/* Copyright 2021, Milkdown by Mirone. */
import { callCommandBeforeEditorView } from '@milkdown/exception';
import type { Command } from 'prosemirror-commands';

import { createContainer, createSlice, Slice } from '../context';
import { createTimer, Timer } from '../timing';
import { Atom, getAtom, MilkdownPlugin } from '../utility';
import { Complete, editorViewCtx } from './editor-view';
import { marksCtx, nodesCtx, schemaCtx, SchemaReady } from './schema';

export type Cmd<T = undefined> = (info?: T) => Command;
export type CmdKey<T = undefined> = Slice<Cmd<T>>;

export type CommandManager = {
    create: <T>(meta: CmdKey<T>, value: Cmd<T>) => void;
    get: <T>(meta: CmdKey<T>) => Cmd<T>;
    call: <T>(meta: CmdKey<T>, info?: T) => boolean;
};

export type CmdTuple<T = unknown> = [key: CmdKey<T>, value: Cmd<T>];

export const createCmd = <T>(key: CmdKey<T>, value: Cmd<T>): CmdTuple => [key, value] as CmdTuple;

export const commandsCtx = createSlice<CommandManager>({} as CommandManager);
export const createCmdKey = <T = undefined>(): CmdKey<T> => createSlice((() => () => false) as Cmd<T>);

export const commandsTimerCtx = createSlice<Timer[]>([]);
export const CommandsReady = createTimer('KeymapReady');
export const commands: MilkdownPlugin = (pre) => {
    const container = createContainer();
    const commandManager: CommandManager = {
        create: (slice, value) => slice(container.sliceMap, value),
        get: (slice) => container.getSlice(slice).get(),
        call: () => {
            throw callCommandBeforeEditorView();
        },
    };
    pre.inject(commandsCtx, commandManager).inject(commandsTimerCtx, [SchemaReady]).record(CommandsReady);
    return async (ctx) => {
        await ctx.waitTimers(commandsTimerCtx);
        const nodes = ctx.get(nodesCtx);
        const marks = ctx.get(marksCtx);
        const schema = ctx.get(schemaCtx);

        const getCommands = <T extends Atom>(atoms: T[], isNode: boolean) =>
            atoms
                .map((x) => [getAtom(x.id, schema, isNode), x.commands] as const)
                .map(([atom, commands]) => atom && commands?.(atom, schema))
                .filter((x): x is CmdTuple[] => !!x)
                .flat();

        const commands = [...getCommands(nodes, true), ...getCommands(marks, false)];
        const commandManager = ctx.get(commandsCtx);
        commands.forEach(([key, command]) => {
            commandManager.create(key, command);
        });
        ctx.done(CommandsReady);
        await ctx.wait(Complete);

        ctx.update(commandsCtx, (prev) => ({
            ...prev,
            call: (meta, info) => {
                const cmd = commandManager.get(meta);
                const command = cmd(info);
                const view = ctx.get(editorViewCtx);
                return command(view.state, view.dispatch, view);
            },
        }));
    };
};
