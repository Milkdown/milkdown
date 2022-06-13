/* Copyright 2021, Milkdown by Mirone. */

import {
    Ctx,
    MarkSchema,
    marksCtx,
    markViewCtx,
    MilkdownPlugin,
    NodeSchema,
    nodesCtx,
    nodeViewCtx,
    schemaCtx,
    SchemaReady,
    Slice,
    ThemeReady,
} from '@milkdown/core';
import { MarkType, NodeType } from '@milkdown/prose/model';
import { MarkViewConstructor, NodeViewConstructor } from '@milkdown/prose/view';

import { Factory, UnknownRecord, WithExtend } from '../types';
import { addMetadata, applyMethods, getUtils, withExtend } from './common';

export type TypeMapping<NodeKeys extends string, MarkKeys extends string> = {
    [K in NodeKeys]: NodeType;
} & {
    [K in MarkKeys]: MarkType;
};

export type ViewMapping<NodeKeys extends string, MarkKeys extends string> = {
    [K in NodeKeys]: NodeViewConstructor;
} & {
    [K in MarkKeys]: MarkViewConstructor;
};

export type PluginRest<NodeKeys extends string, MarkKeys extends string> = {
    schema?: (ctx: Ctx) => {
        node?: Record<NodeKeys, NodeSchema>;
        mark?: Record<MarkKeys, MarkSchema>;
    };
    view?: (ctx: Ctx) => Partial<ViewMapping<NodeKeys, MarkKeys>>;
};
export type PluginFactory<
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inject?: Slice<any>[],
): WithExtend<SupportedKeys, Options, TypeMapping<NodeKeys, MarkKeys>, PluginRest<NodeKeys, MarkKeys>> =>
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
                            const nodeViews = Object.entries(view).filter(
                                ([id]) => ctx.get(nodesCtx).findIndex((ns) => ns[0] === id) !== -1,
                            );
                            const markViews = Object.entries(view).filter(
                                ([id]) => ctx.get(marksCtx).findIndex((ns) => ns[0] === id) !== -1,
                            );
                            ctx.update(nodeViewCtx, (v) => [...v, ...(nodeViews as [string, NodeViewConstructor][])]);
                            ctx.update(markViewCtx, (v) => [...v, ...(markViews as [string, MarkViewConstructor][])]);
                        }
                    };
                },
        ),
        createPlugin,
    );
