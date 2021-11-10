/* Copyright 2021, Milkdown by Mirone. */

import { Ctx, MilkdownPlugin, NodeSchema, nodesCtx, schemaCtx, SchemaReady, viewCtx } from '@milkdown/core';
import { NodeType, NodeViewFactory, ViewFactory } from '@milkdown/prose';

import { Factory, UnknownRecord, WithExtend } from '../types';
import { addMetadata, applyMethods, getUtils, withExtend } from './common';

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

export const createNode = <SupportedKeys extends string = string, Options extends UnknownRecord = UnknownRecord>(
    factory: NodeFactory<SupportedKeys, Options>,
): WithExtend<SupportedKeys, Options, NodeType, NodeRest> => {
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
    return withExtend(factory, origin, createNode);
};
