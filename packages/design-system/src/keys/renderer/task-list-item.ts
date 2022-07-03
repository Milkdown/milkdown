/* Copyright 2021, Milkdown by Mirone. */
import type { Node } from '@milkdown/prose/model';

import { createThemeSliceKey } from '../../manager';

type ThemeRenderer = {
    dom: HTMLElement;
    contentDOM: HTMLElement;
    onUpdate: (node: Node) => void;
};
type ThemeOptions = {
    editable: () => boolean;
    onChange: (selected: boolean) => void;
};
export const ThemeTaskListItem = createThemeSliceKey<ThemeRenderer, ThemeOptions, 'task-list-item'>('task-list-item');
export type ThemeTaskListItemType = typeof ThemeTaskListItem;
