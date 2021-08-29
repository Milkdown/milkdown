/* Copyright 2021, Milkdown by Mirone. */
import { Color, PR } from './types';

export const themeColor = (hex: string) => {
    if (hex.startsWith('rgba')) {
        return hex.slice(5, -1).split(',').slice(0, -1).join(',');
    }
    if (hex.startsWith('rgb')) {
        return hex.slice(4, -1);
    }

    const hex2rgb = (hex: string) => {
        const rgbShorthandRegex = /^([a-f\d])([a-f\d])([a-f\d])$/i;
        const rgbRegex = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
        const parse16 = (x: string) => parseInt(x, 16);

        const fullHex = hex.slice(1).replace(rgbShorthandRegex, (_, r, g, b) => {
            return r + r + g + g + b + b;
        });

        const [ok, r, g, b] = fullHex.match(rgbRegex) || [];

        return ok ? [r, g, b].map(parse16) : null;
    };

    const rgb = hex2rgb(hex);
    if (!rgb) {
        console.warn(`Invalid hex: ${hex}`);
        return hex;
    }

    return rgb.join(', ');
};

export const obj2var = <T extends string, U>(x: PR<T, U> = {}, transform = (x: U): string => `${x}`) =>
    Object.entries(x)
        .map(([k, v]) => {
            return `--${k}: ${transform(v as U)};`;
        })
        .join('\n');
export const obj2color = (x: PR<Color> = {}) => obj2var(x, themeColor);
