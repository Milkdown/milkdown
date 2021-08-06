import { Attrs, Mark, markFactory } from '@milkdown/core';
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
        const getClassName = (attrs: Attrs, defaultValue: string) => options?.className?.(attrs) ?? defaultValue;
        const node = factory(options, {
            getClassName,
        });
        const keymap = createKeymap(node.shortcuts, options?.keymap);

        const plugin: PluginWithMetadata<'Mark', SupportedKeys, T> = markFactory({
            ...node,
            keymap,
            view: options?.view,
        }) as PluginWithMetadata<'Mark', SupportedKeys, T>;
        plugin.origin = origin;

        return plugin;
    };

    return origin;
};
