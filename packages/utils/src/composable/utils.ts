/* Copyright 2021, Milkdown by Mirone. */
import { createTimer, Ctx, MilkdownPlugin, Slice, Timer } from '@milkdown/core';
import { customAlphabet } from 'nanoid';

export const nanoid = customAlphabet('abcedfghicklmn', 10);

export const addTimer = <T extends MilkdownPlugin, PluginWithTimer extends T = T & { timer: Timer }>(
    runner: (ctx: Ctx, plugin: PluginWithTimer, done: () => void) => Promise<void>,
    injectTo: Slice<Timer[], string>,
    timerName?: string,
): PluginWithTimer => {
    const timer = createTimer(timerName || nanoid());
    let doneCalled = false;

    const plugin: MilkdownPlugin = () => {
        return async (ctx) => {
            const done = () => {
                ctx.done(timer);
                doneCalled = true;
            };
            ctx.update(injectTo, (x) => x.concat(timer));

            await runner(ctx, <PluginWithTimer>plugin, done);

            if (!doneCalled) {
                ctx.done(timer);
            }
        };
    };
    (<T & { timer: Timer }>plugin).timer = timer;

    return <PluginWithTimer>plugin;
};
