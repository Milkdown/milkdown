/* Copyright 2021, Milkdown by Mirone. */
import { Color, Font, Icon, IconValue, Size } from '@milkdown/design-system';

import { createThemeSliceKey } from './manager';

export const ColorKey = createThemeSliceKey<string, [key: Color, opacity?: number]>('color');
export const SizeKey = createThemeSliceKey<string, Size>('size');
export const FontKey = createThemeSliceKey<string[], Font>('font');

export const ScrollbarKey = createThemeSliceKey<string, 'x' | 'y' | undefined>('scrollbar');
export const ShadowKey = createThemeSliceKey<string>('shadow');
export const BorderKey = createThemeSliceKey<string, 'left' | 'right' | 'top' | 'bottom'>('border');
export const IconKey = createThemeSliceKey<IconValue, Icon>('icon');
export const GlobalKey = createThemeSliceKey('global');
export const internalThemeKeys = [
    ColorKey,
    SizeKey,
    FontKey,
    ScrollbarKey,
    ShadowKey,
    BorderKey,
    IconKey,
    GlobalKey,
] as const;

export type ColorKeyType = typeof ColorKey;
export type SizeKeyType = typeof SizeKey;
export type FontKeyType = typeof FontKey;

export type ScrollbarKeyType = typeof ScrollbarKey;
export type ShadowKeyType = typeof ShadowKey;
export type BorderKeyType = typeof BorderKey;
export type IconKeyType = typeof IconKey;
export type GlobalKeyType = typeof GlobalKey;
