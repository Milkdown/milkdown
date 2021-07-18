import type { InputRule } from 'prosemirror-inputrules';
import { SchemaReady } from '../constant';
import { createCtx } from '../context';
import { marksCtx, nodesCtx, schemaCtx } from '../internal-plugin';
import type { MilkdownPlugin } from '../utility';

export const inputRulesCtx = createCtx<InputRule[]>([]);

export const inputRules: MilkdownPlugin = (editor) => {
    editor.ctx(inputRulesCtx);

    return async (ctx) => {
        await SchemaReady();

        const nodes = ctx.use(nodesCtx).get();
        const marks = ctx.use(marksCtx).get();
        const schema = ctx.use(schemaCtx).get();

        const nodesInputRules = nodes.reduce((acc, cur) => {
            const node = schema.nodes[cur.id];
            if (!node || !cur.inputRules) return acc;
            return [...acc, ...cur.inputRules(node, schema)];
        }, [] as InputRule[]);
        const marksInputRules = marks.reduce((acc, cur) => {
            const mark = schema.marks[cur.id];
            if (!mark || !cur.inputRules) return acc;
            return [...acc, ...cur.inputRules(mark, schema)];
        }, [] as InputRule[]);
        const inputRules = [...nodesInputRules, ...marksInputRules];

        ctx.use(inputRulesCtx).set(inputRules);
    };
};
