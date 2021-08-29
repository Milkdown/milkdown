import type { Utils } from '@milkdown/utils';

import { injectStyle } from './style';

export const createInput = (utils: Utils) => {
    const div = document.createElement('div');
    const style = utils.getStyle(injectStyle);
    if (style) {
        div.classList.add(style);
    }

    div.classList.add('tooltip-input');

    const input = document.createElement('input');
    div.appendChild(input);
    const button = document.createElement('button');
    button.textContent = 'APPLY';
    div.appendChild(button);

    input.addEventListener('input', (e) => {
        const { target } = e;
        if (!(target instanceof HTMLInputElement)) {
            return;
        }

        if (!target.value) {
            button.classList.add('disable');
            return;
        }

        button.classList.remove('disable');
    });

    return [div, button] as const;
};
