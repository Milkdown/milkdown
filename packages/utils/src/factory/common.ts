/* Copyright 2021, Milkdown by Mirone. */
import {
    Attrs,
    CmdKey,
    commandsCtx,
    Ctx,
    emotionCtx,
    InitReady,
    inputRulesCtx,
    prosePluginsCtx,
    remarkPluginsCtx,
    Slice,
    themeManagerCtx,
} from '@milkdown/core';
import { themeMustInstalled } from '@milkdown/exception';
import { keymap } from '@milkdown/prose/keymap';

import {
    AddMetadata,
    CommandConfig,
    CommonOptions,
    Factory,
    GetPlugin,
    Methods,
    UnknownRecord,
    Utils,
    WithExtend,
} from '../types';

export const getClassName =
    (className: CommonOptions['className']) =>
    (attrs: Attrs, ...defaultValue: (string | null | undefined)[]): string => {
        const classList = className?.(attrs, ...defaultValue) ?? defaultValue;
        return Array.isArray(classList) ? classList.filter((x) => x).join(' ') : classList;
    };

export const createShortcut = <T>(commandKey: CmdKey<T>, defaultKey: string | string[], args?: T) =>
    [commandKey, defaultKey, args] as CommandConfig<unknown>;

export const getUtils = <Options extends UnknownRecord>(ctx: Ctx, options?: Options): Utils => {
    try {
        const themeManager = ctx.get(themeManagerCtx);
        const emotion = ctx.get(emotionCtx);
        if (!emotion.css) {
            throw themeMustInstalled();
        }

        return {
            getClassName: getClassName(options?.['className'] as undefined),
            getStyle: (style) => (options?.['headless'] ? '' : (style(emotion) as string | undefined)),
            themeManager,
        };
    } catch {
        throw themeMustInstalled();
    }
};

export const applyMethods = async <Keys extends string, Type, Options extends UnknownRecord>(
    ctx: Ctx,
    plugin: Methods<Keys, Type>,
    getType: () => Promise<Type>,
    options?: Partial<CommonOptions<Keys, Options>>,
): Promise<void> => {
    await ctx.wait(InitReady);

    if (plugin.remarkPlugins) {
        const remarkPlugins = plugin.remarkPlugins(ctx);
        ctx.update(remarkPluginsCtx, (ps) => [...ps, ...remarkPlugins]);
    }

    const type = await getType();

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
        const getKey = (key: Keys, defaultValue: string | string[]): string | string[] => {
            return options?.keymap?.[key] ?? defaultValue;
        };

        const tuples = Object.entries<CommandConfig>(plugin.shortcuts)
            .flatMap(([id, [commandKey, defaultKey, args]]) => {
                const runner = () => ctx.get(commandsCtx).call(commandKey, args);
                const key = getKey(id as Keys, defaultKey);
                if (Array.isArray(key)) {
                    return key.map((k) => ({ key: k, runner }));
                }
                return { key, runner };
            })
            .map((x) => [x.key, x.runner] as [string, () => boolean]);
        ctx.update(prosePluginsCtx, (ps) => ps.concat(keymap(Object.fromEntries(tuples))));
    }

    if (plugin.prosePlugins) {
        const prosePlugins = plugin.prosePlugins(type, ctx);
        ctx.update(prosePluginsCtx, (ps) => [...ps, ...prosePlugins]);
    }
};

export const addMetadata = <SupportedKeys extends string = string, Options extends UnknownRecord = UnknownRecord>(
    x: GetPlugin<SupportedKeys, Options>,
): AddMetadata<SupportedKeys, Options> => {
    const fn: AddMetadata<SupportedKeys, Options> = (options) => {
        const result = x(options) as ReturnType<AddMetadata<SupportedKeys, Options>>;
        result.origin = fn;
        return result;
    };
    return fn;
};

export const withExtend = <SupportedKeys extends string, Options extends UnknownRecord, Type, Rest>(
    factory: Factory<SupportedKeys, Options, Type, Rest>,
    origin: AddMetadata<SupportedKeys, Options>,
    creator: (
        factory: Factory<SupportedKeys, Options, Type, Rest>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        inject?: Slice<any>[],
    ) => WithExtend<SupportedKeys, Options, Type, Rest>,
): WithExtend<SupportedKeys, Options, Type, Rest> => {
    type Ext = WithExtend<SupportedKeys, Options, Type, Rest>;
    const next = origin as Ext;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extend = (extendFactory: Parameters<Ext['extend']>[0], inject?: Slice<any>[]) =>
        creator((...args) => extendFactory(factory(...args), ...args), inject);

    next.extend = extend as Ext['extend'];

    return next;
};
