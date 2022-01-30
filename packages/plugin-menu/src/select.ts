/* Copyright 2021, Milkdown by Mirone. */

import { CmdKey, commandsCtx, Ctx } from '@milkdown/core';
import { EditorView } from '@milkdown/prose';
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
    onSelect: (id: string, view: EditorView) => [key: CmdKey<T> | string, info?: T];
} & CommonConfig;

export const select = (utils: Utils, config: SelectConfig, ctx: Ctx, view: EditorView) => {
    const selectStyle = utils.getStyle((themeTool, { css }) => {
        return css`
            flex-shrink: 0;
            font-weight: 500;
            font-size: 0.875rem;

            ${themeTool.mixin.border('right')};
            ${themeTool.mixin.border('left')};

            .menu-selector {
                border: 0;
                box-sizing: unset;
                cursor: pointer;
                font: inherit;
                text-align: left;
                justify-content: space-between;
                align-items: center;
                color: ${themeTool.palette('neutral', 0.87)};
                display: flex;
                padding: 0.25rem 0.5rem;
                margin: 0.5rem;
                background: ${themeTool.palette('secondary', 0.12)};
                width: 10.375rem;

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
                width: calc(12.375rem);
                position: absolute;
                top: 3rem;
                background: ${themeTool.palette('surface')};
                ${themeTool.mixin.border()};
                ${themeTool.mixin.shadow()};
                border-bottom-left-radius: ${themeTool.size.radius};
                border-bottom-right-radius: ${themeTool.size.radius};
                z-index: 3;
            }

            .menu-selector-list-item {
                background-color: transparent;
                border: 0;
                cursor: pointer;
                display: block;
                font: inherit;
                text-align: left;
                padding: 0.75rem 1rem;
                line-height: 1.5rem;
                width: 100%;
                color: ${themeTool.palette('neutral', 0.87)};

                &:hover {
                    background: ${themeTool.palette('secondary', 0.12)};
                    color: ${themeTool.palette('primary')};
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
            selectorWrapper.getBoundingClientRect().left - view.dom.getBoundingClientRect().left
        }px`;
    });
    view.dom.addEventListener('click', () => {
        selectorWrapper.classList.add('fold');
    });

    const selectorValue = document.createElement('span');
    selectorValue.classList.add('menu-selector-value');
    selectorValue.textContent = config.text;

    const selectorButton = utils.themeTool.slots.icon('downArrow');
    selectorButton.setAttribute('aria-hidden', 'true');

    selectorWrapper.appendChild(selector);
    selector.appendChild(selectorValue);
    selector.appendChild(selectorButton);

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
            const [key, info] = params;
            if (typeof key === 'string') {
                ctx.get(commandsCtx).callByName(key, info);
            } else {
                ctx.get(commandsCtx).call(key, info);
            }
            selectorWrapper.classList.add('fold');
        }
    });

    selectorWrapper.appendChild(selectorList);

    if (selectStyle) {
        selectorWrapper.classList.add(selectStyle);
    }

    return selectorWrapper;
};
