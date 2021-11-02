/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, createTimer, Ctx, MilkdownPlugin, Timer } from '@milkdown/ctx';
import type { InputRule } from '@milkdown/prose';

import { SchemaReady } from '../internal-plugin';
import { CommandsReady } from './commands';

export const inputRulesCtx = createSlice<InputRule[]>([], 'inputRules');
export const inputRulesTimerCtx = createSlice<Timer[]>([], 'inputRulesTimer');

export const InputRulesReady = createTimer('InputRulesReady');

export const inputRulesFactory =
    (getInputRules: (ctx: Ctx) => InputRule[]): MilkdownPlugin =>
    () => {
        return (ctx) => {
            const inputRules = getInputRules(ctx);
            ctx.update(inputRulesCtx, (rules) => [...rules, ...inputRules]);
        };
    };

export const inputRules: MilkdownPlugin = (pre) => {
    pre.inject(inputRulesCtx).inject(inputRulesTimerCtx, [SchemaReady, CommandsReady]).record(InputRulesReady);

    return async (ctx) => {
        await ctx.waitTimers(inputRulesTimerCtx);

        ctx.done(InputRulesReady);
    };
};
