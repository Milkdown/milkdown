/* Copyright 2021, Milkdown by Mirone. */
import { createThemeSliceKey } from '../manager'

export const ThemeScrollbar = createThemeSliceKey<
    string,
    [direction?: 'x' | 'y', type?: 'normal' | 'thin'] | undefined,
    'scrollbar'
>('scrollbar')
export type ThemeScrollbarType = typeof ThemeScrollbar
