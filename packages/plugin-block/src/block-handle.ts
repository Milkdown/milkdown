/* Copyright 2021, Milkdown by Mirone. */

import { Ctx, editorViewCtx, getPalette, ThemeIcon, ThemeSize } from '@milkdown/core';
import { missingRootElement } from '@milkdown/exception';
import { browser } from '@milkdown/prose';
import { ResolvedPos } from '@milkdown/prose/model';
import { NodeSelection, Selection } from '@milkdown/prose/state';
import { EditorView } from '@milkdown/prose/view';
import { Utils } from '@milkdown/utils';

import { FilterNodes } from './create-block-plugin';
import { getDOMByPos } from './get-dom-by-pos';
import { removePossibleTable } from './remove-possible-table';
import { selectRootNodeByDom } from './select-node-by-dom';
import { serializeForClipboard } from './serialize-for-clipboard';

const brokenClipboardAPI =
    (browser.ie && <number>browser.ie_version < 15) || (browser.ios && browser.webkit_version < 604);

export class BlockHandle {
    readonly dom: HTMLElement;
    #createSelection: () => null | Selection = () => null;

    #dragging = false;
    #utils: Utils;
    #ctx: Ctx;
    #filterNodes: FilterNodes;
    constructor(ctx: Ctx, utils: Utils, filterNodes: FilterNodes) {
        this.#utils = utils;
        this.#ctx = ctx;
        this.#filterNodes = filterNodes;
        this.dom = this.#createDom();
    }

    mount(view: EditorView) {
        this.dom.addEventListener('mousedown', this.mouseDown);
        this.dom.addEventListener('mouseup', this.mouseUp);
        this.dom.addEventListener('dragstart', this.dragStart);
        view.dom.parentNode?.appendChild(this.dom);
    }

    unmount() {
        this.dom.removeEventListener('mousedown', this.mouseDown);
        this.dom.removeEventListener('mouseup', this.mouseUp);
        this.dom.removeEventListener('dragstart', this.dragStart);
        this.dom.remove();
    }

    mouseDown = () => {
        this.#dragging = true;
    };

    mouseUp = () => {
        this.#dragging = false;
        this.#createSelection = () => null;
    };

    dragStart = (event: DragEvent) => {
        const selection = this.#createSelection();
        const ctx = this.#ctx;

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
    };

    mousemoveCallback = (view: EditorView, event: MouseEvent) => {
        if (!view.editable) return false;

        const dom = event.target;
        if (!(dom instanceof Element)) {
            this.#hide();
            return false;
        }

        const result = selectRootNodeByDom(dom, view, this.#filterNodes);

        if (!result) {
            this.#hide();
            return false;
        }

        this.#show();
        this.#renderBlockHandle(view, result.$pos);
        this.#createSelection = () => {
            if (NodeSelection.isSelectable(result.node)) {
                const nodeSelection = NodeSelection.create(view.state.doc, result.$pos.pos - 1);
                view.dispatch(view.state.tr.setSelection(nodeSelection));
                view.focus();
                return nodeSelection;
            }
            return null;
        };

        return false;
    };

    dropCallback = (view: EditorView, _event: MouseEvent) => {
        if (this.#dragging) {
            const event = _event as DragEvent;
            const tr = removePossibleTable(view, event);

            this.#dragging = false;

            if (tr) {
                view.dispatch(tr);

                event.preventDefault();

                return true;
            }
        }
        return false;
    };

    #hide() {
        if (this.#dragging) return;
        this.dom.classList.add('hide');
    }

    #show() {
        this.dom.classList.remove('hide');
    }

    #renderBlockHandle(view: EditorView, $pos: ResolvedPos) {
        const root = view.dom.parentElement;
        if (!root) {
            throw missingRootElement();
        }
        const el = getDOMByPos(view, root, $pos);

        const targetNodeRect = (<HTMLElement>el).getBoundingClientRect();
        const rootRect = root.getBoundingClientRect();
        const handleRect = this.dom.getBoundingClientRect();

        const left = targetNodeRect.left - rootRect.left - handleRect.width;
        const top = targetNodeRect.top - rootRect.top + root.scrollTop;

        this.dom.style.left = `${left}px`;
        this.dom.style.top = `${top}px`;
    }

    #createDom() {
        const { themeManager, getStyle } = this.#utils;
        const dom = document.createElement('div');
        dom.draggable = true;
        const icon = themeManager.get(ThemeIcon, 'dragHandle');

        dom.appendChild(icon.dom);
        themeManager.onFlush(() => {
            if (!dom) return;

            const style = getStyle(({ css }) => {
                const palette = getPalette(themeManager);
                return css`
                    position: absolute;
                    color: ${palette('solid')};
                    cursor: grab;
                    border-radius: ${themeManager.get(ThemeSize, 'radius')};
                    transition: background-color 0.4s;
                    height: 24px;
                    line-height: 24px;
                    &:hover {
                        color: ${palette('primary')};
                        background-color: ${palette('background')};
                    }
                    &.hide {
                        display: none;
                    }
                `;
            });

            if (style) {
                const className = ['block-handle', style, 'hide'].filter((x): x is string => x != null).join(' ');
                dom.className = className;
            }
        });

        return dom;
    }
}
