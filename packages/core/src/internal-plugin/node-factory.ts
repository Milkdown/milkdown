/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, Ctx, MilkdownPlugin } from '@milkdown/ctx';
import type { InputRule, Keymap, NodeSpec, NodeType, NodeViewFactory, Schema } from '@milkdown/prose';

import type { NodeParserSpec } from '../parser';
import type { NodeSerializerSpec } from '../serializer';
import type { CmdTuple, CommandManager } from './commands';

export type Node = {
    readonly id: string;
    readonly view?: NodeViewFactory;
    readonly keymap?: (nodeType: NodeType, schema: Schema, getCommand: CommandManager['get']) => Keymap;
    readonly inputRules?: (nodeType: NodeType, schema: Schema) => InputRule[];
    readonly commands?: (nodeType: NodeType, schema: Schema) => CmdTuple[];
    readonly schema: NodeSpec;
    readonly serializer: NodeSerializerSpec;
    readonly parser: NodeParserSpec;
};

export const nodesCtx = createSlice<Node[]>([], 'nodes');

export const nodeFactory =
    (node: Node | ((ctx: Ctx) => Node)): MilkdownPlugin =>
    () =>
    (ctx) => {
        const atom = typeof node === 'function' ? node(ctx) : node;
        ctx.update(nodesCtx, (prev) => prev.concat(atom));
    };
