/* Copyright 2021, Milkdown by Mirone. */

import { Ctx, MarkSchema, MilkdownPlugin, NodeSchema } from '@milkdown/core';
import { MarkType, NodeType } from '@milkdown/prose/model';
import { MarkViewConstructor, NodeViewConstructor } from '@milkdown/prose/view';

import { pipe } from '../pipe';
import { AnySlice, CommonOptions, Factory, UnknownRecord, WithExtend } from '../types';
import { addMetadata, getThemeUtils, withExtend } from './common';
import {
    applyProsePlugins,
    applyRemarkPlugins,
    applySchema,
    applyView,
    createCommands,
    createInputRules,
    createShortcuts,
    getCommandsPipeCtx,
    getInputRulesPipeCtx,
    getProsePluginsPipeCtx,
    getRemarkPluginsPipeCtx,
    getSchemaPipeCtx,
    getViewPipeCtx,
    injectPipeEnv,
    injectSlices,
    optionsPipeCtx,
    shortcutsPipeCtx,
    waitThemeReady,
} from './pieces';
import { Pipeline, run } from './pipeline';

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
    inject?: AnySlice[],
): WithExtend<SupportedKeys, Options, TypeMapping<NodeKeys, MarkKeys>, PluginRest<NodeKeys, MarkKeys>> =>
    pipe(
        addMetadata,
        withExtend(factory, createPlugin),
    )(
        (options?: Partial<CommonOptions<SupportedKeys, Options>>): MilkdownPlugin =>
            (pre) =>
            async (ctx) => {
                const setPipelineEnv: Pipeline = async ({ pipelineCtx }, next) => {
                    const utils = getThemeUtils(ctx, options);
                    const plugin = factory(utils, options);

                    const { commands, remarkPlugins, schema, inputRules, shortcuts, prosePlugins, view } = plugin;

                    pipelineCtx.set(optionsPipeCtx, (options || {}) as Options);
                    pipelineCtx.set(getRemarkPluginsPipeCtx, remarkPlugins);
                    if (schema) {
                        pipelineCtx.set(getSchemaPipeCtx, schema);
                    }
                    if (commands) {
                        pipelineCtx.set(getCommandsPipeCtx, commands as never);
                    }
                    if (inputRules) {
                        pipelineCtx.set(getInputRulesPipeCtx, inputRules as never);
                    }
                    if (shortcuts) {
                        pipelineCtx.set(shortcutsPipeCtx, shortcuts);
                    }
                    if (prosePlugins) {
                        pipelineCtx.set(getProsePluginsPipeCtx, prosePlugins as never);
                    }
                    if (view) {
                        pipelineCtx.set(getViewPipeCtx, view as never);
                    }
                    await next();
                };

                const runner = run([
                    injectPipeEnv,
                    injectSlices(inject),
                    waitThemeReady,
                    setPipelineEnv,
                    applyRemarkPlugins,
                    applySchema,
                    createCommands,
                    createInputRules,
                    createShortcuts,
                    applyProsePlugins,
                    applyView,
                ]);

                await runner(pre, ctx);
            },
    );
