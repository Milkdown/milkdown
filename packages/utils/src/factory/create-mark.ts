/* Copyright 2021, Milkdown by Mirone. */

import {
    Ctx,
    MarkSchema,
    marksCtx,
    MilkdownPlugin,
    schemaCtx,
    SchemaReady,
    Slice,
    ThemeReady,
    viewCtx,
} from '@milkdown/core';
import { MarkViewFactory, ViewFactory } from '@milkdown/prose';
import { MarkType } from '@milkdown/prose/model';

import { Factory, UnknownRecord, WithExtend } from '../types';
import { addMetadata, applyMethods, getUtils, withExtend } from './common';

type MarkRest = {
    id: string;
    schema: (ctx: Ctx) => MarkSchema;
    view?: (ctx: Ctx) => MarkViewFactory;
};

type MarkFactory<SupportedKeys extends string, Options extends UnknownRecord> = Factory<
    SupportedKeys,
    Options,
    MarkType,
    MarkRest
>;

export const createMark = <SupportedKeys extends string = string, Options extends UnknownRecord = UnknownRecord>(
    factory: MarkFactory<SupportedKeys, Options>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inject?: Slice<any>[],
): WithExtend<SupportedKeys, Options, MarkType, MarkRest> =>
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
                        plugin.view = options?.view ?? plugin.view;

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
                                    throw new Error();
                                }
                                return markType;
                            },
                            options,
                        );

                        if (plugin.view) {
                            const view = plugin.view(ctx);
                            ctx.update(viewCtx, (v) => [...v, [plugin.id, view] as [string, ViewFactory]]);
                        }
                    };
                },
        ),
        createMark,
    );
