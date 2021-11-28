/* Copyright 2021, Milkdown by Mirone. */

import { css } from '@emotion/css';
import { Icon } from '@milkdown/design-system';
import { Utils } from '@milkdown/utils';

export type ButtonConfig = {
    type: 'button';
    icon: Icon;
};

export const button = (utils: Utils, config: ButtonConfig) => {
    const buttonStyle = utils.getStyle((themeTool) => {
        return css`
            width: 1.5rem;
            height: 1.5rem;
            padding: 0.25rem;
            margin: 0.5rem;
            flex-shrink: 0;

            display: flex;
            justify-content: center;
            align-items: center;

            background-color: ${themeTool.palette('surface')};
            color: ${themeTool.palette('solid')};
            transition: all 0.4s ease-in-out;

            cursor: pointer;

            &:hover {
                background-color: ${themeTool.palette('secondary', 0.12)};
                color: ${themeTool.palette('primary')};
            }
        `;
    });

    const $button = document.createElement('div');
    if (buttonStyle) {
        $button.classList.add(buttonStyle);
    }
    const $icon = utils.themeTool.slots.icon(config.icon);
    $button.appendChild($icon);
    return $button;
};
