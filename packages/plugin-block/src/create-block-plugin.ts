/* Copyright 2021, Milkdown by Mirone. */
import { missingRootElement } from '@milkdown/exception';
import { Node } from '@milkdown/prose/model';
import { Plugin, PluginKey } from '@milkdown/prose/state';
import { Utils } from '@milkdown/utils';

import { createBlockHandle } from './create-block-handle';
import { selectRootNodeByDom } from './select-node-by-dom';

export type FilterNodes = (node: Node) => boolean;

export const createBlockPlugin = (filterNodes: FilterNodes, utils: Utils) => {
    const blockHandle = createBlockHandle(utils);

    const hide = () => blockHandle.classList.add('hide');
    const show = () => blockHandle.classList.remove('hide');

    return new Plugin({
        key: new PluginKey('block'),
        props: {
            handleDOMEvents: {
                mouseover: (view, event) => {
                    const root = view.dom.parentElement;
                    if (!root) {
                        throw missingRootElement();
                    }
                    const dom = event.target;
                    if (!(dom instanceof Element)) {
                        hide();
                        return false;
                    }

                    const result = selectRootNodeByDom(dom, view, filterNodes);

                    if (!result) {
                        hide();
                        return false;
                    }

                    const { $pos } = result;

                    show();

                    const { node } = view.domAtPos($pos.pos);

                    let el: HTMLElement = node as HTMLElement;
                    let parent = el.parentElement;
                    console.log($pos.pos);
                    while (parent && parent !== root && $pos.pos === view.posAtDOM(parent, 0)) {
                        el = parent;
                        console.log(view.posAtDOM(parent, 0));
                        parent = parent.parentElement;
                    }

                    console.log(el);

                    const targetNodeRect = (<HTMLElement>el).getBoundingClientRect();
                    const rootRect = root.getBoundingClientRect();
                    const handleRect = blockHandle.getBoundingClientRect();

                    const left = targetNodeRect.left - rootRect.left - handleRect.width;
                    const top = targetNodeRect.top - rootRect.top + root.scrollTop;

                    blockHandle.style.left = `${left}px`;
                    blockHandle.style.top = `${top}px`;

                    return false;
                },
            },
        },
        view: (view) => {
            view.dom.parentNode?.appendChild(blockHandle);
            return {
                // update: (view) => {},
                destroy: () => {
                    blockHandle.remove();
                },
            };
        },
    });
};
