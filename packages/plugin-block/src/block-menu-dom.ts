/* Copyright 2021, Milkdown by Mirone. */

import { Ctx, getPalette, ThemeBorder, ThemeIcon, ThemeShadow, ThemeSize } from '@milkdown/core';
import { missingRootElement } from '@milkdown/exception';
import { EditorView } from '@milkdown/prose/view';
import { ThemeUtils } from '@milkdown/utils';

import { BlockHandleDOM } from './block-handle-dom';
import { BlockAction, ConfigBuilder } from './config';
import { ActiveNode } from './select-node-by-dom';

export class BlockMenuDOM {
    readonly dom$: HTMLElement;

    #utils: ThemeUtils;
    #ctx: Ctx;
    #configBuilder: ConfigBuilder;
    #config: BlockAction[];
    #blockHandle: BlockHandleDOM;
    #getActive: () => null | ActiveNode;
    constructor(
        utils: ThemeUtils,
        ctx: Ctx,
        configBuilder: ConfigBuilder,
        blockHandle: BlockHandleDOM,
        getActive: () => null | ActiveNode,
    ) {
        this.#utils = utils;
        this.#ctx = ctx;
        this.#configBuilder = configBuilder;
        this.#blockHandle = blockHandle;
        this.#config = this.#configBuilder(this.#ctx);
        this.#getActive = getActive;
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
                    background: ${palette('surface')};
                    z-index: 2;
                    border-radius: ${themeManager.get(ThemeSize, 'radius')};
                    width: 140px;

                    ${themeManager.get(ThemeShadow, undefined)};
                    ${themeManager.get(ThemeBorder, undefined)}

                    &.hide {
                        display: none;
                    }

                    .block-menu_item {
                        font-size: 14px;
                        display: flex;
                        height: 24px;
                        padding: 4px 10px;
                        align-items: center;
                        justify-content: start;
                        gap: 10px;
                        transition: all 0.4s;

                        &:hover {
                            background: ${palette('secondary', 0.12)};
                            color: ${palette('primary')};
                        }

                        &.hide {
                            display: none;
                        }
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

        this.#config.forEach(({ icon, content, id }) => {
            const listItem = document.createElement('div');

            const textDOM = document.createElement('span');
            textDOM.textContent = content;

            let iconDOM: HTMLElement;
            if (typeof icon === 'string') {
                const iconValue = this.#utils.themeManager.get(ThemeIcon, icon);
                iconDOM = iconValue.dom;
            } else {
                iconDOM = icon;
            }

            listItem.appendChild(iconDOM);
            listItem.appendChild(textDOM);
            listItem.dataset['id'] = id;
            listItem.classList.add('block-menu_item');

            dom.appendChild(listItem);
        });

        return dom;
    }

    #clickMenu = (e: MouseEvent) => {
        let dom: HTMLElement = e.target as HTMLElement;
        while (dom && !dom.dataset['id'] && dom.parentElement) {
            dom = dom.parentElement;
        }
        if (dom) {
            const id = dom.dataset['id'];
            const action = this.#config.find((x) => x.id === id);

            const active = this.#getActive();
            if (active) {
                action?.command(this.#ctx, active);
            }
        }

        this.#blockHandle.hide();
        this.hide();
    };

    hide() {
        this.dom$.classList.add('hide');
    }

    show() {
        this.dom$.classList.remove('hide');
    }

    toggle() {
        this.dom$.classList.toggle('hide');
    }

    mount(view: EditorView) {
        view.dom.parentNode?.appendChild(this.dom$);
        this.dom$.addEventListener('click', this.#clickMenu);
    }

    unmount() {
        this.dom$.remove();
        this.dom$.removeEventListener('click', this.#clickMenu);
    }

    render(view: EditorView, el: HTMLElement) {
        const root = view.dom.parentElement;
        if (!root) {
            throw missingRootElement();
        }

        const noActiveAction = this.#config.reduce((noActive, { disabled, id }) => {
            const active = this.#getActive();
            if (!active) return noActive;
            const isDisabled = disabled(this.#ctx, active);

            const dom = this.dom$.querySelector(`[data-id="${id}"]`);
            if (!dom) return noActive;

            if (isDisabled) {
                dom.classList.add('hide');
                return noActive;
            }

            dom.classList.remove('hide');
            return false;
        }, true);
        if (noActiveAction) {
            this.hide();
            return;
        }

        const targetNodeRect = (<HTMLElement>el).getBoundingClientRect();
        const rootRect = root.getBoundingClientRect();
        const handleRect = this.#blockHandle.dom$.getBoundingClientRect();
        const menuRect = this.dom$.getBoundingClientRect();

        const left = targetNodeRect.left - rootRect.left - handleRect.width;
        let top = targetNodeRect.top - rootRect.top + root.scrollTop + handleRect.height;

        if (rootRect.height + rootRect.top - targetNodeRect.bottom < menuRect.height) {
            const topOffset = targetNodeRect.top - rootRect.top - menuRect.height + root.scrollTop;
            if (topOffset > 0) {
                top = topOffset;
            }
        }

        this.dom$.style.left = `${left}px`;
        this.dom$.style.top = `${top}px`;
    }
}
