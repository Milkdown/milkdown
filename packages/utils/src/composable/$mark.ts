/* Copyright 2021, Milkdown by Mirone. */
import { MarkSchema, MilkdownPlugin, nodesCtx, schemaCtx, SchemaReady } from '@milkdown/core';
import { MarkType } from '@milkdown/prose';

type $Mark = MilkdownPlugin & {
    id: string;
    type: MarkType;
    schema: MarkSchema;
};

export const $mark = (id: string, schema: MarkSchema): $Mark => {
    const plugin: MilkdownPlugin = () => async (ctx) => {
        ctx.update(nodesCtx, (ns) => [...ns, [id, schema] as [string, MarkSchema]]);

        (<$Mark>plugin).id = id;
        (<$Mark>plugin).schema = schema;

        await ctx.wait(SchemaReady);

        (<$Mark>plugin).type = ctx.get(schemaCtx).nodes[id];
    };

    return <$Mark>plugin;
};
