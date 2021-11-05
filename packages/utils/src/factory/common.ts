/* Copyright 2021, Milkdown by Mirone. */
import {
    Attrs,
    CmdKey,
    commandsCtx,
    Ctx,
    inputRulesCtx,
    prosePluginsCtx,
    remarkPluginsCtx,
    themeToolCtx,
} from '@milkdown/core';
import { themeMustInstalled } from '@milkdown/exception';
import { keymap } from '@milkdown/prose';

import { AddMetadata, AnyFn, CommandConfig, CommonOptions, Methods, UnknownRecord, Utils } from '../types';

export const getClassName =
    (className: CommonOptions['className']) =>
    (attrs: Attrs, ...defaultValue: (string | null | undefined)[]): string => {
        const classList = className?.(attrs) ?? defaultValue;
        return Array.isArray(classList) ? classList.filter((x) => x).join(' ') : classList;
    };

export const createShortcut = <T>(commandKey: CmdKey<T>, defaultKey: string, args?: T) =>
    [commandKey, defaultKey, args] as CommandConfig<unknown>;

export const getUtils = <Options extends UnknownRecord>(ctx: Ctx, options?: Options): Utils => {
    try {
        const themeTool = ctx.get(themeToolCtx);

        return {
            getClassName: getClassName(options?.className as undefined),
            getStyle: (style) => (options?.headless ? '' : (style(themeTool) as string | undefined)),
            themeTool,
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
        const getKey = (key: Keys, defaultValue: string): string | string[] => {
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

export const addMetadata = <T extends AnyFn>(x: T) => {
    const fn: AddMetadata<T> = (...args) => {
        const result = x(...args);
        result.origin = fn;
        return result;
    };
    return fn;
};
