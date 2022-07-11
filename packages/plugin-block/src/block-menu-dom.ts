/* Copyright 2021, Milkdown by Mirone. */

import { getPalette, ThemeShadow } from '@milkdown/core';
import { missingRootElement } from '@milkdown/exception';
import { EditorView } from '@milkdown/prose/view';
import { Utils } from '@milkdown/utils';

export class BlockMenuDOM {
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
                    cursor: pointer;
                    ${themeManager.get(ThemeShadow, undefined)};
                    background: ${palette('surface')};
                    z-index: 2;

                    // TODO: remove this
                    width: 50px;
                    // TODO: remove this
                    height: 50px;

                    &.hide {
                        display: none;
                    }
                `;
            });

            if (style) {
                const className = ['block-menu', style, 'hide'].filter((x): x is string => x != null).join(' ');
                this.dom$.className = className;
            }
        });
    }

    #createDOM() {
        const dom = document.createElement('div');

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

    render(view: EditorView, el: HTMLElement, handle: HTMLElement) {
        const root = view.dom.parentElement;
        if (!root) {
            throw missingRootElement();
        }

        const targetNodeRect = (<HTMLElement>el).getBoundingClientRect();
        const rootRect = root.getBoundingClientRect();
        const handleRect = handle.getBoundingClientRect();

        const left = targetNodeRect.left - rootRect.left - handleRect.width;
        const top = targetNodeRect.top - rootRect.top + root.scrollTop + handleRect.height;

        this.dom$.style.left = `${left}px`;
        this.dom$.style.top = `${top}px`;
    }
}
