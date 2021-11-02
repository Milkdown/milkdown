/* Copyright 2021, Milkdown by Mirone. */

import {
    CmdKey,
    CmdTuple,
    commandsCtx,
    Ctx,
    InitReady,
    inputRulesCtx,
    MarkSchema,
    marksCtx,
    MilkdownPlugin,
    NodeSchema,
    nodesCtx,
    prosePluginsCtx,
    RemarkPlugin,
    remarkPluginsCtx,
    schemaCtx,
    SchemaReady,
    themeToolCtx,
} from '@milkdown/core';
import { InputRule, keymap, MarkType, NodeType, Plugin } from '@milkdown/prose';

import { Utils } from '..';
import { UnknownRecord } from '../types';
import { getClassName } from './common';

type TypeMapping<NodeKeys extends string, MarkKeys extends string> = {
    [K in NodeKeys]: NodeType;
} & {
    [K in MarkKeys]: MarkType;
};

type CommandConfig<T = unknown> = [commandKey: CmdKey<T>, defaultKey: string, args?: T];
export const createShortcut = <T>(commandKey: CmdKey<T>, defaultKey: string, args?: T) =>
    [commandKey, defaultKey, args] as CommandConfig<unknown>;

type PluginFactory<
    SupportedKeys extends string = string,
    Options extends UnknownRecord = UnknownRecord,
    NodeKeys extends string = string,
    MarkKeys extends string = string,
> = (
    options: Options,
    utils: Utils,
) => {
    schema?: (ctx: Ctx) => {
        node?: Record<NodeKeys, NodeSchema>;
        mark?: Record<MarkKeys, MarkSchema>;
    };
    inputRules?: (types: TypeMapping<NodeKeys, MarkKeys>, ctx: Ctx) => InputRule[];
    prosePlugins?: (types: TypeMapping<NodeKeys, MarkKeys>, ctx: Ctx) => Plugin[];
    remarkPlugins?: (types: TypeMapping<NodeKeys, MarkKeys>, ctx: Ctx) => RemarkPlugin[];
    commands?: (types: TypeMapping<NodeKeys, MarkKeys>, ctx: Ctx) => CmdTuple[];
    keymap?: (types: TypeMapping<NodeKeys, MarkKeys>, ctx: Ctx) => Record<SupportedKeys, CommandConfig>;
};

export const createPlugin = <
    SupportedKeys extends string = string,
    Options extends UnknownRecord = UnknownRecord,
    NodeKeys extends string = string,
    MarkKeys extends string = string,
>(
    factory: PluginFactory<SupportedKeys, Options, NodeKeys, MarkKeys>,
) => {
    return (options: Options): MilkdownPlugin => {
        return () => async (ctx) => {
            await ctx.wait(InitReady);
            const themeTool = ctx.get(themeToolCtx);
            const utils: Utils = {
                ctx,
                getClassName: getClassName(options?.className as undefined),
                getStyle: (style) => (options?.headless ? '' : (style(themeTool) as string | undefined)),
            };

            const plugin = factory(options, utils);

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
