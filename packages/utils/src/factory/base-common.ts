/* Copyright 2021, Milkdown by Mirone. */
import { Attrs, Ctx, themeToolCtx } from '@milkdown/core';
import { themeMustInstalled } from '@milkdown/exception';

import { CommonOptions, Utils } from '../types';

export const getClassName =
    (className: CommonOptions['className']) =>
    (attrs: Attrs, ...defaultValue: (string | null | undefined)[]) => {
        const classList = className?.(attrs) ?? defaultValue;
        return Array.isArray(classList) ? classList.filter((x) => x).join(' ') : classList;
    };

export const commonPlugin = <Ret, Op extends CommonOptions>(
    factory: (options: Op | undefined, utils: Utils) => Ret,
    ctx: Ctx,
    options?: Op,
): Ret => {
    try {
        const themeTool = ctx.get(themeToolCtx);
        const utils: Utils = {
            ctx,
            getClassName: getClassName(options?.className),
            getStyle: (style) => (options?.headless ? '' : (style(themeTool) as string | undefined)),
        };

        return factory(options, utils);
    } catch {
        throw themeMustInstalled();
    }
};
