/* Copyright 2021, Milkdown by Mirone. */

import {
    Ctx,
    MilkdownPlugin,
    NodeSchema,
    nodesCtx,
    nodeViewCtx,
    schemaCtx,
    SchemaReady,
    Slice,
    ThemeReady,
} from '@milkdown/core';
import { missingNodeInSchema } from '@milkdown/exception';
import { NodeType } from '@milkdown/prose/model';
import { NodeViewConstructor } from '@milkdown/prose/view';

import { Factory, UnknownRecord, WithExtend } from '../types';
import { addMetadata, applyMethods, getUtils, withExtend } from './common';

export type NodeRest = {
    id: string;
    schema: (ctx: Ctx) => NodeSchema;
    view?: (ctx: Ctx) => NodeViewConstructor;
};

export type NodeFactory<SupportedKeys extends string, Options extends UnknownRecord> = Factory<
    SupportedKeys,
    Options,
    NodeType,
    NodeRest
>;

export type NodeCreator<
    SupportedKeys extends string = string,
    Options extends UnknownRecord = UnknownRecord,
> = WithExtend<SupportedKeys, Options, NodeType, NodeRest>;

export const createNode = <SupportedKeys extends string = string, Options extends UnknownRecord = UnknownRecord>(
    factory: NodeFactory<SupportedKeys, Options>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inject?: Slice<any>[],
): NodeCreator<SupportedKeys, Options> =>
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
                        plugin.view = (options?.view ?? plugin.view) as (ctx: Ctx) => NodeViewConstructor;

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
                                    throw missingNodeInSchema(plugin.id);
                                }
                                return nodeType;
                            },
                            options,
                        );

                        if (plugin.view) {
                            const view = plugin.view(ctx);
                            ctx.update(nodeViewCtx, (v) => [...v, [plugin.id, view] as [string, NodeViewConstructor]]);
                        }
                    };
                },
        ),
        createNode,
    );
