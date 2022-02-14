/* Copyright 2021, Milkdown by Mirone. */
import { Ctx, MilkdownPlugin, NodeSchema, nodesCtx, schemaCtx, SchemaReady, ThemeReady } from '@milkdown/core';
import { NodeType } from '@milkdown/prose';

export type $Node = MilkdownPlugin & {
    id: string;
    type: NodeType;
    schema: NodeSchema;
};

export const $node = (id: string, schema: (ctx: Ctx) => NodeSchema): $Node => {
    const plugin: MilkdownPlugin = () => async (ctx) => {
        await ctx.wait(ThemeReady);
        const nodeSchema = schema(ctx);
        ctx.update(nodesCtx, (ns) => [...ns, [id, nodeSchema] as [string, NodeSchema]]);

        (<$Node>plugin).id = id;
        (<$Node>plugin).schema = nodeSchema;

        await ctx.wait(SchemaReady);

        const nodeType = ctx.get(schemaCtx).nodes[id];

        if (!nodeType) {
            throw new Error();
        }

        (<$Node>plugin).type = nodeType;
    };

    return <$Node>plugin;
};
