import type { Ctx } from '@milkdown/core';

import { injectStyle } from './style';

export const createInput = (ctx: Ctx) => {
    const div = document.createElement('div');
    const style = injectStyle(ctx);

    div.classList.add('tooltip-input', style);

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
