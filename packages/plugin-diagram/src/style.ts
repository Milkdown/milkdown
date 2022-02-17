/* Copyright 2021, Milkdown by Mirone. */

import { getPalette, ThemeManager } from '@milkdown/core';

export const getStyle = (themeManager: ThemeManager) => {
    const palette = getPalette(themeManager);
    const line = palette('line');
    const solid = palette('solid');
    const neutral = palette('neutral');
    const background = palette('background');
    const style = {
        background,
        primaryColor: background,
        secondaryColor: line,
        primaryTextColor: neutral,
        noteBkgColor: background,
        noteTextColor: solid,
        fontSize: '1em',
    };
    return Object.entries(style)
        .filter(([_, value]) => value.length > 0)
        .map(([key, value]) => `'${key}':'${value}'`)
        .join(', ');
};
