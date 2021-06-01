import type { InputRule } from 'prosemirror-inputrules';
import type { SchemaReadyContext, PluginReadyContext } from '../editor';

import { Atom } from '../abstract';
import { LoadState } from '../constant';

export class InputRulesLoader extends Atom<SchemaReadyContext, PluginReadyContext> {
    override id = 'inputRulesLoader';
    override loadAfter = LoadState.SchemaReady;
    override main() {
        const { nodes, marks, schema } = this.context;
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
        this.updateContext({ inputRules });
    }
}
