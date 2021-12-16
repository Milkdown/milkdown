/* Copyright 2021, Milkdown by Mirone. */

import type { ThemeTool } from './types';

export const font: ThemeTool['font'] = {
    typography: '',
    code: '',
};

export const size: ThemeTool['size'] = {
    radius: '0',
    lineWidth: '1px',
};

export const mixin: ThemeTool['mixin'] = {
    scrollbar: () => '',
    shadow: () => '',
    border: () => '',
};

export const slots: ThemeTool['slots'] = {
    icon: (id: string) => {
        const div = document.createElement('div');
        div.className = 'milkdown-icon';
        div.textContent = id;
        return div;
    },
    label: (id: string) => {
        return id;
    },
};
