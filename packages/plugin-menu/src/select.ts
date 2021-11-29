/* Copyright 2021, Milkdown by Mirone. */

import { css } from '@emotion/css';
import { EditorView } from '@milkdown/prose';
import { Utils } from '@milkdown/utils';

import type { CommonConfig } from './default-config';

export type SelectConfig<Options extends string[] = string[]> = {
    type: 'select';
    options: Options;
    active?: (view: EditorView) => Options;
} & CommonConfig;

export const select = (utils: Utils, config: SelectConfig) => {
    const selectStyle = utils.getStyle((themeTool) => {
        return css`
            width: 12.375rem;
            flex-shrink: 0;
            position: relative;
            cursor: pointer;
            font-weight: 500;
            font-size: 0.875rem;

            ${themeTool.mixin.border('right')};
            ${themeTool.mixin.border('left')};

            .menu-selector {
                justify-content: space-between;
                align-items: center;
                color: ${themeTool.palette('neutral', 0.87)};
                display: flex;
                position: relative;
                padding: 0.25rem 0.5rem;
                margin: 0.5rem;
                background: ${themeTool.palette('secondary', 0.12)};
            }

            .menu-selector-value {
                flex: 1;
                white-space: nowrap;
                text-overflow: ellipsis;
            }

            .menu-selector-list {
                position: absolute;
                top: 3rem;
                left: calc(${themeTool.size.lineWidth} * -1);
                right: calc(${themeTool.size.lineWidth} * -1);
                background: ${themeTool.palette('surface')};
                ${themeTool.mixin.border()};
                ${themeTool.mixin.shadow()};
                border-bottom-left-radius: ${themeTool.size.radius};
                border-bottom-right-radius: ${themeTool.size.radius};
                z-index: 1;
            }

            .menu-selector-list-item {
                padding: 0.75rem 1rem;
                line-height: 1.5rem;
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

    const selector = document.createElement('div');
    selector.classList.add('menu-selector', 'fold');
    selector.addEventListener('mousedown', (e) => {
        e.preventDefault();
        selectorWrapper.classList.toggle('fold');
    });

    const selectorValue = document.createElement('span');
    selectorValue.classList.add('menu-selector-value');
    selectorValue.textContent = config.options[0];

    const selectorButton = utils.themeTool.slots.icon('downArrow');

    selectorWrapper.appendChild(selector);
    selector.appendChild(selectorValue);
    selector.appendChild(selectorButton);

    const selectorList = document.createElement('div');
    selectorList.classList.add('menu-selector-list');
    config.options.forEach((option) => {
        const selectorListItem = document.createElement('div');
        selectorListItem.textContent = option;
        selectorListItem.classList.add('menu-selector-list-item');
        selectorList.appendChild(selectorListItem);
    });

    selectorWrapper.appendChild(selectorList);

    if (selectStyle) {
        selectorWrapper.classList.add(selectStyle);
    }

    return selectorWrapper;
};
