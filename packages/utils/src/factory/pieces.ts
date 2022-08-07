/* Copyright 2021, Milkdown by Mirone. */
import {
    CmdTuple,
    commandsCtx,
    createSlice,
    Ctx,
    InitReady,
    inputRulesCtx,
    MarkSchema,
    marksCtx,
    markViewCtx,
    NodeSchema,
    nodesCtx,
    nodeViewCtx,
    prosePluginsCtx,
    RemarkPlugin,
    remarkPluginsCtx,
    schemaCtx,
    SchemaReady,
    Slice,
    ThemeReady,
} from '@milkdown/core';
import { ctxCallOutOfScope } from '@milkdown/exception';
import { InputRule } from '@milkdown/prose/inputrules';
import { keymap } from '@milkdown/prose/keymap';
import { MarkType, NodeType } from '@milkdown/prose/model';
import { Plugin } from '@milkdown/prose/state';
import { MarkViewConstructor, NodeViewConstructor } from '@milkdown/prose/view';

import { CommandConfig, CommonOptions, UnknownRecord, Utils } from '../types';
import { getUtils } from './common';
import { Pipeline } from './pipeline';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySlice = Slice<any>;

interface PipelineContext {
    options<SupportedKeys extends string = string, Options extends UnknownRecord = UnknownRecord>(): Partial<
        CommonOptions<SupportedKeys, Options>
    >;

    schema<NodeKeys extends string = string, MarkKeys extends string = string>(
        ctx: Ctx,
    ): {
        node?: Record<NodeKeys, NodeSchema>;
        mark?: Record<MarkKeys, MarkSchema>;
    };

    type<NodeKeys extends string = string, MarkKeys extends string = string>(
        ctx: Ctx,
    ): {
        [K in NodeKeys]: NodeType;
    } & {
        [K in MarkKeys]: MarkType;
    };

    view<NodeKeys extends string = string, MarkKeys extends string = string>(
        ctx: Ctx,
    ): {
        [K in NodeKeys]: NodeViewConstructor;
    } & {
        [K in MarkKeys]: MarkViewConstructor;
    };
}

export const injectSlices =
    (inject?: AnySlice[]): Pipeline =>
    async (env, next) => {
        inject?.forEach((slice) => env.pre.inject(slice));
        await next();
    };

const optionsPipeCtx = createSlice<PipelineContext['options']>(() => {
    throw ctxCallOutOfScope();
}, 'Options');
export const injectOptions = (options: ReturnType<PipelineContext['options']>): Pipeline => {
    return async (env, next) => {
        env.pipelineCtx.inject(optionsPipeCtx, (() => options) as PipelineContext['options']);
        await next();
    };
};

export const utilPipeCtx = createSlice<Utils>({} as Utils, 'Utils');
export const waitThemeReady: Pipeline = async (env, next) => {
    const { ctx, pipelineCtx } = env;
    await ctx.wait(ThemeReady);
    const options = pipelineCtx.get(optionsPipeCtx)();

    const utils = getUtils(ctx, options);
    pipelineCtx.inject(utilPipeCtx, utils);

    await next();
};

export const applyRemarkPlugins =
    (remarkPlugins: (ctx: Ctx) => RemarkPlugin[]): Pipeline =>
    async (env, next) => {
        const { ctx } = env;
        await ctx.wait(InitReady);

        const plugins = remarkPlugins(ctx);

        ctx.update(remarkPluginsCtx, (ps) => ps.concat(plugins));
        await next();
    };

