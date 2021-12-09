/* Copyright 2021, Milkdown by Mirone. */
import { injectGlobal } from '@emotion/css';

import * as D from './default-value';
import { obj2color, obj2var } from './transformer';
import { Color, PR, ThemePack, ThemeTool } from './types';

export const injectVar = (themePack: ThemePack) => {
    const { color = {}, font, size = {} } = themePack;
    const css = injectGlobal;
    css`
        :root {
            ${obj2color(color)};
            ${obj2var(font, (x) => x.join(', '))};
            ${obj2var(size)};
        }
    `;
};

export const pack2Tool = (themePack: ThemePack): ThemeTool => {
    const { font, size = {}, mixin: _mixin, slots: _slots, global } = themePack;

    const palette = (key: Color, alpha = 1) => {
        return `rgba(var(--${key}), ${alpha})`;
    };
    const toMap = <T extends string, U>(x: PR<T, U> = {}): PR<T> =>
        Object.fromEntries(
            Object.keys(x).map((k) => {
                return [k, `var(--${k})`];
            }),
        ) as PR<T>;

    const mixinTool: Pick<ThemeTool, 'palette' | 'size' | 'font'> = {
        palette,
        size: {
            ...D.size,
            ...toMap(size),
        },
        font: {
            ...D.font,
            ...toMap(font),
        },
    };
    const mixin = {
        ...D.mixin,
        ..._mixin?.(mixinTool),
    };

    const slotsTool: typeof mixinTool & { mixin: typeof mixin } = {
        ...mixinTool,
        mixin,
    };

    const slots = {
        ...D.slots,
        ..._slots?.(slotsTool),
    };

    const tool: ThemeTool = {
        ...slotsTool,
        slots,
    };

    global?.(tool);

    return tool;
};

export type { Color, Font, Icon, Size, ThemePack, ThemeTool } from './types';
