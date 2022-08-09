/* Copyright 2021, Milkdown by Mirone. */

import { Ctx, MilkdownPlugin, NodeSchema } from '@milkdown/core';
import { NodeType } from '@milkdown/prose/model';
import { NodeViewConstructor } from '@milkdown/prose/view';

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
    idPipeCtx,
    injectPipeEnv,
    injectSlices,
    optionsPipeCtx,
    shortcutsPipeCtx,
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
    inject?: AnySlice[],
): NodeCreator<SupportedKeys, Options> =>
    pipe(
        addMetadata,
        withExtend(factory, createNode),
    )(
        (options?: Partial<CommonOptions<SupportedKeys, Options>>): MilkdownPlugin =>
            (pre) =>
            async (ctx) => {
                const setPipelineEnv: Pipeline = async ({ pipelineCtx }, next) => {
                    const utils = getThemeUtils(ctx, options);
                    const plugin = factory(utils, options);

                    const { id, commands, remarkPlugins, schema, inputRules, shortcuts, prosePlugins, view } = plugin;

                    const pluginOptions = {
                        ...(options || {}),
                        view: options?.view
                            ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                              (ctx: Ctx) => ({ [id]: options!.view!(ctx) })
                            : undefined,
                    };

                    pipelineCtx.set(idPipeCtx, id);
                    pipelineCtx.set(optionsPipeCtx, pluginOptions);
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
