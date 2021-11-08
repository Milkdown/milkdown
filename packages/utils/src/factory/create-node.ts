/* Copyright 2021, Milkdown by Mirone. */

import { Ctx, MilkdownPlugin, NodeSchema, nodesCtx, schemaCtx, SchemaReady, viewCtx } from '@milkdown/core';
import { NodeType, NodeViewFactory, ViewFactory } from '@milkdown/prose';

import { AddMetadata, CommonOptions, Methods, UnknownRecord, Utils } from '../types';
import { addMetadata, applyMethods, getUtils } from './common';

type NodeSpec<SupportedKeys extends string> = {
    id: string;
    schema: (ctx: Ctx) => NodeSchema;
    view?: (ctx: Ctx) => NodeViewFactory;
} & Methods<SupportedKeys, NodeType>;
type NodeFactory<SupportedKeys extends string = string, Options extends UnknownRecord = UnknownRecord> = (
    utils: Utils,
    options?: Partial<CommonOptions<SupportedKeys, Options>>,
) => NodeSpec<SupportedKeys>;

type WithExtend<SupportedKeys extends string = string, Options extends UnknownRecord = UnknownRecord> = AddMetadata<
    SupportedKeys,
    Options
> & {
    extend: <ExtendedSupportedKeys extends string = SupportedKeys, ExtendedOptions extends UnknownRecord = Options>(
        extendFactory: (
            ...args: [
                original: NodeSpec<SupportedKeys>,
                ...rest: Parameters<NodeFactory<ExtendedSupportedKeys, ExtendedOptions>>
            ]
        ) => NodeSpec<ExtendedSupportedKeys>,
    ) => AddMetadata<ExtendedSupportedKeys, ExtendedOptions>;
};

const withExtend = <SupportedKeys extends string, Options extends UnknownRecord>(
    factory: NodeFactory<SupportedKeys, Options>,
    origin: AddMetadata<SupportedKeys, Options>,
) => {
    const next = origin as WithExtend<SupportedKeys, Options>;
    const extend = <
        ExtendedSupportedKeys extends string = SupportedKeys,
        ExtendedOptions extends UnknownRecord = Options,
    >(
        extendFactory: (
            ...args: [
                original: NodeSpec<SupportedKeys>,
                ...rest: Parameters<NodeFactory<ExtendedSupportedKeys, ExtendedOptions>>
            ]
        ) => NodeSpec<ExtendedSupportedKeys>,
    ) => {
        return createNode<ExtendedSupportedKeys, ExtendedOptions>((...args) => {
            return extendFactory(factory(...(args as Parameters<NodeFactory<SupportedKeys, Options>>)), ...args);
        });
    };

    next.extend = extend;

    return next;
};

export const createNode = <SupportedKeys extends string = string, Options extends UnknownRecord = UnknownRecord>(
    factory: NodeFactory<SupportedKeys, Options>,
): WithExtend<SupportedKeys, Options> => {
    const origin = addMetadata<SupportedKeys, Options>(
        (options): MilkdownPlugin =>
            () =>
            async (ctx) => {
                const utils = getUtils(ctx, options);

                const plugin = factory(utils, options);

                await applyMethods(
                    ctx,
                    plugin,
                    async () => {
                        const node = plugin.schema(ctx);
                        ctx.update(nodesCtx, (ns) => [...ns, [plugin.id, node] as [string, NodeSchema]]);

                        await ctx.wait(SchemaReady);

                        const schema = ctx.get(schemaCtx);
                        return schema.nodes[plugin.id];
                    },
                    options,
                );

                if (plugin.view) {
                    const view = plugin.view(ctx);
                    ctx.update(viewCtx, (v) => [...v, [plugin.id, view] as [string, ViewFactory]]);
                }
            },
    );
    return withExtend(factory, origin);
};
