/* Copyright 2021, Milkdown by Mirone. */
import { createTimer, CtxHandler, MilkdownPlugin } from '@milkdown/ctx';

export const ConfigReady = createTimer('ConfigReady');

export const config =
    (configure: CtxHandler): MilkdownPlugin =>
    (pre) => {
        pre.record(ConfigReady);

        return async (ctx) => {
            await configure(ctx);
            ctx.done(ConfigReady);
        };
    };
