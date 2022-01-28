/* Copyright 2021, Milkdown by Mirone. */

import { CmdKey, commandsCtx, Ctx } from '@milkdown/core';
import type { Icon } from '@milkdown/design-system';
import type { EditorView } from '@milkdown/prose';
import type { Utils } from '@milkdown/utils';

import type { CommonConfig } from './default-config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ButtonConfig<T = any> = {
    type: 'button';
    icon: Icon;
    active?: (view: EditorView) => boolean;
    key: CmdKey<T> | string;
    options?: T;
} & CommonConfig;

export const button = (utils: Utils, config: ButtonConfig, ctx: Ctx) => {
    const buttonStyle = utils.getStyle((themeTool, { css }) => {
        return css`
            border: 0;
            box-sizing: unset;
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

            &.active,
            &:hover {
                background-color: ${themeTool.palette('secondary', 0.12)};
                color: ${themeTool.palette('primary')};
            }

            &:disabled {
                display: none;
            }
        `;
    });

    const $button = document.createElement('button');
    $button.setAttribute('type', 'button');
    $button.classList.add('button');
    if (buttonStyle) {
        $button.classList.add(buttonStyle);
    }
    const $label = utils.themeTool.slots.label(config.icon);
    if ($label) {
        $button.setAttribute('aria-label', $label);
        $button.setAttribute('title', $label);
    }
    const $icon = utils.themeTool.slots.icon(config.icon);
    $button.appendChild($icon);
    $button.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof config.key === 'string') {
            ctx.get(commandsCtx).callByName(config.key, config.options);
            return;
        }
        ctx.get(commandsCtx).call(config.key, config.options);
    });
    return $button;
};
