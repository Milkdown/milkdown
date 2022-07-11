/* Copyright 2021, Milkdown by Mirone. */

import { getPalette, ThemeIcon, ThemeSize } from '@milkdown/core';
import { missingRootElement } from '@milkdown/exception';
import { ResolvedPos } from '@milkdown/prose/model';
import { EditorView } from '@milkdown/prose/view';
import { Utils } from '@milkdown/utils';

import { getDOMByPos } from './get-dom-by-pos';

export class BlockHandleDOM {
    readonly dom$: HTMLElement;

    #utils: Utils;
    constructor(utils: Utils) {
        this.#utils = utils;
        this.dom$ = this.#createDOM();
        this.#injectStyle();
    }

    #injectStyle() {
        const { themeManager, getStyle } = this.#utils;
        themeManager.onFlush(() => {
            if (!this.dom$) return;

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
                this.dom$.className = className;
            }
        });
    }

    #createDOM() {
        const { themeManager } = this.#utils;
        const dom = document.createElement('div');
        dom.draggable = true;
        const icon = themeManager.get(ThemeIcon, 'dragHandle');

        dom.appendChild(icon.dom);

        return dom;
    }

    hide() {
        this.dom$.classList.add('hide');
    }

    show() {
        this.dom$.classList.remove('hide');
    }

    mount(view: EditorView) {
        view.dom.parentNode?.appendChild(this.dom$);
    }

    unmount() {
        this.dom$.remove();
    }

    render(view: EditorView, $pos: ResolvedPos) {
        const root = view.dom.parentElement;
        if (!root) {
            throw missingRootElement();
        }
        const el = getDOMByPos(view, root, $pos);

        const targetNodeRect = (<HTMLElement>el).getBoundingClientRect();
        const rootRect = root.getBoundingClientRect();
        const handleRect = this.dom$.getBoundingClientRect();

        const left = targetNodeRect.left - rootRect.left - handleRect.width;
        const top = targetNodeRect.top - rootRect.top + root.scrollTop;

        this.dom$.style.left = `${left}px`;
        this.dom$.style.top = `${top}px`;
    }
}
