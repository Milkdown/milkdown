/* Copyright 2021, Milkdown by Mirone. */
import type { InputRule } from 'prosemirror-inputrules';

import { createSlice } from '../context';
import { marksCtx, nodesCtx, schemaCtx, SchemaReady } from '../internal-plugin';
import { createTimer, Timer } from '../timing';
import { Atom, getAtom, MilkdownPlugin } from '../utility';

export const inputRulesCtx = createSlice<InputRule[]>([]);
export const inputRulesTimerCtx = createSlice<Timer[]>([]);

export const InputRulesReady = createTimer('InputRulesReady');

export const inputRules: MilkdownPlugin = (pre) => {
    pre.inject(inputRulesCtx).inject(inputRulesTimerCtx, [SchemaReady]).record(InputRulesReady);

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
