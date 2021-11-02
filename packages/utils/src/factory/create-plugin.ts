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
} from '@milkdown/core';
import { InputRule, keymap, MarkType, NodeType, Plugin } from '@milkdown/prose';

import { UnknownRecord } from '../types';

type TypeMapping<NodeKeys extends string, MarkKeys extends string> = {
    [K in NodeKeys]: NodeType;
} & {
    [K in MarkKeys]: MarkType;
};

type CommandConfig<T = unknown> = [commandKey: CmdKey<T>, defaultKey: string, args?: T];

type PluginFactory<
    SupportedKeys extends string = string,
    Options extends UnknownRecord = UnknownRecord,
    NodeKeys extends string = string,
    MarkKeys extends string = string,
> = (options: Options) => {
    schema?: (ctx: Ctx) => {
        node: Record<NodeKeys, Omit<NodeSchema, 'id'>>;
        mark: Record<MarkKeys, Omit<MarkSchema, 'id'>>;
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
    factory: PluginFactory<SupportedKeys, Options>,
) => {
    return (options: Options): MilkdownPlugin => {
        const plugin = factory(options);

        return () => async (ctx) => {
            await ctx.wait(InitReady);
            let node: Record<NodeKeys, Omit<NodeSchema, 'id'>> = {} as Record<NodeKeys, Omit<NodeSchema, 'id'>>;
            let mark: Record<MarkKeys, Omit<MarkSchema, 'id'>> = {} as Record<MarkKeys, Omit<MarkSchema, 'id'>>;
            if (plugin.schema) {
                const schemas = plugin.schema(ctx);
                node = schemas.node;
                mark = schemas.mark;

                const nodes = Object.entries(schemas.node).map(
                    ([id, schema]) =>
                        ({
                            id,
                            ...schema,
                        } as NodeSchema),
                );
                const marks = Object.entries(schemas.mark).map(
                    ([id, schema]) =>
                        ({
                            id,
                            ...schema,
                        } as MarkSchema),
                );
                ctx.update(nodesCtx, (ns) => [...ns, ...nodes]);
                ctx.update(marksCtx, (ms) => [...ms, ...marks]);
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
