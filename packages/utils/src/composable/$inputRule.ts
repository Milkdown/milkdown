/* Copyright 2021, Milkdown by Mirone. */

import { Ctx, editorStateTimerCtx, inputRulesCtx, MilkdownPlugin, SchemaReady } from '@milkdown/core';
import { InputRule } from '@milkdown/prose/inputrules';

import { addTimer } from './utils';

export type $InputRule = MilkdownPlugin & {
    inputRule: InputRule;
};

export const $inputRule = (inputRule: (ctx: Ctx) => InputRule): $InputRule => {
    const plugin: MilkdownPlugin = () => async (ctx) => {
        await ctx.wait(SchemaReady);
        const ir = inputRule(ctx);
        ctx.update(inputRulesCtx, (irs) => [...irs, ir]);
        (<$InputRule>plugin).inputRule = ir;
    };

    return <$InputRule>plugin;
};

export const $inputRuleAsync = (inputRule: (ctx: Ctx) => Promise<InputRule>, timerName?: string) => {
    return addTimer<$InputRule>(
        async (ctx, plugin) => {
            await ctx.wait(SchemaReady);
            const ir = await inputRule(ctx);
            ctx.update(inputRulesCtx, (irs) => [...irs, ir]);
            plugin.inputRule = ir;
        },
        editorStateTimerCtx,
        timerName,
    );
};
