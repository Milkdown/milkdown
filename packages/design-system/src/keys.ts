/* Copyright 2021, Milkdown by Mirone. */
import { createThemeSliceKey } from './manager';
import type { Color, Font, Icon, IconValue, Size } from './types';

export const ThemeColor = createThemeSliceKey<string, [key: Color, opacity?: number]>('color');
export const ThemeSize = createThemeSliceKey<string, Size>('size');
export const ThemeFont = createThemeSliceKey<string, Font>('font');

export const ThemeScrollbar = createThemeSliceKey<string, 'x' | 'y' | undefined>('scrollbar');
export const ThemeShadow = createThemeSliceKey<string>('shadow');
export const ThemeBorder = createThemeSliceKey<string, 'left' | 'right' | 'top' | 'bottom'>('border');
export const ThemeIcon = createThemeSliceKey<IconValue, Icon>('icon');
export const ThemeGlobal = createThemeSliceKey('global');
export const internalThemeKeys = [
    ThemeColor,
    ThemeSize,
    ThemeFont,
    ThemeScrollbar,
    ThemeShadow,
    ThemeBorder,
    ThemeIcon,
    ThemeGlobal,
] as const;

export type ThemeColorType = typeof ThemeColor;
export type ThemeSizeType = typeof ThemeSize;
export type ThemeFontType = typeof ThemeFont;

export type ThemeScrollbarType = typeof ThemeScrollbar;
export type ThemeShadowType = typeof ThemeShadow;
export type ThemeBorderType = typeof ThemeBorder;
export type ThemeIconType = typeof ThemeIcon;
export type ThemeGlobalType = typeof ThemeGlobal;
