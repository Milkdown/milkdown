/* Copyright 2021, Milkdown by Mirone. */

import { Ctx, MarkSchema, MilkdownPlugin } from '@milkdown/core';
import { MarkType } from '@milkdown/prose/model';
import { MarkViewConstructor } from '@milkdown/prose/view';

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

export type MarkRest = {
    id: string;
    schema: (ctx: Ctx) => MarkSchema;
    view?: (ctx: Ctx) => MarkViewConstructor;
};

export type MarkFactory<SupportedKeys extends string, Options extends UnknownRecord> = Factory<
    SupportedKeys,
    Options,
    MarkType,
    MarkRest
>;

export type MarkCreator<SupportedKeys extends string, Options extends UnknownRecord> = WithExtend<
    SupportedKeys,
    Options,
    MarkType,
    MarkRest
>;

export const createMark = <SupportedKeys extends string = string, Options extends UnknownRecord = UnknownRecord>(
    factory: MarkFactory<SupportedKeys, Options>,
    inject?: AnySlice[],
): MarkCreator<string, Options> =>
    pipe(
        addMetadata,
        withExtend(factory, createMark),
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
                    pipelineCtx.set(getSchemaPipeCtx, (ctx) => ({ mark: { [id]: schema(ctx) } }));
                    if (commands) {
                        pipelineCtx.set(getCommandsPipeCtx, (type, ctx) => commands(type[id] as MarkType, ctx));
                    }
                    if (inputRules) {
                        pipelineCtx.set(getInputRulesPipeCtx, (type, ctx) => inputRules(type[id] as MarkType, ctx));
                    }
                    if (shortcuts) {
                        pipelineCtx.set(shortcutsPipeCtx, shortcuts);
                    }
                    if (prosePlugins) {
                        pipelineCtx.set(getProsePluginsPipeCtx, (type, ctx) => prosePlugins(type[id] as MarkType, ctx));
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
