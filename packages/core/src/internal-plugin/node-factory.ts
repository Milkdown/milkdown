import type { Keymap } from 'prosemirror-commands';
import type { InputRule } from 'prosemirror-inputrules';
import type { NodeSpec, NodeType, Schema } from 'prosemirror-model';
import { nodesCtx } from '.';
import type { NodeParserSpec } from '../parser';
import type { NodeSerializerSpec } from '../serializer';
import type { MilkdownPlugin, NodeViewFactory } from '../utility';

export type Node = {
    readonly id: string;
    readonly view?: NodeViewFactory;
    readonly keymap?: (nodeType: NodeType, schema: Schema) => Keymap;
    readonly inputRules?: (nodeType: NodeType, schema: Schema) => InputRule[];
    readonly schema: NodeSpec;
    readonly serializer: NodeSerializerSpec;
    readonly parser: NodeParserSpec;
};

export const nodeFactory =
    (node: Node): MilkdownPlugin =>
    () =>
    (ctx) => {
        ctx.update(nodesCtx, (prev) => prev.concat(node));
    };
