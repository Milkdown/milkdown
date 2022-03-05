/* Copyright 2021, Milkdown by Mirone. */
import { createThemeSliceKey } from '../manager';
import { Color } from '../types';

export const ThemeColor = createThemeSliceKey<string, [key: Color, opacity?: number]>('color');
export type ThemeColorType = typeof ThemeColor;
