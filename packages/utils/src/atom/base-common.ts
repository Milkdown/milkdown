import { Attrs, Ctx, Mark, Node, themeToolCtx } from '@milkdown/core';

import { UnknownRecord } from '../type-utility';
import { createKeymap } from './keymap';
import { CommonOptions, Factory, Options, Utils } from './types';

export const getClassName =
    (className: CommonOptions<never>['className']) =>
    (attrs: Attrs, ...defaultValue: (string | null | undefined)[]) => {
        const classList = className?.(attrs) ?? defaultValue;
        return Array.isArray(classList) ? classList.filter((x) => x).join(' ') : classList;
    };

export const commonPlugin = <SupportedKeys extends string, R extends UnknownRecord, T extends Node | Mark>(
    factory: Factory<SupportedKeys, R, T>,
    ctx: Ctx,
    options?: Options<T, SupportedKeys, R>,
): T => {
    const themeTool = ctx.get(themeToolCtx);
    const utils: Utils = {
        getClassName: getClassName(options?.className),
        getStyle: (style) => (options?.headless ? '' : (style(themeTool) as string | undefined)),
    };

    const node = factory(options, utils);
    const view = options?.view ?? node.view;
    const keymap = createKeymap(node.shortcuts, options?.keymap);
    return {
        ...node,
        keymap,
        view,
    };
};
