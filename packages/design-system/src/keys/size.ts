/* Copyright 2021, Milkdown by Mirone. */
import { createThemeSliceKey } from '../manager';
import { Size } from '../types';

export const ThemeSize = createThemeSliceKey<string, Size, 'size'>('size');
export type ThemeSizeType = typeof ThemeSize;
