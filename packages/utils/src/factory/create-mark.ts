/* Copyright 2021, Milkdown by Mirone. */

import { Ctx, MarkSchema, marksCtx, MilkdownPlugin, schemaCtx, SchemaReady, viewCtx } from '@milkdown/core';
import { MarkType, MarkViewFactory, ViewFactory } from '@milkdown/prose';

import { CommonOptions, Methods, UnknownRecord, Utils } from '../types';
import { addMetadata, applyMethods, getUtils } from '.';

type MarkFactory<SupportedKeys extends string = string, Options extends UnknownRecord = UnknownRecord> = (
    utils: Utils,
    options?: Partial<CommonOptions<SupportedKeys, Options>>,
) => {
    id: string;
    schema: (ctx: Ctx) => MarkSchema;
    view?: (ctx: Ctx) => MarkViewFactory;
} & Methods<SupportedKeys, MarkType>;

export const createMark = <SupportedKeys extends string = string, Options extends UnknownRecord = UnknownRecord>(
    factory: MarkFactory<SupportedKeys, Options>,
) =>
    addMetadata(
        (options?: Partial<Options>): MilkdownPlugin =>
            () =>
            async (ctx) => {
                const utils = getUtils(ctx, options);

                const plugin = factory(utils, options);

                await applyMethods(
                    ctx,
                    plugin,
                    async () => {
                        const node = plugin.schema(ctx);
                        ctx.update(marksCtx, (ns) => [...ns, [plugin.id, node] as [string, MarkSchema]]);

                        await ctx.wait(SchemaReady);

                        const schema = ctx.get(schemaCtx);
                        return schema.marks[plugin.id];
                    },
                    options,
                );

                if (plugin.view) {
                    const view = plugin.view(ctx);
                    ctx.update(viewCtx, (v) => [...v, [plugin.id, view] as [string, ViewFactory]]);
                }
            },
    );
