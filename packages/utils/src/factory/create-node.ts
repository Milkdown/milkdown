/* Copyright 2021, Milkdown by Mirone. */
import {
    CmdTuple,
    commandsFactory,
    inputRulesFactory,
    nodeFactory,
    NodeSchema,
    // prosePluginFactory,
    schemaCtx,
    viewFactory,
} from '@milkdown/core';
import { InputRule, NodeType, NodeViewFactory, Schema } from '@milkdown/prose';

import { ExtendFactory, Factory, Origin, PluginWithMetadata, UnknownRecord } from '../types';
import { commonPlugin } from './common';
// import { createKeymap } from './keymap';

export const createNode = <SupportedKeys extends string = string, T extends UnknownRecord = UnknownRecord>(
    factory: Factory<SupportedKeys, T, NodeSchema>,
): Origin<SupportedKeys, T, NodeSchema> => {
    const origin: Origin<SupportedKeys, T, NodeSchema> = (options) => {
        let id: string;
        let inputRules: ((nodeType: NodeType, schema: Schema) => InputRule[]) | undefined;
        let view: NodeViewFactory | undefined;
        let commands: ((nodeType: NodeType, schema: Schema) => CmdTuple<unknown>[]) | undefined;
        const plugins = [];

        const plugin = nodeFactory((ctx) => {
            const node = commonPlugin(factory, ctx, options);

            view = options?.view ?? node.view;

            // const keymap = createKeymap(node.shortcuts, options?.keymap);

            plugin.id = node.id;
            id = node.id;
            inputRules = node.inputRules;
            commands = node.commands;

            return {
                ...node,
                // keymap,
            };
        }) as PluginWithMetadata<SupportedKeys, T, NodeSchema>;

        plugins.push(plugin);

        const rules = inputRules;
        if (rules) {
            const inputRulesPlugin = inputRulesFactory((ctx) => {
                const schema = ctx.get(schemaCtx);
                return rules(schema.nodes[id], schema);
            });
            plugins.push(inputRulesPlugin);
        }
        const cmd = commands;
        if (cmd) {
            const commandsPlugin = commandsFactory((ctx) => {
                const schema = ctx.get(schemaCtx);
                return cmd(schema.nodes[id], schema);
            });
            plugins.push(commandsPlugin);
        }
        const v = view;
        if (v) {
            const viewPlugin = viewFactory(() => {
                return [id, v];
            });
            plugins.push(viewPlugin);
        }

        plugin.origin = origin;

        return plugins as any;
    };
    origin.extend = <SupportedKeysExtended extends SupportedKeys = SupportedKeys, ObjExtended extends T = T>(
        extendFactory: ExtendFactory<SupportedKeys, SupportedKeysExtended, ObjExtended, NodeSchema>,
    ) => {
        return createNode<SupportedKeysExtended, ObjExtended>((options, utils) => {
            const original = factory(options as T, utils);
            return extendFactory(options, utils, original);
        });
    };

    return origin;
};
