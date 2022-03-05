/* Copyright 2021, Milkdown by Mirone. */
import type { EditorView } from '@milkdown/prose';

import { createThemeSliceKey } from '../manager';

type InputChipRenderer = {
    dom: HTMLElement;
    update: (value: string) => void;
    init: (editorView: EditorView) => void;
    show: (editorView: EditorView) => void;
    hide: () => void;
    destroy: () => void;
};

type InputChipOptions = {
    isBindMode?: boolean;
    buttonText?: string;
    placeHolder?: string;
    onUpdate: (value: string) => void;
};

export const ThemeInputChip = createThemeSliceKey<InputChipRenderer, InputChipOptions, 'input-chip'>('input-chip');
export type ThemeInputChipType = typeof ThemeInputChip;
