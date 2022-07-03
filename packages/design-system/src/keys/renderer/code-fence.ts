/* Copyright 2021, Milkdown by Mirone. */
import type { Node } from '@milkdown/prose/model';

import { createThemeSliceKey } from '../../manager';

type ThemeOptions = {
    onSelectLanguage: (language: string) => void;
    editable: () => boolean;
    onFocus: () => void;
    onBlur: () => void;
    languageList: string[];
};
type ThemeRenderer = {
    dom: HTMLElement;
    contentDOM: HTMLElement;
    onUpdate: (node: Node) => void;
    onDestroy: () => void;
};
export const ThemeCodeFence = createThemeSliceKey<ThemeRenderer, ThemeOptions, 'code-fence'>('code-fence');
export type ThemeCodeFenceType = typeof ThemeCodeFence;
