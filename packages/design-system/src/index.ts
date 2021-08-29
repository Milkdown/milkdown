/* Copyright 2021, Milkdown by Mirone. */
import { injectGlobal } from '@emotion/css';

import { obj2color, obj2var } from './transformer';
import { Color, Font, PR, Size } from './types';

export { Color, Font, Size } from './types';

export type ThemePack = {
    scope?: string;
    color?: { light?: PR<Color>; dark?: PR<Color> } & PR<Color>;
    font?: PR<Font, string[]>;
    size?: PR<Size>;
    mixin?: (utils: Omit<ThemeTool, 'mixin' | 'global'>) => Partial<MixinFactory>;
    global?: (utils: Omit<ThemeTool, 'global'>) => void;
};

export type MixinFactory = {
    icon: (id: string) => string;
    scrollbar: (direction?: 'x' | 'y') => string;
    shadow: () => string;
    border: (direction?: 'left' | 'right' | 'top' | 'bottom') => string;
};

export type ThemeTool = {
    mixin: Partial<MixinFactory>;
    palette: (key: Color, alpha?: number) => string;
    font: PR<Font>;
    size: PR<Size>;
};

export const injectVar = (themePack: ThemePack) => {
    const { color = {}, font, size = {} } = themePack;
    const { light, dark, ...rest } = color;
    const css = injectGlobal;
    css`
        :root {
            ${obj2color(light)};
            ${obj2color(rest)};
            ${obj2var(font, (x) => x.join(', '))};
            ${obj2var(size)};
        }
        [data-theme='dark'] {
            ${obj2color(dark)}
        }
    `;
};

export const pack2Tool = (themePack: ThemePack): ThemeTool => {
    const { font, size = {}, mixin: _mixin, global } = themePack;

    const palette = (key: Color, alpha = 1) => {
        return `rgba(var(--${key}), ${alpha})`;
    };
    const toMap = <T extends string, U>(x: PR<T, U> = {}): PR<T> =>
        Object.fromEntries(
            Object.keys(x).map((k) => {
                return [k, `var(--${k})`];
            }),
        ) as PR<T>;

    const _tool = {
        palette,
        size: toMap(size),
        font: toMap(font),
    };
    const mixin = _mixin?.(_tool) || {};

    const tool = {
        ..._tool,
        mixin,
    };

    global?.(tool);

    return tool;
};
