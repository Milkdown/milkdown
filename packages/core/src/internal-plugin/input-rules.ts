/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, createTimer, MilkdownPlugin, Timer } from '@milkdown/ctx';
import type { InputRule } from '@milkdown/prose';

import { marksCtx, nodesCtx, schemaCtx, SchemaReady } from '../internal-plugin';
import { Atom, getAtom } from '../utility';
import { CommandsReady } from './commands';

export const inputRulesCtx = createSlice<InputRule[]>([], 'inputRules');
export const inputRulesTimerCtx = createSlice<Timer[]>([], 'inputRulesTimer');

export const InputRulesReady = createTimer('InputRulesReady');

export const inputRules: MilkdownPlugin = (pre) => {
    pre.inject(inputRulesCtx).inject(inputRulesTimerCtx, [SchemaReady, CommandsReady]).record(InputRulesReady);

    return async (ctx) => {
        await ctx.waitTimers(inputRulesTimerCtx);

        const nodes = ctx.get(nodesCtx);
        const marks = ctx.get(marksCtx);
        const schema = ctx.get(schemaCtx);

        const getInputRules = <T extends Atom>(atoms: T[], isNode: boolean): InputRule[] =>
            atoms
                .map((x) => [getAtom(x.id, schema, isNode), x.inputRules] as const)
                .flatMap(([atom, inputRules]) => atom && inputRules?.(atom, schema))
                .filter((x): x is InputRule => !!x);

        const inputRules = [...getInputRules(nodes, true), ...getInputRules(marks, false)];

        ctx.set(inputRulesCtx, inputRules);
        ctx.done(InputRulesReady);
    };
};
