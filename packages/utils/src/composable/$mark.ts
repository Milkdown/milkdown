/* Copyright 2021, Milkdown by Mirone. */
import {
    Ctx,
    MarkSchema,
    marksCtx,
    MilkdownPlugin,
    schemaCtx,
    SchemaReady,
    schemaTimerCtx,
    ThemeReady,
} from '@milkdown/core';
import { missingMarkInSchema } from '@milkdown/exception';
import { MarkType } from '@milkdown/prose/model';

import { addTimer } from './utils';

export type $Mark = MilkdownPlugin & {
    id: string;
    type: MarkType;
    schema: MarkSchema;
};

export const $mark = (id: string, schema: (ctx: Ctx) => MarkSchema): $Mark => {
    const plugin: MilkdownPlugin = () => async (ctx) => {
        await ctx.wait(ThemeReady);
        const markSchema = schema(ctx);
        ctx.update(marksCtx, (ns) => [...ns, [id, markSchema] as [string, MarkSchema]]);

        (<$Mark>plugin).id = id;
        (<$Mark>plugin).schema = markSchema;

        await ctx.wait(SchemaReady);

        const markType = ctx.get(schemaCtx).marks[id];

        if (!markType) {
            throw missingMarkInSchema(id);
        }

        (<$Mark>plugin).type = markType;
    };

    return <$Mark>plugin;
};

export const $markAsync = (id: string, schema: (ctx: Ctx) => Promise<MarkSchema>, timerName?: string) => {
    return addTimer<$Mark>(
        async (ctx, plugin, done) => {
            await ctx.wait(ThemeReady);
            const markSchema = await schema(ctx);
            ctx.update(marksCtx, (ns) => [...ns, [id, markSchema] as [string, MarkSchema]]);

            plugin.id = id;
            plugin.schema = markSchema;
            done();

            await ctx.wait(SchemaReady);

            const markType = ctx.get(schemaCtx).marks[id];
            if (!markType) {
                throw missingMarkInSchema(id);
            }

            plugin.type = markType;
        },
        schemaTimerCtx,
        timerName,
    );
};
