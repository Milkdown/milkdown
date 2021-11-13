/* Copyright 2021, Milkdown by Mirone. */

import { Ctx, inputRulesCtx, MilkdownPlugin, SchemaReady } from '@milkdown/core';
import { InputRule } from '@milkdown/prose';

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
