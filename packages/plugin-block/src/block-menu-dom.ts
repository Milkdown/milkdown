/* Copyright 2021, Milkdown by Mirone. */

import { getPalette, ThemeShadow } from '@milkdown/core';
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

                    width: 50px;
                    height: 50px;

                    &.hide {
                        display: none;
                    }
                `;
            });

            if (style) {
                const className = ['block-dropdown-menu', style, 'hide']
                    .filter((x): x is string => x != null)
                    .join(' ');
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
}
