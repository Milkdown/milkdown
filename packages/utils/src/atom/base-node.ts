import { Attrs, Node, nodeFactory, themeToolCtx } from '@milkdown/core';
import { UnknownRecord } from '../type-utility';
import { createKeymap } from './keymap';
import { NodeOptional, NodeOptions, Origin, PluginWithMetadata, Utils } from './types';

export const createNode = <SupportedKeys extends string = string, T extends UnknownRecord = UnknownRecord>(
    factory: (
        options: Partial<T & NodeOptions<SupportedKeys, T>> | undefined,
        utils: Utils,
    ) => Node & NodeOptional<SupportedKeys>,
): Origin<'Node', SupportedKeys, T> => {
    const origin: Origin<'Node', SupportedKeys, T> = (options) => {
        const getClassName = (attrs: Attrs, ...defaultValue: (string | null)[]) => {
            const classList = options?.className?.(attrs) ?? defaultValue;
            return Array.isArray(classList) ? classList.filter((x) => x).join(' ') : classList;
        };

        const plugin: PluginWithMetadata<'Node', SupportedKeys, T> = nodeFactory((ctx) => {
            const themeTool = ctx.get(themeToolCtx);
            const node = factory(options, {
                getClassName,
                themeTool,
            });
            const view = options?.view ?? node.view;
            const keymap = createKeymap(node.shortcuts, options?.keymap);
            return {
                ...node,
                view,
                keymap,
            };
        }) as PluginWithMetadata<'Node', SupportedKeys, T>;
        plugin.origin = origin;

        return plugin;
    };

    return origin;
};
