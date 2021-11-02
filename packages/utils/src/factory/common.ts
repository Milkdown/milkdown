/* Copyright 2021, Milkdown by Mirone. */
import { Attrs } from '@milkdown/core';

import { CommonOptions } from '../types';

export const getClassName =
    (className: CommonOptions['className']) =>
    (attrs: Attrs, ...defaultValue: (string | null | undefined)[]) => {
        const classList = className?.(attrs) ?? defaultValue;
        return Array.isArray(classList) ? classList.filter((x) => x).join(' ') : classList;
    };
