/* Copyright 2021, Milkdown by Mirone. */

import {
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

import { Utils } from '..';
import { CommonOptions, Methods, UnknownRecord } from '../types';
import { addMetadata, applyMethods, getUtils } from '.';

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

type PluginFactory<
    SupportedKeys extends string = string,
    Options extends UnknownRecord = UnknownRecord,
    NodeKeys extends string = string,
    MarkKeys extends string = string,
> = (
    utils: Utils,
    options?: Partial<CommonOptions<SupportedKeys, Options>>,
) => {
    schema?: (ctx: Ctx) => {
        node?: Record<NodeKeys, NodeSchema>;
        mark?: Record<MarkKeys, MarkSchema>;
    };
    view?: (ctx: Ctx) => Partial<ViewMapping<NodeKeys, MarkKeys>>;
} & Methods<SupportedKeys, TypeMapping<NodeKeys, MarkKeys>>;

export const createPlugin = <
    SupportedKeys extends string = string,
    Options extends UnknownRecord = UnknownRecord,
    NodeKeys extends string = string,
    MarkKeys extends string = string,
>(
    factory: PluginFactory<SupportedKeys, Options, NodeKeys, MarkKeys>,
) => {
    return addMetadata((options?: Partial<CommonOptions<SupportedKeys, Options>>): MilkdownPlugin => {
        return () => async (ctx) => {
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
                    const type: TypeMapping<NodeKeys, MarkKeys> = Object.fromEntries([...nodeTypes, ...markTypes]);
                    return type;
                },
                options,
            );

            if (plugin.view) {
                const view = plugin.view(ctx);
                ctx.update(viewCtx, (v) => [...v, ...Object.entries<ViewFactory>(view as Record<string, ViewFactory>)]);
            }
        };
    });
};
