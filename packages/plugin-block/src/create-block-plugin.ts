/* Copyright 2021, Milkdown by Mirone. */
import { Ctx } from '@milkdown/core';
import { Node } from '@milkdown/prose/model';
import { Plugin, PluginKey } from '@milkdown/prose/state';
import { Utils } from '@milkdown/utils';

import { BlockService } from './block-service';
import { ConfigBuilder } from './config';

export type FilterNodes = (node: Node) => boolean;
const milkdownPluginBlockKey = new PluginKey('MILKDOWN_BLOCK');

export const createBlockPlugin = (ctx: Ctx, utils: Utils, filterNodes: FilterNodes, configBuilder: ConfigBuilder) => {
    const blockHandle = new BlockService(ctx, utils, filterNodes, configBuilder);

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
                keydown: () => {
                    return blockHandle.keydownCallback();
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
