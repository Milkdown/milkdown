/* Copyright 2021, Milkdown by Mirone. */
import { missingRootElement } from '@milkdown/exception';
import { Node } from '@milkdown/prose/model';
import { NodeSelection, Plugin, PluginKey } from '@milkdown/prose/state';
import { Utils } from '@milkdown/utils';

import { createBlockHandle } from './create-block-handle';
import { selectRootNodeByDom } from './select-node-by-dom';

export type FilterNodes = (node: Node) => boolean;

export const createBlockPlugin = (filterNodes: FilterNodes, utils: Utils) => {
    let dragging = false;
    const blockHandle = createBlockHandle(utils);
    let createSelection = () => {
        // noop
    };

    blockHandle.addEventListener('mousedown', () => {
        dragging = true;
        createSelection();
    });
    blockHandle.addEventListener('mouseup', () => {
        dragging = false;
    });
    blockHandle.addEventListener('drag', () => {
        // TODO: handle drag
    });

    const hide = () => {
        if (dragging) return;
        blockHandle.classList.add('hide');
    };
    const show = () => blockHandle.classList.remove('hide');
    // const isShow = () => !blockHandle.classList.contains('hide');

    return new Plugin({
        key: new PluginKey('MILKDOWN_BLOCK'),
        props: {
            handleDOMEvents: {
                mousemove: (view, event) => {
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

                    const { $pos, node: pmNode } = result;

                    show();

                    const { node } = view.domAtPos($pos.pos);

                    let el: HTMLElement = node as HTMLElement;
                    let parent = el.parentElement;
                    while (parent && parent !== root && $pos.pos === view.posAtDOM(parent, 0)) {
                        el = parent;
                        parent = parent.parentElement;
                    }

                    const targetNodeRect = (<HTMLElement>el).getBoundingClientRect();
                    const rootRect = root.getBoundingClientRect();
                    const handleRect = blockHandle.getBoundingClientRect();

                    const left = targetNodeRect.left - rootRect.left - handleRect.width;
                    const top = targetNodeRect.top - rootRect.top + root.scrollTop;

                    blockHandle.style.left = `${left}px`;
                    blockHandle.style.top = `${top}px`;

                    createSelection = () => {
                        if (NodeSelection.isSelectable(pmNode)) {
                            const nodeSelection = NodeSelection.create(view.state.doc, $pos.pos - 1);
                            view.dispatch(view.state.tr.setSelection(nodeSelection));
                            window.requestAnimationFrame(() => {
                                view.focus();
                            });
                        }
                    };

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
