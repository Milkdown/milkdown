/* Copyright 2021, Milkdown by Mirone. */
import { Ctx, MarkSchema, marksCtx, MilkdownPlugin, schemaCtx, SchemaReady } from '@milkdown/core';
import { MarkType } from '@milkdown/prose';

export type $Mark = MilkdownPlugin & {
    id: string;
    type: MarkType;
    schema: MarkSchema;
};

export const $mark = (id: string, schema: (ctx: Ctx) => MarkSchema): $Mark => {
    const plugin: MilkdownPlugin = () => async (ctx) => {
        const markSchema = schema(ctx);
        ctx.update(marksCtx, (ns) => [...ns, [id, markSchema] as [string, MarkSchema]]);

        (<$Mark>plugin).id = id;
        (<$Mark>plugin).schema = markSchema;

        await ctx.wait(SchemaReady);

        (<$Mark>plugin).type = ctx.get(schemaCtx).marks[id];
    };

    return <$Mark>plugin;
};
