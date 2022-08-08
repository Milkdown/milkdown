/* Copyright 2021, Milkdown by Mirone. */

import { Ctx, editorViewCtx } from '@milkdown/core';
import { browser } from '@milkdown/prose';
import { NodeSelection, Selection } from '@milkdown/prose/state';
import { EditorView } from '@milkdown/prose/view';
import { ThemeUtils } from '@milkdown/utils';

import { BlockHandleDOM } from './block-handle-dom';
import { BlockMenuDOM } from './block-menu-dom';
import { ConfigBuilder } from './config';
import { FilterNodes } from './create-block-plugin';
import { removePossibleTable } from './remove-possible-table';
import { ActiveNode, selectRootNodeByDom } from './select-node-by-dom';
import { serializeForClipboard } from './serialize-for-clipboard';

const brokenClipboardAPI =
    (browser.ie && <number>browser.ie_version < 15) || (browser.ios && browser.webkit_version < 604);

export class BlockService {
    readonly blockHandle$: BlockHandleDOM;
    readonly blockMenu$: BlockMenuDOM;

    #createSelection: () => null | Selection = () => {
        if (!this.#active) return null;
        const result = this.#active;
        const view = this.#view;

        if (NodeSelection.isSelectable(result.node)) {
            const nodeSelection = NodeSelection.create(view.state.doc, result.$pos.pos - 1);
            view.dispatch(view.state.tr.setSelection(nodeSelection));
            view.focus();
            this.#activeSelection = nodeSelection;
            return nodeSelection;
        }
        return null;
    };
    #activeSelection: null | Selection = null;
    #active: null | ActiveNode = null;

    #dragging = false;
    #ctx: Ctx;
    #filterNodes: FilterNodes;

    get #view() {
        return this.#ctx.get(editorViewCtx);
    }

    constructor(ctx: Ctx, utils: ThemeUtils, filterNodes: FilterNodes, configBuilder: ConfigBuilder) {
        this.#ctx = ctx;
        this.#filterNodes = filterNodes;
        this.blockHandle$ = new BlockHandleDOM(utils);
        this.blockMenu$ = new BlockMenuDOM(utils, ctx, configBuilder, this.blockHandle$, () => this.#active);
    }

    mount(view: EditorView) {
        this.blockHandle$.dom$.addEventListener('mousedown', this.#handleMouseDown);
        this.blockHandle$.dom$.addEventListener('mouseup', this.#handleMouseUp);
        this.blockHandle$.dom$.addEventListener('dragstart', this.#handleDragStart);
        this.blockHandle$.mount(view);
        this.blockMenu$.mount(view);
    }

    unmount() {
        this.blockHandle$.dom$.removeEventListener('mousedown', this.#handleMouseDown);
        this.blockHandle$.dom$.removeEventListener('mouseup', this.#handleMouseUp);
        this.blockHandle$.dom$.removeEventListener('dragstart', this.#handleDragStart);
        this.blockHandle$.unmount();
        this.blockMenu$.unmount();
    }

    #handleMouseDown = () => {
        this.#createSelection();
    };

    #handleMouseUp = () => {
        if (!this.#dragging) {
            requestAnimationFrame(() => {
                if (!this.#active) return;
                this.blockMenu$.toggle();
                this.blockMenu$.render(this.#view, this.#active.el);
                this.#view.focus();
            });

            return;
        }
        this.#dragging = false;
        this.#activeSelection = null;
    };

    #handleDragStart = (event: DragEvent) => {
        this.#dragging = true;
        const selection = this.#activeSelection;

        // Align the behavior with https://github.com/ProseMirror/prosemirror-view/blob/master/src/input.ts#L608
        if (event.dataTransfer && selection) {
            const view = this.#view;
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

    keydownCallback = () => {
        this.blockMenu$.hide();
        this.blockHandle$.hide();
        return false;
    };

    mousedownCallback = () => {
        this.blockMenu$.hide();
        return false;
    };

    mousemoveCallback = (view: EditorView, event: MouseEvent) => {
        if (!view.editable) return false;

        const dom = event.target;
        if (!(dom instanceof Element)) {
            if (this.#dragging) return false;
            this.blockHandle$.hide();
            return false;
        }

        const result = selectRootNodeByDom(dom, view, this.#filterNodes);
        this.#active = result;

        if (!result) {
            if (this.#dragging) return false;
            this.blockHandle$.hide();
            return false;
        }

        this.blockHandle$.show();
        this.blockHandle$.render(view, result.el);

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
}
