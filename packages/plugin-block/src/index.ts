/* Copyright 2021, Milkdown by Mirone. */
import { AtomList, createPlugin } from '@milkdown/utils';

import { ConfigBuilder, defaultConfigBuilder } from './config';
import { createBlockPlugin, FilterNodes } from './create-block-plugin';

export const defaultNodeFilter: FilterNodes = (node) => {
    const { name } = node.type;
    if (name.startsWith('table') && name !== 'table') {
        return false;
    }
    return true;
};

type Options = {
    filterNodes: FilterNodes;
    configBuilder: ConfigBuilder;
};
export const blockPlugin = createPlugin<string, Options>((utils, options) => {
    const filterNodes = options?.filterNodes ?? defaultNodeFilter;
    const configBuilder = options?.configBuilder ?? defaultConfigBuilder;

    return {
        prosePlugins: (_, ctx) => {
            return [createBlockPlugin(ctx, utils, filterNodes, configBuilder)];
        },
    };
});

export const block: AtomList = AtomList.create([blockPlugin()]);
