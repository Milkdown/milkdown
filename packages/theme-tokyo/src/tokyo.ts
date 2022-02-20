/* Copyright 2021, Milkdown by Mirone. */
import type { Color } from '@milkdown/design-system';

export const lightColor: Record<Color, string> = {
    shadow: '#33635c',
    primary: '#8c4351',
    secondary: '#34548a',
    neutral: '#0f0f14',
    solid: '#343b58',
    line: '#8f5e15',
    background: '#dcdee3',
    surface: '#d5d6db',
};

export const darkColor: Record<Color, string> = {
    shadow: '#a9b1d6',
    primary: '#f7768e',
    secondary: '#e0af68',
    neutral: '#c0caf5',
    solid: '#7dcfff',
    line: '#bb9af7',
    background: '#1a1b26',
    surface: '#24283b',
};

export const color = {
    lightColor,
    darkColor,
} as const;
