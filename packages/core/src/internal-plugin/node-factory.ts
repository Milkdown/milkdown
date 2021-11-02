/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, Ctx, MilkdownPlugin } from '@milkdown/ctx';
import type { NodeSpec } from '@milkdown/prose';

import type { NodeParserSpec } from '../parser';
import type { NodeSerializerSpec } from '../serializer';

export type NodeSchema = {
    readonly id: string;
    readonly toMarkdown: NodeSerializerSpec;
    readonly parseMarkdown: NodeParserSpec;
} & Readonly<NodeSpec>;

export const nodesCtx = createSlice<NodeSchema[]>([], 'nodes');

export const nodeFactory =
    (node: NodeSchema | ((ctx: Ctx) => NodeSchema)): MilkdownPlugin =>
    () =>
    (ctx) => {
        const atom = typeof node === 'function' ? node(ctx) : node;
        ctx.update(nodesCtx, (prev) => prev.concat(atom));
    };
