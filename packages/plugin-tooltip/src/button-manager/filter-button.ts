/* Copyright 2021, Milkdown by Mirone. */
import { EditorView } from '@milkdown/prose';

import { ButtonMap } from '../item';
import { noActive } from './no-active';

export const filterButton = (buttonMap: ButtonMap, view: EditorView) => {
    Object.values(buttonMap)
        .filter((item) => item.enable(view))
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

    return noActive(buttonMap, view);
};
