/* Copyright 2021, Milkdown by Mirone. */
import { createThemeSliceKey } from './manager';
import type { Color, Font, Icon, IconValue, Size } from './types';

export const ThemeColor = createThemeSliceKey<string, [key: Color, opacity?: number]>('color');
export const ThemeSize = createThemeSliceKey<string, Size, 'size'>('size');
export const ThemeFont = createThemeSliceKey<string, Font, 'font'>('font');

export const ThemeScrollbar = createThemeSliceKey<
    string,
    [direction?: 'x' | 'y', type?: 'normal' | 'thin'] | undefined,
    'scrollbar'
>('scrollbar');
export const ThemeShadow = createThemeSliceKey<string, undefined, 'shadow'>('shadow');
export const ThemeBorder = createThemeSliceKey<string, 'left' | 'right' | 'top' | 'bottom' | undefined, 'border'>(
    'border',
);
export const ThemeIcon = createThemeSliceKey<IconValue, Icon, 'icon'>('icon');
export const internalThemeKeys = [
    ThemeColor,
    ThemeSize,
    ThemeFont,
    ThemeScrollbar,
    ThemeShadow,
    ThemeBorder,
    ThemeIcon,
] as const;

export type ThemeColorType = typeof ThemeColor;
export type ThemeSizeType = typeof ThemeSize;
export type ThemeFontType = typeof ThemeFont;

export type ThemeScrollbarType = typeof ThemeScrollbar;
export type ThemeShadowType = typeof ThemeShadow;
export type ThemeBorderType = typeof ThemeBorder;
export type ThemeIconType = typeof ThemeIcon;
