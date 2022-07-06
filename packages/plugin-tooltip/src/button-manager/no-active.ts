/* Copyright 2021, Milkdown by Mirone. */
import { EditorView } from '@milkdown/prose/view';

import { ButtonList } from '../item';

export const noActive = (buttonMap: ButtonList, view: EditorView) => {
    return Object.values(buttonMap)
        .filter((item) => item.enable(view) && item.$ != null)
        .every(({ $ }) => $.classList.contains('hide'));
};
