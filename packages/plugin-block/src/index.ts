/* Copyright 2021, Milkdown by Mirone. */
import { AtomList, createPlugin } from '@milkdown/utils';

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
};
export const blockPlugin = createPlugin<string, Options>((utils, options) => {
    const filterNodes = options?.filterNodes ?? defaultNodeFilter;

    return {
        prosePlugins: (_, ctx) => {
            return [createBlockPlugin(ctx, utils, filterNodes)];
        },
    };
});

export const block: AtomList = AtomList.create([blockPlugin()]);
