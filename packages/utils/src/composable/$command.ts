/* Copyright 2021, Milkdown by Mirone. */

import { CmdKey, CmdTuple, commandsCtx, Ctx, MilkdownPlugin, SchemaReady } from '@milkdown/core';

export type $Command<T> = MilkdownPlugin & {
    run: (info?: T) => boolean;
    key: CmdKey<T>;
};

export const $command = <T>(cmd: (ctx: Ctx) => CmdTuple<T>): $Command<T> => {
    const plugin: MilkdownPlugin = () => async (ctx) => {
        await ctx.wait(SchemaReady);
        const [key, command] = cmd(ctx);
        ctx.get(commandsCtx).create(key, command);
        (<$Command<T>>plugin).run = (info?: T) => ctx.get(commandsCtx).call(key, info);
        (<$Command<T>>plugin).key = key;
    };

    return <$Command<T>>plugin;
};
