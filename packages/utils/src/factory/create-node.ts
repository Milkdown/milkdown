/* Copyright 2021, Milkdown by Mirone. */
import { Node, nodeFactory } from '@milkdown/core';

import { ExtendFactory, Factory, Origin, PluginWithMetadata, UnknownRecord } from '../types';
import { commonPlugin } from './common';
import { createKeymap } from './keymap';

export const createNode = <SupportedKeys extends string = string, T extends UnknownRecord = UnknownRecord>(
    factory: Factory<SupportedKeys, T, Node>,
): Origin<SupportedKeys, T, Node> => {
    const origin: Origin<SupportedKeys, T, Node> = (options) => {
        const plugin = nodeFactory((ctx) => {
            const node = commonPlugin(factory, ctx, options);
            const view = options?.view ?? node.view;
            const keymap = createKeymap(node.shortcuts, options?.keymap);
            plugin.id = node.id;

            return {
                ...node,
                view,
                keymap,
            };
        }) as PluginWithMetadata<SupportedKeys, T, Node>;
        plugin.origin = origin;

        return plugin;
    };
    origin.extend = <SupportedKeysExtended extends SupportedKeys = SupportedKeys, ObjExtended extends T = T>(
        extendFactory: ExtendFactory<SupportedKeys, SupportedKeysExtended, ObjExtended, Node>,
    ) => {
        return createNode<SupportedKeysExtended, ObjExtended>((options, utils) => {
            const original = factory(options as T, utils);
            return extendFactory(options, utils, original);
        });
    };

    return origin;
};
