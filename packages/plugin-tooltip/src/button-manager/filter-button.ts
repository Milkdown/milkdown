/* Copyright 2021, Milkdown by Mirone. */
import { EditorView } from '@milkdown/prose/view';

import { ButtonList } from '../item';
import { noActive } from './no-active';

export const filterButton = (buttons: ButtonList, view: EditorView) => {
    buttons
        .filter((item) => item.enable(view) && item.$ != null)
        .forEach((item) => {
            const disable = item.disable?.(view);
            if (disable) {
                item.$.classList.add('hide');
                return;
            }

            item.$.classList.remove('hide');

            const active = item.active(view);
            if (active) {
                item.$.classList.add('active');
                return;
            }
            item.$.classList.remove('active');
        });

    return noActive(buttons, view);
};
