import type { InputRule } from 'prosemirror-inputrules';
import type { Node, Mark } from '../abstract';
import type { SchemaReadyContext, PluginReadyContext } from '../editor';

import { Atom } from '../abstract';
import { AtomType, LoadState } from '../constant';

export class InputRulesLoader extends Atom<SchemaReadyContext, PluginReadyContext> {
    id = 'inputRulesLoader';
    type = AtomType.Internal;
    loadAfter = LoadState.SchemaReady;
    main() {
        const { nodes, marks, schema } = this.context;
        const nodesInputRules = nodes
            .filter((node) => Boolean(node.inputRules))
            .reduce((acc, cur) => {
                const node = schema.nodes[cur.id];
                if (!node) return acc;
                return [...acc, ...(cur as Required<Node>).inputRules(node, schema)];
            }, [] as InputRule[]);
        const marksInputRules = marks
            .filter((mark) => Boolean(mark.inputRules))
            .reduce((acc, cur) => {
                const mark = schema.marks[cur.id];
                if (!mark) return acc;
                return [...acc, ...(cur as Required<Mark>).inputRules(mark, schema)];
            }, [] as InputRule[]);

        const inputRules = [...nodesInputRules, ...marksInputRules];
        this.updateContext({ inputRules });
    }
}
