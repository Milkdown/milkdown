/* Copyright 2021, Milkdown by Mirone. */

import { tryRgbToHex } from './utility';

export const getStyle = () => {
    return () => {
        const styleRoot = getComputedStyle(document.documentElement);
        const getColor = (v: string) => tryRgbToHex(styleRoot.getPropertyValue('--' + v));
        const line = getColor('line');
        const solid = getColor('solid');
        const neutral = getColor('neutral');
        const background = getColor('background');
        const style = {
            background,
            primaryColor: background,
            secondaryColor: line,
            primaryTextColor: neutral,
            noteBkgColor: background,
            noteTextColor: solid,
        };
        return Object.entries(style)
            .filter(([_, value]) => value.length > 0)
            .map(([key, value]) => `'${key}':'${value}'`)
            .join(', ');
    };
};
