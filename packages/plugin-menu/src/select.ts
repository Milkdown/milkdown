/* Copyright 2021, Milkdown by Mirone. */

import {
    CmdKey,
    Color,
    commandsCtx,
    Ctx,
    ThemeBorder,
    ThemeColor,
    ThemeIcon,
    ThemeShadow,
    ThemeSize,
} from '@milkdown/core';
import { EditorView } from '@milkdown/prose/view';
import { Utils } from '@milkdown/utils';

import type { CommonConfig } from './default-config';

type SelectOptions = {
    id: string;
    text: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SelectConfig<T = any> = {
    type: 'select';
    text: string;
    options: SelectOptions[];
    active?: (view: EditorView) => string;
    onSelect: (id: string, view: EditorView) => [key: CmdKey<T> | string, payload?: T];
} & CommonConfig;

export const select = (utils: Utils, config: SelectConfig, ctx: Ctx, view: EditorView) => {
    const selectorWrapper = document.createElement('div');
    selectorWrapper.classList.add('menu-selector-wrapper', 'fold');

    const selector = document.createElement('button');
    selector.setAttribute('type', 'button');
    selector.classList.add('menu-selector', 'fold');
    selector.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        selectorWrapper.classList.toggle('fold');
        selectorList.style.left = `${
            selectorWrapper.getBoundingClientRect().left - (view.dom.parentElement?.getBoundingClientRect().left || 0)
        }px`;
    });
    view.dom.addEventListener('click', () => {
        selectorWrapper.classList.add('fold');
    });

    const selectorValue = document.createElement('span');
    selectorValue.classList.add('menu-selector-value');
    selectorValue.textContent = config.text;

    const selectorButton = utils.themeManager.get(ThemeIcon, 'downArrow')?.dom;

    selectorWrapper.appendChild(selector);
    selector.appendChild(selectorValue);
    if (selectorButton) {
        selectorButton.setAttribute('aria-hidden', 'true');
        selector.appendChild(selectorButton);
    }

    const selectorList = document.createElement('div');
    selectorList.classList.add('menu-selector-list');
    config.options.forEach((option) => {
        const selectorListItem = document.createElement('button');
        selectorListItem.setAttribute('type', 'button');
        selectorListItem.dataset['id'] = option.id;
        selectorListItem.textContent = option.text;
        selectorListItem.classList.add('menu-selector-list-item');
        selectorList.appendChild(selectorListItem);
    });

    selectorList.addEventListener('mousedown', (e) => {
        const { target } = e;
        if (target instanceof HTMLButtonElement && target.dataset['id']) {
            const params = config.onSelect(target.dataset['id'], view);
            const [key, payload] = params;
            if (typeof key === 'string') {
                ctx.get(commandsCtx).call(key, payload);
            } else {
                ctx.get(commandsCtx).call(key, payload);
            }
            selectorWrapper.classList.add('fold');
        }
    });

    selectorWrapper.appendChild(selectorList);

    const { themeManager } = utils;
    themeManager.onFlush(() => {
        const selectStyle = utils.getStyle(({ css }) => {
            const palette = (color: Color, opacity = 1) => themeManager.get(ThemeColor, [color, opacity]);
            return css`
                flex-shrink: 0;
                font-weight: 500;
                font-size: 0.875em;

                ${themeManager.get(ThemeBorder, 'right')}
                ${themeManager.get(ThemeBorder, 'left')}

                .menu-selector {
                    border: 0;
                    box-sizing: unset;
                    cursor: pointer;
                    font: inherit;
                    text-align: left;
                    justify-content: space-between;
                    align-items: center;
                    color: ${palette('neutral', 0.87)};
                    display: flex;
                    padding: 0.25em;
                    margin: 0.5em;
                    height: 2em;
                    background: ${palette('secondary', 0.12)};
                    width: 10.375em;

                    &:disabled {
                        display: none;
                    }
                }

                .menu-selector-value {
                    flex: 1;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }

                .menu-selector-list {
                    width: 11.875em;
                    position: absolute;
                    background: ${palette('surface')};
                    ${themeManager.get(ThemeBorder, undefined)}
                    ${themeManager.get(ThemeShadow, undefined)}
                    border-bottom-left-radius: ${themeManager.get(ThemeSize, 'radius')};
                    border-bottom-right-radius: ${themeManager.get(ThemeSize, 'radius')};
                    z-index: 3;
                }

                .menu-selector-list-item {
                    background-color: transparent;
                    border: 0;
                    cursor: pointer;
                    display: block;
                    font: inherit;
                    text-align: left;
                    padding: 0.75em 1em;
                    line-height: 1.5em;
                    width: 100%;
                    color: ${palette('neutral', 0.87)};

                    &:hover {
                        background: ${palette('secondary', 0.12)};
                        color: ${palette('primary')};
                    }
                }

                &.fold {
                    border-color: transparent;

                    .menu-selector {
                        background: unset;
                    }

                    .menu-selector-list {
                        display: none;
                    }
                }
            `;
        });
        if (selectStyle) {
            selectorWrapper.classList.add(selectStyle);
        }
    });

    return selectorWrapper;
};
