/* Copyright 2021, Milkdown by Mirone. */
import type { Node } from '@milkdown/prose/model';

import { createThemeSliceKey } from '../../manager';

type ThemeOptions = {
    isBlock: boolean;
    placeholder: string;
    onError?: (img: HTMLImageElement) => void;
    onLoad?: (img: HTMLImageElement) => void;
};
type ThemeRenderer = {
    dom: HTMLElement;
    onUpdate: (node: Node) => void;
};

export const ThemeImage = createThemeSliceKey<ThemeRenderer, ThemeOptions, 'image'>('image');
export type ThemeImageType = typeof ThemeImage;
