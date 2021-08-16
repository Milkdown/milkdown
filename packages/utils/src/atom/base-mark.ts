import { Attrs, Mark, markFactory, themeToolCtx } from '@milkdown/core';
import { UnknownRecord } from '../type-utility';
import { createKeymap } from './keymap';
import { MarkOptional, MarkOptions, Origin, PluginWithMetadata, Utils } from './types';

export const createMark = <SupportedKeys extends string = string, T extends UnknownRecord = UnknownRecord>(
    factory: (
        options: Partial<T & MarkOptions<SupportedKeys, T>> | undefined,
        utils: Utils,
    ) => Mark & MarkOptional<SupportedKeys>,
): Origin<'Mark', SupportedKeys, T> => {
    const origin: Origin<'Mark', SupportedKeys, T> = (options) => {
        const getClassName = (attrs: Attrs, ...defaultValue: (string | null)[]) => {
            const classList = options?.className?.(attrs) ?? defaultValue;
            return Array.isArray(classList) ? classList.filter((x) => x).join(' ') : classList;
        };

        const plugin: PluginWithMetadata<'Mark', SupportedKeys, T> = markFactory((ctx) => {
            const themeTool = ctx.get(themeToolCtx);
            const node = factory(options, {
                getClassName,
                themeTool,
            });
            const keymap = createKeymap(node.shortcuts, options?.keymap);
            return {
                ...node,
                keymap,
                view: options?.view,
            };
        }) as PluginWithMetadata<'Mark', SupportedKeys, T>;
        plugin.origin = origin;

        return plugin;
    };

    return origin;
};
