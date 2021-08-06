import type { Keymap } from 'prosemirror-commands';
import type { InputRule } from 'prosemirror-inputrules';
import type { NodeSpec, NodeType, Schema } from 'prosemirror-model';
import type { NodeParserSpec } from '../parser';
import type { NodeSerializerSpec } from '../serializer';
import type { Command, Ctx, MilkdownPlugin, NodeViewFactory } from '../utility';
import type { CommandKey, CommandManager } from './commands';
import { nodesCtx } from './schema';

export type Node = {
    readonly id: string;
    readonly view?: NodeViewFactory;
    readonly keymap?: (nodeType: NodeType, schema: Schema, getCommand: CommandManager['get']) => Keymap;
    readonly inputRules?: (nodeType: NodeType, schema: Schema) => InputRule[];
    readonly commands?: (nodeType: NodeType, schema: Schema) => [key: CommandKey, value: Command][];
    readonly schema: NodeSpec;
    readonly serializer: NodeSerializerSpec;
    readonly parser: NodeParserSpec;
};

export const nodeFactory =
    (node: Node | ((ctx: Ctx) => Node)): MilkdownPlugin =>
    () =>
    (ctx) => {
        const atom = typeof node === 'function' ? node(ctx) : node;
        ctx.update(nodesCtx, (prev) => prev.concat(atom));
    };
