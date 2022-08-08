/* Copyright 2021, Milkdown by Mirone. */

import { Ctx, MilkdownPlugin, NodeSchema, Slice, ThemeReady } from '@milkdown/core';
import { NodeType } from '@milkdown/prose/model';
import { NodeViewConstructor } from '@milkdown/prose/view';

import { Factory, UnknownRecord, WithExtend } from '../types';
import { addMetadata, getUtils, withExtend } from './common';
import {
    applyProsePlugins,
    applyRemarkPlugins,
    applySchema,
    applyView,
    createCommands,
    createInputRules,
    createShortcuts,
    injectOptions,
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
            const milkdownPlugin: MilkdownPlugin = (pre) => {
                inject?.forEach((slice) => pre.inject(slice));
                return async (ctx) => {
                    await ctx.wait(ThemeReady);
                    const utils = getUtils(ctx, options);

                    const plugin = factory(utils, options);

                    const { id, commands, remarkPlugins, schema, inputRules, shortcuts, prosePlugins, view } = plugin;

                    const pipes = [
                        injectOptions(options),
                        remarkPlugins ? applyRemarkPlugins(remarkPlugins) : null,
                        applySchema((ctx) => {
                            const node = schema(ctx);
                            return {
                                node: {
                                    [id]: node,
                                },
                            };
                        }),
                        commands ? createCommands((types, ctx) => commands(types[id] as NodeType, ctx)) : null,
                        inputRules ? createInputRules((types, ctx) => inputRules(types[id] as NodeType, ctx)) : null,
                        shortcuts ? createShortcuts(shortcuts) : null,
                        prosePlugins
                            ? applyProsePlugins((types, ctx) => prosePlugins(types[id] as NodeType, ctx))
                            : null,
                        view ? applyView((ctx) => ({ [id]: view(ctx) })) : null,
                    ].filter((x): x is Pipeline => x != null);

                    const runner = run(pipes);

                    await runner(pre, ctx, milkdownPlugin);
                };
            };
            return milkdownPlugin;
        }),
        createNode,
    );
