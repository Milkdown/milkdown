/* Copyright 2021, Milkdown by Mirone. */

import { Ctx, MilkdownPlugin, NodeSchema, nodesCtx, schemaCtx, SchemaReady, ThemeReady, viewCtx } from '@milkdown/core';
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
): WithExtend<SupportedKeys, Options, NodeType, NodeRest> =>
    withExtend(
        factory,
        addMetadata(
            (options): MilkdownPlugin =>
                () =>
                async (ctx) => {
                    // TODO: inject theme key to theme manager here
                    await ctx.wait(ThemeReady);
                    const utils = getUtils(ctx, options);

                    const plugin = factory(utils, options);
                    plugin.view = options?.view ?? plugin.view;

                    await applyMethods(
                        ctx,
                        plugin,
                        async () => {
                            const node = plugin.schema(ctx);
                            ctx.update(nodesCtx, (ns) => [...ns, [plugin.id, node] as [string, NodeSchema]]);

                            await ctx.wait(SchemaReady);

                            const schema = ctx.get(schemaCtx);
                            const nodeType = schema.nodes[plugin.id];
                            if (!nodeType) {
                                throw new Error();
                            }
                            return nodeType;
                        },
                        options,
                    );

                    if (plugin.view) {
                        const view = plugin.view(ctx);
                        ctx.update(viewCtx, (v) => [...v, [plugin.id, view] as [string, ViewFactory]]);
                    }
                },
        ),
        createNode,
    );
