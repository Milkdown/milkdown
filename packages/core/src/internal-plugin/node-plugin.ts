import type { Keymap } from 'prosemirror-commands';
import type { InputRule } from 'prosemirror-inputrules';
import type { NodeSpec, NodeType, Schema } from 'prosemirror-model';
import { nodesCtx } from '../context';
import { Ctx } from '../editor';
import type { NodeParserSpec } from '../parser';
import type { NodeSerializerSpec } from '../serializer';

export type Node = {
    readonly id: string;
    readonly keymap?: (nodeType: NodeType, schema: Schema) => Keymap;
    readonly inputRules?: (nodeType: NodeType, schema: Schema) => InputRule[];
    readonly schema: NodeSpec;
    readonly serializer: NodeSerializerSpec;
    readonly parser: NodeParserSpec;
};

export const createNode = (node: Node) => (ctx: Ctx) => {
    const nodes = ctx.use(nodesCtx);
    nodes.set(nodes.get().concat(node));
};
