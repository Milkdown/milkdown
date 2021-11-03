/* Copyright 2021, Milkdown by Mirone. */

import {
    commandsCtx,
    Ctx,
    inputRulesCtx,
    MarkSchema,
    marksCtx,
    MilkdownPlugin,
    prosePluginsCtx,
    remarkPluginsCtx,
    schemaCtx,
    SchemaReady,
    themeToolCtx,
    viewCtx,
} from '@milkdown/core';
import { keymap, MarkType, MarkViewFactory, ViewFactory } from '@milkdown/prose';

import { CommandConfig, CommonOptions, Methods, UnknownRecord, Utils } from '../types';
import { getClassName } from './common';

type MarkFactory<SupportedKeys extends string = string, Options extends UnknownRecord = UnknownRecord> = (
    utils: Utils,
    options?: Partial<CommonOptions<SupportedKeys, Options>>,
) => {
    id: string;
    schema: (ctx: Ctx) => MarkSchema;
    view?: (ctx: Ctx) => MarkViewFactory;
} & Methods<SupportedKeys, MarkType>;

export const createMark = <SupportedKeys extends string = string, Options extends UnknownRecord = UnknownRecord>(
    factory: MarkFactory<SupportedKeys, Options>,
) => {
    return (options?: Partial<Options>): MilkdownPlugin => {
        return () => async (ctx) => {
            const themeTool = ctx.get(themeToolCtx);
            const utils: Utils = {
                getClassName: getClassName(options?.className as undefined),
                getStyle: (style) => (options?.headless ? '' : (style(themeTool) as string | undefined)),
            };

            const plugin = factory(utils, options);

            if (plugin.remarkPlugins) {
                const remarkPlugins = plugin.remarkPlugins(ctx);
                ctx.update(remarkPluginsCtx, (ps) => [...ps, ...remarkPlugins]);
            }

            const node = plugin.schema(ctx);
            ctx.update(marksCtx, (ns) => [...ns, [plugin.id, node] as [string, MarkSchema]]);

            await ctx.wait(SchemaReady);

            const schema = ctx.get(schemaCtx);
            const type = schema.marks[plugin.id];

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

            if (plugin.shortcuts) {
                // TODO: get keymap from config
                const keyMapping = plugin.shortcuts;
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

            if (plugin.view) {
                const view = plugin.view(ctx);
                ctx.update(viewCtx, (v) => [...v, [plugin.id, view] as [string, ViewFactory]]);
            }
        };
    };
};
