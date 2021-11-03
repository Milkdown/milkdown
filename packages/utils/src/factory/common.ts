/* Copyright 2021, Milkdown by Mirone. */
import { Attrs, CmdKey } from '@milkdown/core';

import { CommandConfig, CommonOptions } from '../types';

export const getClassName =
    (className: CommonOptions['className']) =>
    (attrs: Attrs, ...defaultValue: (string | null | undefined)[]) => {
        const classList = className?.(attrs) ?? defaultValue;
        return Array.isArray(classList) ? classList.filter((x) => x).join(' ') : classList;
    };

export const createShortcut = <T>(commandKey: CmdKey<T>, defaultKey: string, args?: T) =>
    [commandKey, defaultKey, args] as CommandConfig<unknown>;
