/* Copyright 2021, Milkdown by Mirone. */

import { Ctx, Env, MilkdownPlugin, NodeSchema, Slice } from '@milkdown/core';
import { NodeType } from '@milkdown/prose/model';
import { NodeViewConstructor } from '@milkdown/prose/view';

import { Factory, UnknownRecord, WithExtend } from '../types';
import { addMetadata, withExtend } from './common';
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
    idPipeCtx,
    injectOptions,
    injectPipeEnv,
    injectSlices,
    shortcutsPipeCtx,
    themeUtilPipeCtx,
    waitThemeReady,
} from './pieces';
import { Pipeline, run } from './pipeline';

export type NodeRest = {
    id: string;
    schema: (ctx: Ctx) => NodeSchema;
    view?: (ctx: Ctx) => NodeViewConstructor;
};

export type NodeFactory<SupportedKeys extends string, Options extends UnknownRecord> = Factory<
    SupportedKeys,
    Options,
    NodeType,
    NodeRest
>;

export type NodeCreator<
    SupportedKeys extends string = string,
    Options extends UnknownRecord = UnknownRecord,
> = WithExtend<SupportedKeys, Options, NodeType, NodeRest>;

export const createNode = <SupportedKeys extends string = string, Options extends UnknownRecord = UnknownRecord>(
    factory: NodeFactory<SupportedKeys, Options>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inject?: Slice<any>[],
): NodeCreator<SupportedKeys, Options> =>
    withExtend(
        factory,
        addMetadata((options): MilkdownPlugin => {
            const milkdownPlugin: MilkdownPlugin = (pre) => async (ctx) => {
                const pluginOptions = {
                    ...(options || {}),
                    view: options?.view
                        ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                          (ctx: Ctx, pipelineCtx: Env) => ({ [pipelineCtx.get(idPipeCtx)]: options!.view!(ctx) })
                        : undefined,
                };

                const setGetters: Pipeline = async ({ pipelineCtx }, next) => {
                    const utils = pipelineCtx.get(themeUtilPipeCtx);
                    const plugin = factory(utils, options);

                    const { id, commands, remarkPlugins, schema, inputRules, shortcuts, prosePlugins, view } = plugin;

                    pipelineCtx.set(idPipeCtx, id);
                    pipelineCtx.set(getRemarkPluginsPipeCtx, remarkPlugins);
                    pipelineCtx.set(getSchemaPipeCtx, (ctx) => ({ node: { [id]: schema(ctx) } }));
                    if (commands) {
                        pipelineCtx.set(getCommandsPipeCtx, (type, ctx) => commands(type[id] as NodeType, ctx));
                    }
                    if (inputRules) {
                        pipelineCtx.set(getInputRulesPipeCtx, (type, ctx) => inputRules(type[id] as NodeType, ctx));
                    }
                    if (shortcuts) {
                        pipelineCtx.set(shortcutsPipeCtx, shortcuts);
                    }
                    if (prosePlugins) {
                        pipelineCtx.set(getProsePluginsPipeCtx, (type, ctx) => prosePlugins(type[id] as NodeType, ctx));
                    }
                    if (view) {
                        pipelineCtx.set(getViewPipeCtx, (ctx) => ({ [id]: view(ctx) }));
                    }
                    await next();
                };

                const pipes = [
                    injectPipeEnv,
                    injectSlices(inject),
                    waitThemeReady,
                    setGetters,
                    injectOptions(pluginOptions),
                    applyRemarkPlugins,
                    applySchema,
                    createCommands,
                    createInputRules,
                    createShortcuts,
                    applyProsePlugins,
                    applyView,
                ];

                const runner = run(pipes);

                await runner(pre, ctx, milkdownPlugin);
            };
            return milkdownPlugin;
        }),
        createNode,
    );
