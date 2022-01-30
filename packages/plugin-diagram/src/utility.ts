/* Copyright 2021, Milkdown by Mirone. */
import { Node } from '@milkdown/prose';
import { customAlphabet } from 'nanoid';

export const nanoid = customAlphabet('abcedfghicklmn', 10);

function componentToHex(c: number) {
    const hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
}

function rgbToHex(r: number, g: number, b: number) {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function tryRgbToHex(maybeRgb: string) {
    if (!maybeRgb) return '';

    const result = maybeRgb.split(',').map((x) => Number(x.trim()));

    if (result.length < 3) {
        return maybeRgb;
    }

    const valid = result.every((x) => {
        return x >= 0 && x <= 256;
    });

    if (!valid) {
        return maybeRgb;
    }

    return rgbToHex(...(result as [number, number, number]));
}

export const getId = (node?: Node) => node?.attrs?.['identity'] || nanoid();
