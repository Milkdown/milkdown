/* Copyright 2021, Milkdown by Mirone. */

import { CmdKey, CmdTuple, commandsCtx, commandsTimerCtx, Ctx, MilkdownPlugin, SchemaReady } from '@milkdown/core';

import { addTimer } from './utils';

export type $Command<T> = MilkdownPlugin & {
    run: (payload?: T) => boolean;
    key: CmdKey<T>;
};

export const $command = <T>(cmd: (ctx: Ctx) => CmdTuple<T>): $Command<T> => {
    const plugin: MilkdownPlugin = () => async (ctx) => {
        await ctx.wait(SchemaReady);
        const [key, command] = cmd(ctx);
        ctx.get(commandsCtx).create(key, command);
        (<$Command<T>>plugin).run = (payload?: T) => ctx.get(commandsCtx).call(key, payload);
        (<$Command<T>>plugin).key = key;
    };

    return <$Command<T>>plugin;
};

export const $commandAsync = <T>(cmd: (ctx: Ctx) => Promise<CmdTuple<T>>, timerName?: string) => {
    return addTimer<$Command<T>>(
        async (ctx, plugin) => {
            await ctx.wait(SchemaReady);
            const [key, command] = await cmd(ctx);
            ctx.get(commandsCtx).create(key, command);
            (<$Command<T>>plugin).run = (payload?: T) => ctx.get(commandsCtx).call(key, payload);
            (<$Command<T>>plugin).key = key;
        },
        commandsTimerCtx,
        timerName,
    );
};
