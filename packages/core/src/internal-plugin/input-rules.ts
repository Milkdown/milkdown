import type { InputRule } from 'prosemirror-inputrules';
import { createCtx } from '../context';
import { marksCtx, nodesCtx, schemaCtx, SchemaReady } from '../internal-plugin';
import { createTiming } from '../timing';
import { Atom, getAtom, MilkdownPlugin } from '../utility';

export const inputRulesCtx = createCtx<InputRule[]>([]);
export const InputRulesReady = createTiming('InputRulesReady');

export const inputRules: MilkdownPlugin = (pre) => {
    pre.inject(inputRulesCtx);

    return async (ctx) => {
        await SchemaReady();

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
        InputRulesReady.done();
    };
};
