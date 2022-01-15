/* Copyright 2021, Milkdown by Mirone. */

import {
    ConfigReady,
    Ctx,
    MarkSchema,
    marksCtx,
    MilkdownPlugin,
    NodeSchema,
    nodesCtx,
    schemaCtx,
    SchemaReady,
    viewCtx,
} from '@milkdown/core';
import { MarkType, MarkViewFactory, NodeType, NodeViewFactory, ViewFactory } from '@milkdown/prose';

import { Factory, UnknownRecord, WithExtend } from '../types';
import { addMetadata, applyMethods, getUtils, withExtend } from './common';

type TypeMapping<NodeKeys extends string, MarkKeys extends string> = {
    [K in NodeKeys]: NodeType;
} & {
    [K in MarkKeys]: MarkType;
};

type ViewMapping<NodeKeys extends string, MarkKeys extends string> = {
    [K in NodeKeys]: NodeViewFactory;
} & {
    [K in MarkKeys]: MarkViewFactory;
};

type PluginRest<NodeKeys extends string, MarkKeys extends string> = {
    schema?: (ctx: Ctx) => {
        node?: Record<NodeKeys, NodeSchema>;
        mark?: Record<MarkKeys, MarkSchema>;
    };
    view?: (ctx: Ctx) => Partial<ViewMapping<NodeKeys, MarkKeys>>;
};
type PluginFactory<
    SupportedKeys extends string = string,
    Options extends UnknownRecord = UnknownRecord,
    NodeKeys extends string = string,
    MarkKeys extends string = string,
> = Factory<SupportedKeys, Options, TypeMapping<NodeKeys, MarkKeys>, PluginRest<NodeKeys, MarkKeys>>;

export const createPlugin = <
    SupportedKeys extends string = string,
    Options extends UnknownRecord = UnknownRecord,
    NodeKeys extends string = string,
    MarkKeys extends string = string,
>(
    factory: PluginFactory<SupportedKeys, Options, NodeKeys, MarkKeys>,
): WithExtend<SupportedKeys, Options, TypeMapping<NodeKeys, MarkKeys>, PluginRest<NodeKeys, MarkKeys>> =>
    withExtend(
        factory,
        addMetadata(
            (options): MilkdownPlugin =>
                () =>
                async (ctx) => {
                    await ctx.wait(ConfigReady);
                    const utils = getUtils(ctx, options);

                    const plugin = factory(utils, options);

                    await applyMethods(
                        ctx,
                        plugin,
                        async () => {
                            let node: Record<NodeKeys, NodeSchema> = {} as Record<NodeKeys, NodeSchema>;
                            let mark: Record<MarkKeys, MarkSchema> = {} as Record<MarkKeys, MarkSchema>;
                            if (plugin.schema) {
                                const schemas = plugin.schema(ctx);
                                if (schemas.node) {
                                    node = schemas.node;
                                    const nodes = Object.entries<NodeSchema>(schemas.node);
                                    ctx.update(nodesCtx, (ns) => [...ns, ...nodes]);
                                }

                                if (schemas.mark) {
                                    mark = schemas.mark;
                                    const marks = Object.entries<MarkSchema>(schemas.mark);
                                    ctx.update(marksCtx, (ms) => [...ms, ...marks]);
                                }
                            }

                            await ctx.wait(SchemaReady);

                            const schema = ctx.get(schemaCtx);
                            const nodeTypes = Object.keys(node).map((id) => [id, schema.nodes[id]] as const);
                            const markTypes = Object.keys(mark).map((id) => [id, schema.marks[id]] as const);
                            const type: TypeMapping<NodeKeys, MarkKeys> = Object.fromEntries([
                                ...nodeTypes,
                                ...markTypes,
                            ]);
                            return type;
                        },
                        options,
                    );

                    if (plugin.view) {
                        const view = plugin.view(ctx);
                        ctx.update(viewCtx, (v) => [
                            ...v,
                            ...Object.entries<ViewFactory>(view as Record<string, ViewFactory>),
                        ]);
                    }
                },
        ),
        createPlugin,
    );
