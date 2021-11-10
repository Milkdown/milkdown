/* Copyright 2021, Milkdown by Mirone. */

import { Ctx, MilkdownPlugin, NodeSchema, nodesCtx, schemaCtx, SchemaReady, viewCtx } from '@milkdown/core';
import { NodeType, NodeViewFactory, ViewFactory } from '@milkdown/prose';

import { AddMetadata, Factory, UnknownRecord, WithExtend } from '../types';
import { addMetadata, applyMethods, getUtils } from './common';

type NodeRest = {
    id: string;
    schema: (ctx: Ctx) => NodeSchema;
    view?: (ctx: Ctx) => NodeViewFactory;
};

type NodeFactory<SupportedKeys extends string, Options extends UnknownRecord> = Factory<
    SupportedKeys,
    Options,
    NodeType,
    NodeRest
>;

type Extend<SupportedKeys extends string = string, Options extends UnknownRecord = UnknownRecord> = WithExtend<
    SupportedKeys,
    Options,
    NodeType,
    NodeRest
>;

const withExtend = <SupportedKeys extends string, Options extends UnknownRecord>(
    factory: NodeFactory<SupportedKeys, Options>,
    origin: AddMetadata<SupportedKeys, Options>,
) => {
    type Ext = Extend<SupportedKeys, Options>;
    const next = origin as Ext;
    const extend = (extendFactory: Parameters<Ext['extend']>[0]) =>
        createNode((...args) =>
            extendFactory(factory(...(args as Parameters<NodeFactory<SupportedKeys, Options>>)), ...args),
        );

    next.extend = extend as Ext['extend'];

    return next;
};

export const createNode = <SupportedKeys extends string = string, Options extends UnknownRecord = UnknownRecord>(
    factory: NodeFactory<SupportedKeys, Options>,
): Extend<SupportedKeys, Options> => {
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
