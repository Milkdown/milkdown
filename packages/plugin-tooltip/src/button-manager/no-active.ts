/* Copyright 2021, Milkdown by Mirone. */
import { EditorView } from '@milkdown/prose/view';

import { ButtonMap } from '../item';

export const noActive = (buttonMap: ButtonMap, view: EditorView) => {
    return Object.values(buttonMap)
        .filter((item) => item.enable(view) && item.$ != null)
        .every(({ $ }) => $.classList.contains('hide'));
};
