/* Copyright 2021, Milkdown by Mirone. */

import { Ctx, MarkSchema, marksCtx, MilkdownPlugin, schemaCtx, SchemaReady, viewCtx } from '@milkdown/core';
import { MarkType, MarkViewFactory, ViewFactory } from '@milkdown/prose';

import { AddMetadata, CommonOptions, Methods, UnknownRecord, Utils } from '../types';
import { addMetadata, applyMethods, getUtils } from './common';

type MarkSpec<SupportedKeys extends string> = {
    id: string;
    schema: (ctx: Ctx) => MarkSchema;
    view?: (ctx: Ctx) => MarkViewFactory;
} & Methods<SupportedKeys, MarkType>;
type MarkFactory<SupportedKeys extends string = string, Options extends UnknownRecord = UnknownRecord> = (
    utils: Utils,
    options?: Partial<CommonOptions<SupportedKeys, Options>>,
) => MarkSpec<SupportedKeys>;

type WithExtend<SupportedKeys extends string = string, Options extends UnknownRecord = UnknownRecord> = AddMetadata<
    SupportedKeys,
    Options
> & {
    extend: <ExtendedSupportedKeys extends string = SupportedKeys, ExtendedOptions extends UnknownRecord = Options>(
        extendFactory: (
            ...args: [
                original: MarkSpec<SupportedKeys>,
                ...rest: Parameters<MarkFactory<ExtendedSupportedKeys, ExtendedOptions>>
            ]
        ) => MarkSpec<ExtendedSupportedKeys>,
    ) => AddMetadata<ExtendedSupportedKeys, ExtendedOptions>;
};

const withExtend = <SupportedKeys extends string, Options extends UnknownRecord>(
    factory: MarkFactory<SupportedKeys, Options>,
    origin: AddMetadata<SupportedKeys, Options>,
) => {
    const next = origin as WithExtend<SupportedKeys, Options>;
    const extend = <
        ExtendedSupportedKeys extends string = SupportedKeys,
        ExtendedOptions extends UnknownRecord = Options,
    >(
        extendFactory: (
            ...args: [
                original: MarkSpec<SupportedKeys>,
                ...rest: Parameters<MarkFactory<ExtendedSupportedKeys, ExtendedOptions>>
            ]
        ) => MarkSpec<ExtendedSupportedKeys>,
    ) => {
        return createMark<ExtendedSupportedKeys, ExtendedOptions>((...args) => {
            return extendFactory(factory(...(args as Parameters<MarkFactory<SupportedKeys, Options>>)), ...args);
        });
    };

    next.extend = extend;

    return next;
};

export const createMark = <SupportedKeys extends string = string, Options extends UnknownRecord = UnknownRecord>(
    factory: MarkFactory<SupportedKeys, Options>,
) =>
    withExtend(
        factory,
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
        ),
    );
