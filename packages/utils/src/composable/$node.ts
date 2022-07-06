/* Copyright 2021, Milkdown by Mirone. */
import {
    Ctx,
    MilkdownPlugin,
    NodeSchema,
    nodesCtx,
    schemaCtx,
    SchemaReady,
    schemaTimerCtx,
    ThemeReady,
} from '@milkdown/core';
import { missingNodeInSchema } from '@milkdown/exception';
import { NodeType } from '@milkdown/prose/model';

import { addTimer } from './utils';

export type $Node = MilkdownPlugin & {
    id: string;
    type: NodeType;
    schema: NodeSchema;
};

export const $node = (id: string, schema: (ctx: Ctx) => NodeSchema): $Node => {
    const plugin: MilkdownPlugin = () => async (ctx) => {
        await ctx.wait(ThemeReady);
        const nodeSchema = schema(ctx);
        ctx.update(nodesCtx, (ns) => [...ns, [id, nodeSchema] as [string, NodeSchema]]);

        (<$Node>plugin).id = id;
        (<$Node>plugin).schema = nodeSchema;

        await ctx.wait(SchemaReady);

        const nodeType = ctx.get(schemaCtx).nodes[id];

        if (!nodeType) {
            throw missingNodeInSchema(id);
        }

        (<$Node>plugin).type = nodeType;
    };

    return <$Node>plugin;
};

export const $nodeAsync = (id: string, schema: (ctx: Ctx) => Promise<NodeSchema>, timerName?: string) => {
    return addTimer<$Node>(
        async (ctx, plugin, done) => {
            await ctx.wait(ThemeReady);
            const nodeSchema = await schema(ctx);
            ctx.update(nodesCtx, (ns) => [...ns, [id, nodeSchema] as [string, NodeSchema]]);

            plugin.id = id;
            plugin.schema = nodeSchema;
            done();

            await ctx.wait(SchemaReady);

            const nodeType = ctx.get(schemaCtx).nodes[id];

            if (!nodeType) {
                throw missingNodeInSchema(id);
            }

            plugin.type = nodeType;
        },
        schemaTimerCtx,
        timerName,
    );
};
