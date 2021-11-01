/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, Ctx, MilkdownPlugin } from '@milkdown/ctx';
import type { InputRule } from '@milkdown/prose';

export const _inputRulesCtx = createSlice<InputRule[]>([], 'inputRules');

export const inputRulesFactory =
    (getInputRules: (ctx: Ctx) => InputRule[]): MilkdownPlugin =>
    () => {
        return (ctx) => {
            const inputRules = getInputRules(ctx);
            ctx.update(_inputRulesCtx, (rules) => [...rules, ...inputRules]);
        };
    };
