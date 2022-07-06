/* Copyright 2021, Milkdown by Mirone. */

import {
    Ctx,
    MarkSchema,
    marksCtx,
    markViewCtx,
    MilkdownPlugin,
    schemaCtx,
    SchemaReady,
    Slice,
    ThemeReady,
} from '@milkdown/core';
import { missingMarkInSchema } from '@milkdown/exception';
import { MarkType } from '@milkdown/prose/model';
import { MarkViewConstructor } from '@milkdown/prose/view';

import { Factory, UnknownRecord, WithExtend } from '../types';
import { addMetadata, applyMethods, getUtils, withExtend } from './common';

export type MarkRest = {
    id: string;
    schema: (ctx: Ctx) => MarkSchema;
    view?: (ctx: Ctx) => MarkViewConstructor;
};

export type MarkFactory<SupportedKeys extends string, Options extends UnknownRecord> = Factory<
    SupportedKeys,
    Options,
    MarkType,
    MarkRest
>;

export type MarkCreator<SupportedKeys extends string, Options extends UnknownRecord> = WithExtend<
    SupportedKeys,
    Options,
    MarkType,
    MarkRest
>;

export const createMark = <SupportedKeys extends string = string, Options extends UnknownRecord = UnknownRecord>(
    factory: MarkFactory<SupportedKeys, Options>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inject?: Slice<any>[],
): MarkCreator<string, Options> =>
    withExtend(
        factory,
        addMetadata(
            (options): MilkdownPlugin =>
                (pre) => {
                    inject?.forEach((slice) => pre.inject(slice));
                    return async (ctx) => {
                        await ctx.wait(ThemeReady);
                        const utils = getUtils(ctx, options);

                        const plugin = factory(utils, options);
                        plugin.view = (options?.view ?? plugin.view) as (ctx: Ctx) => MarkViewConstructor;

                        await applyMethods(
                            ctx,
                            plugin,
                            async () => {
                                const node = plugin.schema(ctx);
                                ctx.update(marksCtx, (ns) => [...ns, [plugin.id, node] as [string, MarkSchema]]);

                                await ctx.wait(SchemaReady);

                                const schema = ctx.get(schemaCtx);
                                const markType = schema.marks[plugin.id];
                                if (!markType) {
                                    throw missingMarkInSchema(plugin.id);
                                }
                                return markType;
                            },
                            options,
                        );

                        if (plugin.view) {
                            const view = plugin.view(ctx);
                            ctx.update(markViewCtx, (v) => [...v, [plugin.id, view] as [string, MarkViewConstructor]]);
                        }
                    };
                },
        ),
        createMark,
    );
