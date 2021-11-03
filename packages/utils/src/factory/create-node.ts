/* Copyright 2021, Milkdown by Mirone. */

import {
    commandsCtx,
    Ctx,
    InitReady,
    inputRulesCtx,
    MilkdownPlugin,
    NodeSchema,
    nodesCtx,
    prosePluginsCtx,
    remarkPluginsCtx,
    schemaCtx,
    SchemaReady,
    themeToolCtx,
} from '@milkdown/core';
import { keymap, NodeType, NodeViewFactory } from '@milkdown/prose';

import { CommandConfig, CommonOptions, Methods, UnknownRecord, Utils } from '../types';
import { getClassName } from './common';

type NodeFactory<SupportedKeys extends string = string, Options extends UnknownRecord = UnknownRecord> = (
    utils: Utils,
    options?: CommonOptions<SupportedKeys, Partial<Options>>,
) => {
    id: string;
    schema: (ctx: Ctx) => NodeSchema;
    view?: (ctx: Ctx) => NodeViewFactory;
} & Methods<SupportedKeys, NodeType>;

export const createNode = <SupportedKeys extends string = string, Options extends UnknownRecord = UnknownRecord>(
    factory: NodeFactory<SupportedKeys, Options>,
) => {
    return (options?: Partial<Options>): MilkdownPlugin => {
        return () => async (ctx) => {
            await ctx.wait(InitReady);
            const themeTool = ctx.get(themeToolCtx);
            const utils: Utils = {
                getClassName: getClassName(options?.className as undefined),
                getStyle: (style) => (options?.headless ? '' : (style(themeTool) as string | undefined)),
            };

            const plugin = factory(utils, options);

            const node = plugin.schema(ctx);
            ctx.update(nodesCtx, (ns) => [...ns, [plugin.id, node] as [string, NodeSchema]]);

            await ctx.wait(SchemaReady);

            const schema = ctx.get(schemaCtx);
            const type = schema.nodes[plugin.id];

            if (plugin.remarkPlugins) {
                const remarkPlugins = plugin.remarkPlugins(type, ctx);
                ctx.update(remarkPluginsCtx, (ps) => [...ps, ...remarkPlugins]);
            }

            if (plugin.commands) {
                const commands = plugin.commands(type, ctx);
                commands.forEach(([key, command]) => {
                    ctx.get(commandsCtx).create(key, command);
                });
            }

            if (plugin.inputRules) {
                const inputRules = plugin.inputRules(type, ctx);
                ctx.update(inputRulesCtx, (ir) => [...ir, ...inputRules]);
            }

            if (plugin.keymap) {
                // TODO: get keymap from config
                const keyMapping = plugin.keymap(type, ctx);
                const tuples = Object.values<CommandConfig>(keyMapping).map(
                    ([commandKey, defaultKey, args]) =>
                        [defaultKey, () => ctx.get(commandsCtx).call(commandKey, args)] as const,
                );
                ctx.update(prosePluginsCtx, (ps) => ps.concat(keymap(Object.fromEntries(tuples))));
            }

            if (plugin.prosePlugins) {
                const prosePlugins = plugin.prosePlugins(type, ctx);
                ctx.update(prosePluginsCtx, (ps) => [...ps, ...prosePlugins]);
            }
        };
    };
};
