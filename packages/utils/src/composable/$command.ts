/* Copyright 2021, Milkdown by Mirone. */

import { CmdKey, CmdTuple, commandsCtx, Ctx, MilkdownPlugin, SchemaReady } from '@milkdown/core';

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
