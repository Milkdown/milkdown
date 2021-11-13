/* Copyright 2021, Milkdown by Mirone. */
import { MilkdownPlugin, NodeSchema, nodesCtx, schemaCtx, SchemaReady } from '@milkdown/core';
import { NodeType } from '@milkdown/prose';

type $Node = MilkdownPlugin & {
    id: string;
    type: NodeType;
    schema: NodeSchema;
};

export const $node = (id: string, schema: NodeSchema): $Node => {
    const plugin: MilkdownPlugin = () => async (ctx) => {
        ctx.update(nodesCtx, (ns) => [...ns, [id, schema] as [string, NodeSchema]]);

        (<$Node>plugin).id = id;
        (<$Node>plugin).schema = schema;

        await ctx.wait(SchemaReady);

        (<$Node>plugin).type = ctx.get(schemaCtx).nodes[id];
    };

    return <$Node>plugin;
};
