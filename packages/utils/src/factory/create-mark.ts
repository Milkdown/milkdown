/* Copyright 2021, Milkdown by Mirone. */
import {
    CmdTuple,
    commandsFactory,
    inputRulesFactory,
    markFactory,
    MarkSchema,
    schemaCtx,
    viewFactory,
} from '@milkdown/core';
import { InputRule, MarkType, MarkViewFactory, Schema } from '@milkdown/prose';

import { ExtendFactory, Factory, Origin, PluginWithMetadata, UnknownRecord } from '../types';
import { commonPlugin } from './common';
// import { createKeymap } from './keymap';

export const createMark = <SupportedKeys extends string = string, T extends UnknownRecord = UnknownRecord>(
    factory: Factory<SupportedKeys, T, MarkSchema>,
): Origin<SupportedKeys, T, MarkSchema> => {
    const origin: Origin<SupportedKeys, T, MarkSchema> = (options) => {
        let id: string;
        let inputRules: ((nodeType: MarkType, schema: Schema) => InputRule[]) | undefined;
        let view: MarkViewFactory | undefined;
        let commands: ((nodeType: MarkType, schema: Schema) => CmdTuple<unknown>[]) | undefined;
        const plugins = [];

        const plugin = markFactory((ctx) => {
            const mark = commonPlugin(factory, ctx, options);
            const view = options?.view ?? mark.view;
            // const keymap = createKeymap(mark.shortcuts, options?.keymap);
            plugin.id = mark.id;

            return {
                ...mark,
                view,
                // keymap,
            };
        }) as PluginWithMetadata<SupportedKeys, T, MarkSchema>;
        plugins.push(plugin);

        const rules = inputRules;
        if (rules) {
            const inputRulesPlugin = inputRulesFactory((ctx) => {
                const schema = ctx.get(schemaCtx);
                return rules(schema.marks[id], schema);
            });
            plugins.push(inputRulesPlugin);
        }
        const cmd = commands;
        if (cmd) {
            const commandsPlugin = commandsFactory((ctx) => {
                const schema = ctx.get(schemaCtx);
                return cmd(schema.marks[id], schema);
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
        extendFactory: ExtendFactory<SupportedKeys, SupportedKeysExtended, ObjExtended, MarkSchema>,
    ) => {
        return createMark<SupportedKeysExtended, ObjExtended>((options, utils) => {
            const original = factory(options as T, utils);
            const extended = extendFactory(options, utils, original);
            return extended;
        });
    };

    return origin;
};
