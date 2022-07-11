/* Copyright 2021, Milkdown by Mirone. */
import { Ctx } from '@milkdown/core';
import { Node } from '@milkdown/prose/model';
import { Plugin, PluginKey } from '@milkdown/prose/state';
import { Utils } from '@milkdown/utils';

import { BlockService } from './block-service';

export type FilterNodes = (node: Node) => boolean;
const milkdownPluginBlockKey = new PluginKey('MILKDOWN_BLOCK');

export const createBlockPlugin = (ctx: Ctx, utils: Utils, filterNodes: FilterNodes) => {
    const blockHandle = new BlockService(ctx, utils, filterNodes);

    return new Plugin({
        key: milkdownPluginBlockKey,
        props: {
            handleDOMEvents: {
                drop: (view, event) => {
                    return blockHandle.dropCallback(view, event as DragEvent);
                },
                mousemove: (view, event) => {
                    return blockHandle.mousemoveCallback(view, event as MouseEvent);
                },
                mousedown: () => {
                    return blockHandle.mousedownCallback();
                },
            },
        },
        view: (view) => {
            blockHandle.mount(view);
            return {
                destroy: () => {
                    blockHandle.unmount();
                },
            };
        },
    });
};
