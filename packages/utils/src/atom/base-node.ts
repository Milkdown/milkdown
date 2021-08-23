import { Node, nodeFactory } from '@milkdown/core';
import { UnknownRecord } from '../type-utility';
import { commonPlugin } from './base-common';
import { Factory, Origin, PluginWithMetadata } from './types';

export const createNode = <SupportedKeys extends string = string, T extends UnknownRecord = UnknownRecord>(
    factory: Factory<SupportedKeys, T, Node>,
): Origin<Node, SupportedKeys, T> => {
    const origin: Origin<Node, SupportedKeys, T> = (options) => {
        const plugin = nodeFactory((ctx) => commonPlugin(factory, ctx, options)) as PluginWithMetadata<
            Node,
            SupportedKeys,
            T
        >;
        plugin.origin = origin;

        return plugin;
    };

    return origin;
};
