/* Copyright 2021, Milkdown by Mirone. */
import { ThemeIcon, ThemeManager } from '@milkdown/core';
import type { Icon } from '@milkdown/design-system';
import type { Command, Node } from '@milkdown/prose';
import type { Utils } from '@milkdown/utils';

import { injectStyle } from './style';

export const createDropdown = (utils: Utils, className: string) => {
    const div = document.createElement('div');
    div.setAttribute('role', 'listbox');
    div.setAttribute('tabindex', '-1');
    utils.themeManager.onFlush(() => {
        const style = utils.getStyle(injectStyle);

        if (style) {
            div.classList.add(style);
        }
    });

    div.classList.add(className, 'hide');

    return div;
};

type ItemOptions = {
    textClassName: string;
};
export const createDropdownItem = (
    themeManager: ThemeManager,
    text: string,
    icon: Icon,
    options?: Partial<ItemOptions>,
) => {
    const textClassName = options?.textClassName ?? 'text';

    const div = document.createElement('div');
    div.setAttribute('role', 'option');
    div.classList.add('slash-dropdown-item');

    // const iconSpan = themeManager.slots.icon(icon);
    const iconSpan = themeManager.get(ThemeIcon, icon);

    if (!iconSpan) {
        throw new Error('icon not found');
    }

    const textSpan = document.createElement('span');
    textSpan.textContent = text;
    textSpan.className = textClassName;

    div.appendChild(iconSpan.dom);
    div.appendChild(textSpan);

    return div;
};

export const getDepth = (node: Node) => {
    let cur = node;
    let depth = 0;
    while (cur.childCount) {
        cur = cur.child(0);
        depth += 1;
    }

    return depth;
};

const cleanUp: Command = (state, dispatch) => {
    const { selection } = state;
    const { $from } = selection;
    const tr = state.tr.deleteRange($from.start(), $from.pos);
    dispatch?.(tr);
    return false;
};

export const cleanUpAndCreateNode =
    (createCommand: () => void): Command =>
    (state, dispatch, view) => {
        if (view) {
            cleanUp(state, dispatch, view);
            createCommand();
        }
        return true;
    };
