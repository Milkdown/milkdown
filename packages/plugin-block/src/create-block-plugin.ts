/* Copyright 2021, Milkdown by Mirone. */
import { Ctx, editorViewCtx } from '@milkdown/core';
import { missingRootElement } from '@milkdown/exception';
import { browser } from '@milkdown/prose';
import { Node } from '@milkdown/prose/model';
import { NodeSelection, Plugin, PluginKey, Selection } from '@milkdown/prose/state';
import { Utils } from '@milkdown/utils';

import { createBlockHandle } from './create-block-handle';
import { removePossibleTable } from './remove-possible-table';
import { selectRootNodeByDom } from './select-node-by-dom';
import { serializeForClipboard } from './serialize-for-clipboard';

export type FilterNodes = (node: Node) => boolean;

const brokenClipboardAPI =
    (browser.ie && <number>browser.ie_version < 15) || (browser.ios && browser.webkit_version < 604);

export const createBlockPlugin = (ctx: Ctx, utils: Utils, filterNodes: FilterNodes) => {
    const blockHandle = createBlockHandle(utils);

    let dragging = false;
    let createSelection: () => null | Selection = () => null;

    blockHandle.addEventListener('mousedown', () => {
        // TODO: render dropdown list
    });
    blockHandle.addEventListener('mouseup', () => {
        dragging = false;
    });
    blockHandle.addEventListener('dragstart', (event) => {
        const selection = createSelection();
        // Align the behavior with https://github.com/ProseMirror/prosemirror-view/blob/master/src/input.ts#L608
        if (event.dataTransfer && selection) {
            const view = ctx.get(editorViewCtx);
            const slice = selection.content();
            event.dataTransfer.effectAllowed = 'copyMove';
            const { dom, text } = serializeForClipboard(view, slice);
            event.dataTransfer.clearData();
            event.dataTransfer.setData(brokenClipboardAPI ? 'Text' : 'text/html', dom.innerHTML);
            if (!brokenClipboardAPI) event.dataTransfer.setData('text/plain', text);
            view.dragging = {
                slice,
                move: true,
            };
        }
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
                drop: (view) => {
                    if (dragging) {
                        removePossibleTable(view);

                        dragging = false;
                    }
                    return false;
                },
                mousemove: (view, event) => {
                    if (!view.editable) return false;

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
                            view.focus();
                            return nodeSelection;
                        }
                        return null;
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
