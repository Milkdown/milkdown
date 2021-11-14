/* Copyright 2021, Milkdown by Mirone. */
import { Ctx, MilkdownPlugin, NodeSchema, nodesCtx, schemaCtx, SchemaReady } from '@milkdown/core';
import { NodeType } from '@milkdown/prose';

export type $Node = MilkdownPlugin & {
    id: string;
    type: NodeType;
    schema: NodeSchema;
};

export const $node = (id: string, schema: (ctx: Ctx) => NodeSchema): $Node => {
    const plugin: MilkdownPlugin = () => async (ctx) => {
        const nodeSchema = schema(ctx);
        ctx.update(nodesCtx, (ns) => [...ns, [id, nodeSchema] as [string, NodeSchema]]);

        (<$Node>plugin).id = id;
        (<$Node>plugin).schema = nodeSchema;

        await ctx.wait(SchemaReady);

        (<$Node>plugin).type = ctx.get(schemaCtx).nodes[id];
    };

    return <$Node>plugin;
};