export const typePipeCtx = createSlice<PipelineContext['type'], 'Type'>({} as PipelineContext['type'], 'Type');
export const applySchema =
    (getSchema: PipelineContext['schema']): Pipeline =>
    async (env, next) => {
        const { ctx, pipelineCtx } = env;

        const userSchema = getSchema(env.ctx);

        let node: Record<string, NodeSchema> = {};
        let mark: Record<string, MarkSchema> = {};

        if (userSchema.node) {
            node = userSchema.node;
            const nodes = Object.entries<NodeSchema>(userSchema.node);
            ctx.update(nodesCtx, (ns) => [...ns, ...nodes]);
        }

        if (userSchema.mark) {
            mark = userSchema.mark;
            const marks = Object.entries<MarkSchema>(userSchema.mark);
            ctx.update(marksCtx, (ms) => [...ms, ...marks]);
        }

        await ctx.wait(SchemaReady);

        const schema = ctx.get(schemaCtx);
        const nodeTypes = Object.keys(node).map((id) => [id, schema.nodes[id]] as const);
        const markTypes = Object.keys(mark).map((id) => [id, schema.marks[id]] as const);

        const type = Object.fromEntries([...nodeTypes, ...markTypes]);
        pipelineCtx.inject(typePipeCtx, type);

        await next();
    };

export const createCommands =
    (commands: (types: PipelineContext['type'], ctx: Ctx) => CmdTuple[]): Pipeline =>
    async (env, next) => {
        const { ctx, pipelineCtx } = env;
        const type = pipelineCtx.get(typePipeCtx);
        commands(type, ctx).forEach(([key, command]) => {
            ctx.get(commandsCtx).create(key, command);
        });
        await next();
    };

export const createInputRules =
    (inputRules: (types: PipelineContext['type'], ctx: Ctx) => InputRule[]): Pipeline =>
    async (env, next) => {
        const { ctx, pipelineCtx } = env;
        const type = pipelineCtx.get(typePipeCtx);
        ctx.update(inputRulesCtx, (ir) => [...ir, ...inputRules(type, ctx)]);

        await next();
    };

export const createShortcuts =
    (shortcuts: Record<string, CommandConfig>): Pipeline =>
    async (env, next) => {
        const { pipelineCtx, ctx } = env;

        const options = pipelineCtx.get(optionsPipeCtx)();

        const getKey = (key: string, defaultValue: string | string[]): string | string[] => {
            return options?.keymap?.[key] ?? defaultValue;
        };

        const tuples = Object.entries<CommandConfig>(shortcuts)
            .flatMap(([id, [commandKey, defaultKey, args]]) => {
                const runner = () => ctx.get(commandsCtx).call(commandKey, args);
                const key = getKey(id, defaultKey);
                if (Array.isArray(key)) {
                    return key.map((k) => ({ key: k, runner }));
                }
                return { key, runner };
            })
            .map((x) => [x.key, x.runner] as [string, () => boolean]);
        ctx.update(prosePluginsCtx, (ps) => ps.concat(keymap(Object.fromEntries(tuples))));

        await next();
    };

export const injectProsePlugins =
    (prosePlugins: (type: PipelineContext['type'], ctx: Ctx) => Plugin[]): Pipeline =>
    async (env, next) => {
        const { pipelineCtx, ctx } = env;
        const type = pipelineCtx.get(typePipeCtx);

        ctx.update(prosePluginsCtx, (ps) => [...ps, ...prosePlugins(type, ctx)]);

        await next();
    };

export const injectView =
    (getView: (type: PipelineContext['type'], ctx: Ctx) => PipelineContext['view']): Pipeline =>
    async (env, next) => {
        const { pipelineCtx, ctx } = env;
        const type = pipelineCtx.get(typePipeCtx);

        const view = getView(type, ctx);

        const nodeViews = Object.entries(view).filter(
            ([id]) => ctx.get(nodesCtx).findIndex((ns) => ns[0] === id) !== -1,
        );
        const markViews = Object.entries(view).filter(
            ([id]) => ctx.get(marksCtx).findIndex((ns) => ns[0] === id) !== -1,
        );
        ctx.update(nodeViewCtx, (v) => [...v, ...(nodeViews as [string, NodeViewConstructor][])]);
        ctx.update(markViewCtx, (v) => [...v, ...(markViews as [string, MarkViewConstructor][])]);

        await next();
    };
